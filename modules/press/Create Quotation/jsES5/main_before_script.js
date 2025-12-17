

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
// 4) Header / Detail / User
// ============================
var userData = TALON.getUserInfoMap();
var HEADER   = TALON.getBlockData_Card(1);
var DETAIL   = TALON.getBlockData_List(2);

var CSCODE   = HEADER["I_CSCODE"];



var getNumbering = 
    "DECLARE @Id NVARCHAR(MAX) " + 
    "EXEC SP_RUN_NUMBERING_V1 " + 
    " @CodeType = 'DMTT_N_QT', " + 
    " @Format = N'QUTyyyymmxxx', " + 
    " @GeneratedNo = @Id OUTPUT " + 
    "SELECT @Id AS [NUMBERING] ";

var QUOTATIONNO = TalonDbUtil.select(TALON.getDbConfig(), getNumbering )[0]['NUMBERING'];


// แปลงค่าตาม datatype ของ column
var QT_MONTH   = normalizeMonthDate(HEADER["I_QT_MTH"]);       // date
var METALPRICE = normalizeMonthStr(HEADER["I_METAL_PRICE"]);   // nvarchar(7) YYYYMM
var EXG_MONTH  = normalizeMonthDate(HEADER["I_EXG_MONTH"]);    // date
var PO_MONTH   = normalizeMonthDate(HEADER["I_PO_MONTH"]);     // date

// TALON.addMsg("RAW I_QT_MTH      = " + HEADER["I_QT_MTH"]);
// TALON.addMsg("RAW I_EXG_MONTH   = " + HEADER["I_EXG_MONTH"]);
// TALON.addMsg("RAW I_PO_MONTH    = " + HEADER["I_PO_MONTH"]);
// TALON.addMsg("RAW I_METAL_PRICE = " + HEADER["I_METAL_PRICE"]);
// TALON.addMsg(
//   "AFTER normalize → QT_MONTH=" + QT_MONTH +
//   ", EXG_MONTH=" + EXG_MONTH +
//   ", PO_MONTH=" + PO_MONTH +
//   ", METALPRICE=" + METALPRICE
// );

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

    var sql = "SELECT '"+QUOTATIONNO+"' AS [I_QT_NO]";
    var qtList = TalonDbUtil.select(TALON.getDbConfig(), );
    TALON.setSearchedDisplayList(1, qtList);


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
          + " 'DMTT_T_QT01',"
          + " GETDATE(),"
          + " '" + USERID + "',"
          + " 'DMTT_T_QT01',"
          + " 0"
          + " )";

        //TALON.addMsg("DEBUG SQL = " + insertSql);
        TalonDbUtil.insert(TALON.getDbConfig(), insertSql);

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

    TalonDbUtil.update(TALON.getDbConfig(), sqlUpdateType); 
    // var updatedRows = TalonDbUtil.update(TALON.getDbConfig(), sqlUpdateType);
    //TALON.addMsg("Updated I_TYPE rows: " + updatedRows);
}
