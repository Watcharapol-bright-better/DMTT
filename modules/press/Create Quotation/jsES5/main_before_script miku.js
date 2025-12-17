// ============================
// 0) ฟังก์ชันแปลงเดือน
// ============================

function normalizeMonthDate(raw) {
    if (!raw) return null;

    if (Object.prototype.toString.call(raw) === "[object Date]") {
        if (!isNaN(raw.getTime())) {
            var y = raw.getFullYear();
            var m = ("0" + (raw.getMonth() + 1)).slice(-2);
            return y + "-" + m + "-01";
        }
        return null;
    }

    var s = String(raw).trim();
    if (!s) return null;

    s = s.replace(/\[|\]/g, "").replace("ICT", "").trim();

    var d = new Date(s);
    if (!isNaN(d.getTime())) {
        var y0 = d.getFullYear();
        var m0 = ("0" + (d.getMonth() + 1)).slice(-2);
        return y0 + "-" + m0 + "-01";
    }

    var parts = s.split(/[\/\-]/);
    if (parts.length === 2) {
        var p1 = parseInt(parts[0], 10);
        var p2 = parseInt(parts[1], 10);
        if (!isNaN(p1) && !isNaN(p2)) {
            var yyyy, mm;
            if (String(parts[1]).length === 4) {
                mm = p1;
                yyyy = p2;
            } else {
                yyyy = p1;
                mm = p2;
            }
            if (mm >= 1 && mm <= 12) {
                return yyyy + "-" + ("0" + mm).slice(-2) + "-01";
            }
        }
    }

    return null;
}

function normalizeMonthStr(raw) {
    if (!raw) return null;
    var s = String(raw).trim();

    var d = new Date(s);
    if (isNaN(d.getTime())) {
        var parts = s.split(/[\/\-]/);
        if (parts.length === 2) {
            var mm = parseInt(parts[0], 10);
            var yyyy = parseInt(parts[1], 10);
            if (!isNaN(mm) && !isNaN(yyyy) && mm >= 1 && mm <= 12) {
                d = new Date(yyyy, mm - 1, 1);
            }
        }
    }
    if (isNaN(d.getTime())) return null;

    var y = d.getFullYear();
    var m = ("0" + (d.getMonth() + 1)).slice(-2);
    return "" + y + m;   // 'YYYYMM'
}

// ============================
// 1) Prefix QYYMM จาก I_QT_MTH หรือวันที่ปัจจุบัน
// ============================
function getQuotationPrefix(header) {
    var qtM = header["I_QT_MTH"];
    var dt = null;

    if (qtM) {
        var parsed = normalizeMonthDate(qtM);
        if (parsed) {
            dt = new Date(parsed);
        }
    }
    if (!dt || isNaN(dt.getTime())) {
        dt = new Date();
    }

    var yy = String(dt.getFullYear()).slice(-2);
    var mm = ("0" + (dt.getMonth() + 1)).slice(-2);
    return "Q" + yy + mm;
}

// ============================
// 2) ดึง MAX(I_QT_NO) จาก DB (ใช้ TalonDbUtil.select เป็นหลัก)
// ============================
function getMaxQuotationFromDb(prefix) {
    var sql = ""
      + "SELECT MAX(I_QT_NO) AS MAX_NO "
      + "FROM T_PR_QT "
      + "WHERE I_QT_NO LIKE '" + prefix + "%'";

    var maxNo = null;

    try {
        // กรณีส่วนใหญ่ในระบบคุณ: ใช้ select() แล้วได้เป็น array ของ map
        if (TalonDbUtil && typeof TalonDbUtil.select === "function") {
            var list = TalonDbUtil.select(TALON.getDbConfig(), sql);
            if (list && list.length > 0 && list[0]) {
                var row = list[0];
                // เผื่อเรื่องตัวพิมพ์ใหญ่/เล็ก
                maxNo = row["MAX_NO"] || row["max_no"] || row["MaxNo"] || null;
            }
        }
        // เผื่ออนาคตมี executeSelectSQL/executeQuerySQL
        else if (TalonDbUtil &&
                 (typeof TalonDbUtil.executeSelectSQL === "function" ||
                  typeof TalonDbUtil.executeQuerySQL  === "function")) {

            var rs;
            if (typeof TalonDbUtil.executeSelectSQL === "function") {
                rs = TalonDbUtil.executeSelectSQL(TALON.getDbConfig(), sql);
            } else {
                rs = TalonDbUtil.executeQuerySQL(TALON.getDbConfig(), sql);
            }

            try {
                if (rs && rs.next()) {
                    try {
                        maxNo = rs.getString("MAX_NO");
                    } catch (e2) {
                        maxNo = rs.getString(1);
                    }
                }
            } finally {
                if (rs) rs.close();
            }
        } else {
            TALON.addMsg("INFO: No usable DB select method; skip MAX(I_QT_NO).");
        }
    } catch (e) {
        TALON.addMsg("WARN: DB select failed in getMaxQuotationFromDb: " + e);
        maxNo = null;
    }

    TALON.addMsg("MAX I_QT_NO for prefix " + prefix + " = " + maxNo);
    return maxNo;
}


// ============================
// 3) Generate Quotation No → QYYMM**
// ============================
function generateQuotationNo(header) {
    var prefix  = getQuotationPrefix(header);   // QYYMM
    var running = null;

    var maxNo = getMaxQuotationFromDb(prefix);  // เช่น Q251101
    if (maxNo) {
        var suffix = maxNo.substring(prefix.length);   // "01"
        var num    = parseInt(suffix, 10);
        if (!isNaN(num) && num >= 0) {
            running = num + 1;
        }
    }

    if (running === null || isNaN(running) || running <= 0) {
        running = 1;
    }

    if (running > 99) {
        TALON.addMsg("WARN: running no. > 99 for prefix " + prefix + ": " + running);
    }

    var suffixStr = ("0" + running).slice(-2);
    var newNo = prefix + suffixStr;
    TALON.addMsg("New Quotation No = " + newNo);
    return newNo;
}

// ============================
// 4) Header / Detail / User
// ============================
var userData = TALON.getUserInfoMap();
var HEADER   = TALON.getBlockData_Card(1);
var DETAIL   = TALON.getBlockData_List(2);

var CSCODE   = HEADER["I_CSCODE"];

// เก็บค่าเดิมก่อน
var originalQtNo = HEADER["I_QT_NO"];
var isNew        = !originalQtNo || String(originalQtNo).trim() === "";

var QUOTATIONNO;

// ถ้าใบใหม่ → generate Q; ถ้าใบเก่า → ใช้เลขเดิม
if (isNew) {
    QUOTATIONNO = generateQuotationNo(HEADER);
    HEADER["I_QT_NO"] = QUOTATIONNO;
} else {
    QUOTATIONNO = originalQtNo;
}

// แปลงค่าตาม datatype ของ column
var QT_MONTH   = normalizeMonthDate(HEADER["I_QT_MTH"]);       // date
var METALPRICE = normalizeMonthStr(HEADER["I_METAL_PRICE"]);   // nvarchar(7) YYYYMM
var EXG_MONTH  = normalizeMonthDate(HEADER["I_EXG_MONTH"]);    // date
var PO_MONTH   = normalizeMonthDate(HEADER["I_PO_MONTH"]);     // date

TALON.addMsg("RAW I_QT_MTH      = " + HEADER["I_QT_MTH"]);
TALON.addMsg("RAW I_EXG_MONTH   = " + HEADER["I_EXG_MONTH"]);
TALON.addMsg("RAW I_PO_MONTH    = " + HEADER["I_PO_MONTH"]);
TALON.addMsg("RAW I_METAL_PRICE = " + HEADER["I_METAL_PRICE"]);
TALON.addMsg(
  "AFTER normalize → QT_MONTH=" + QT_MONTH +
  ", EXG_MONTH=" + EXG_MONTH +
  ", PO_MONTH=" + PO_MONTH +
  ", METALPRICE=" + METALPRICE
);

var EXG_RATE = HEADER["I_EXG_RATE"] || 0;
var CURRENCY = HEADER["I_CURRENCY"] || null;
var REMARK   = HEADER["I_REM1"]     || null;
var USERID   = userData["USER_ID"];

// ============================
// 5) ตรวจ header จำเป็น
// ============================
if (!CSCODE || CSCODE === "") {
    TALON.addErrorMsg("Missing Customer Code (I_CSCODE). Cannot insert to T_PR_QT.");
    TALON.setIsSuccess(false);
} else if (!QUOTATIONNO || QUOTATIONNO === "") {
    TALON.addErrorMsg("Missing Quotation No (I_QT_NO). Cannot insert to T_PR_QT.");
    TALON.setIsSuccess(false);
} else {

    // 5.1 ถ้าเป็น "แก้ไขใบเดิม" เท่านั้นถึงจะลบ detail เดิม
    if (!isNew) {
        var deleteSql = "DELETE FROM T_PR_QT WHERE I_QT_NO = '" + QUOTATIONNO + "';";
        TalonDbUtil.executeUpdateSQL(TALON.getDbConfig(), deleteSql);
        TALON.addMsg("Deleted old rows for quotation: " + QUOTATIONNO);
    }

    // ============================
    // 6) INSERT DETAIL → T_PR_QT (เฉพาะแถวที่ I_SELECTED = 1 และมี I_ITEMCODE)
    // ============================
    var lineNo   = 1;
    var seenItem = {};
    
    for (var i = 0; i < DETAIL.length; i++) {
        var row = DETAIL[i];
        if (!row) continue;
    
        // ถ้ามี I_SELECTED และค่า != '1' ให้ข้าม
        if (typeof row["I_SELECTED"] !== "undefined") {
            var sel = String(row["I_SELECTED"] || "").trim();
            if (sel !== "1") {
                TALON.addMsg(
                  "Skipped row " + (i + 1) +
                  " because I_SELECTED = '" + sel + "' (not selected)"
                );
                continue;
            }
        }
    
        var ITEMCODE = (row["I_ITEMCODE"] || "").trim();
        if (ITEMCODE === "") {
            TALON.addMsg("Skipped row " + (i + 1) + " because I_ITEMCODE is empty.");
            continue;
        }
    
        if (seenItem[ITEMCODE]) {
            TALON.addMsg(
              "Skipped row " + (i + 1) +
              " because I_ITEMCODE '" + ITEMCODE + "' is duplicated in DETAIL."
            );
            continue;
        }
        seenItem[ITEMCODE] = true;
    
        var COMMODITY  = row["I_COMMODITY"]   || "";
        var THICK      = row["I_THICK"]       || 0;
        var WIDTH      = row["I_WIDTH"]       || 0;
        var PROD_WGT   = row["I_PROD_WGT"]    || 0;
        var RM_WGT     = row["I_RM_WGT"]      || 0;
        var LOSS_WGT   = row["I_LOSS_WGT"]    || 0;
        var PITCH      = row["I_PITCH"]       || 0;
        var RM_AMT     = row["I_RM_AMT"]      || 0;
        var LOSS_AMT   = row["I_LOSS_AMT"]    || 0;
        var FEE_PROC   = row["I_FEE_PROCESS"] || 0;
        var FEE_CUST   = row["I_FEE_CUSTOM"]  || 0;
        var FEE_PACK   = row["I_FEE_PACK"]    || 0;
        var FEE_EXP    = row["I_FEE_EXPENSE"] || 0;
        var FEE_DLY    = row["I_FEE_DLY"]     || 0;

        var insertSql = ""
          + "INSERT INTO T_PR_QT ("
          + " I_QT_NO, I_QT_LN, I_CSCODE, "
          + " I_QT_MTH, I_METAL_PRICE, I_EXG_MONTH, I_PO_MONTH, I_EXG_RATE, "
          + " I_ITEMCODE, I_COMMODITY, I_THICK, I_WIDTH, I_PROD_WGT, I_RM_WGT, I_LOSS_WGT, I_PITCH, "
          + " I_RM_AMT, I_LOSS_AMT, I_FEE_PROCESS, I_FEE_CUSTOM, I_FEE_PACK, I_FEE_EXPENSE, I_FEE_DLY, "
          + " I_CURRENCY, I_REM1, I_TYPE, CREATED_DATE, CREATED_BY, CREATED_PRG_NM, "
          + " UPDATED_DATE, UPDATED_BY, UPDATED_PRG_NM, MODIFY_COUNT)"
          + " VALUES ("
          + " '" + QUOTATIONNO + "',"
          + " "  + lineNo + ","              
          + " '" + CSCODE + "',"
          + (QT_MONTH   ? " '" + QT_MONTH   + "'," : " NULL,")
          + (METALPRICE ? " N'" + METALPRICE + "'," : " NULL,")
          + (EXG_MONTH  ? " '" + EXG_MONTH  + "'," : " NULL,")
          + (PO_MONTH   ? " '" + PO_MONTH   + "'," : " NULL,")
          + " "  + EXG_RATE + ","
          + " '" + ITEMCODE + "',"
          + " '" + COMMODITY + "',"
          + " "  + THICK + ","
          + " "  + WIDTH + ","
          + " "  + PROD_WGT + ","
          + " "  + RM_WGT + ","
          + " "  + LOSS_WGT + ","
          + " "  + PITCH + ","
          + " "  + RM_AMT + ","
          + " "  + LOSS_AMT + ","
          + " "  + FEE_PROC + ","
          + " "  + FEE_CUST + ","
          + " "  + FEE_PACK + ","
          + " "  + FEE_EXP + ","
          + " "  + FEE_DLY + ","
          + (CURRENCY ? " N'" + CURRENCY + "'," : " NULL,")
          + (REMARK   ? " N'" + REMARK   + "'," : " NULL,")
          + " '0',"                    // I_TYPE default
          + " GETDATE(),"              
          + " '" + USERID + "',"       
          + " 'DMTT_PRESS',"
          + " GETDATE(),"
          + " '" + USERID + "',"
          + " 'DMTT_PRESS',"
          + " 0"
          + " )";

        TALON.addMsg("DEBUG SQL = " + insertSql);
        TalonDbUtil.executeUpdateSQL(TALON.getDbConfig(), insertSql);

        lineNo++;
    }

    // ============================
    // 7) UPDATE I_TYPE จาก MS_PRFG → T_PR_QT
    // ============================
    var sqlUpdateType = ""
      + "UPDATE tq "
      + "SET "
      + "  tq.I_TYPE         = ISNULL(mp.I_QTPATTERN, tq.I_TYPE), "
      + "  tq.UPDATED_DATE   = GETDATE(), "
      + "  tq.UPDATED_BY     = '" + USERID + "', "
      + "  tq.UPDATED_PRG_NM = 'DMTT_PRESS', "
      + "  tq.MODIFY_COUNT   = ISNULL(tq.MODIFY_COUNT, 0) + 1 "
      + "FROM T_PR_QT tq "
      + "LEFT JOIN MS_PRFG mp "
      + "  ON mp.I_ITEMCODE = tq.I_ITEMCODE "
      + "WHERE tq.I_QT_NO = '" + QUOTATIONNO + "';";

    var updatedRows = TalonDbUtil.executeUpdateSQL(TALON.getDbConfig(), sqlUpdateType);
    TALON.addMsg("Updated I_TYPE rows: " + updatedRows);
}
