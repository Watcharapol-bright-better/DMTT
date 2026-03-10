var db = TALON.getDbConfig();
var TABLE_WOH = "T_PR_WOH";
var TABLE_WOUSEMAT = "T_PR_WOUSEMAT";
var TABLE_WRDTL = "T_PR_WR_DTL";
var TABLE_STOCK = "T_MT_STOCK";

var HeaderData = TALON.getBlockData_Card(1);
var FGDetailData = TALON.getBlockData_List(2);
var RMData = TALON.getBlockData_List(3);

var startDate = HeaderData['I_PLAN_START'];
var finishDate = HeaderData['I_PLAN_FINISHED'];
var deliveryDate = FGDetailData[0]['I_DLY_DATE'];

var err_flg = false;

var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

if (finishDate.getTime() < startDate.getTime()) {
  TALON.addErrorMsg(
    "❌ Invalid Date Range \n" +
    "    • Start Datetime : " + sdfDisplay.format(startDate) + "\n" +
    "    • Finish Datetime : " + sdfDisplay.format(finishDate) + "\n" +
    "  → Finish Datetime cannot be earlier than Start Datetime"
  );
  err_flg = true;
}

if (deliveryDate && deliveryDate.getTime() <= finishDate.getTime()) {
  TALON.addErrorMsg(
    "❌ Invalid Delivery Date\n" +
    "    • Finish Datetime : " + sdfDisplay.format(finishDate) + "\n" +
    "    • Delivery Date : " + sdfDisplay.format(deliveryDate) + "\n" +
    "  → Delivery Date must be after Finish Datetime."
  );
  err_flg = true;
}

var I_WO = HeaderData["I_WO"];
var u = getUser();

if (!I_WO) {
  TALON.addErrorMsg("Work Order No is required.");
  TALON.setIsSuccess(false);
}

if (err_flg) {
  TALON.setIsSuccess(false);
} else {

  try {

    var colWOH = getColSet(TABLE_WOH);
    var colWOUSEMAT = getColSet(TABLE_WOUSEMAT);
    var colWRDTL = getColSet(TABLE_WRDTL);

    var fg = (FGDetailData && FGDetailData.length) ? FGDetailData[0] : null;
    var firstItem = fg ? fg["I_ITEMCODE"] : null;
    var sets = [];

    function pushSet(col, val, isExpr) {
      if (!colWOH[String(col).toUpperCase()]) return;
      if (isExpr) sets.push(col + " = " + val);
      else sets.push(col + " = " + toSqlLiteral(val));
    }

    pushSet("I_PLAN_START", HeaderData["I_PLAN_START"]);
    pushSet("I_PLAN_FINISHED", HeaderData["I_PLAN_FINISHED"]);
    pushSet("I_WO_TYPE", HeaderData["I_WO_TYPE"]);
    pushSet("I_PR_MACHINE", HeaderData["I_PR_MACHINE"]);
    pushSet("I_CUSTOMER", HeaderData["I_CUSTOMER"]);

    if (fg) {
      pushSet("I_DLY_DATE", fg["I_DLY_DATE"]);
      pushSet("I_WO_QTY", fg["I_WO_QTY"]);
      pushSet("I_REQ_COIL", fg["I_REQ_COIL"]);
      pushSet("I_PRIORITY", fg["I_PRIORITY"]);
      pushSet("I_REM1", fg["I_REM1"]);
    }

    pushSet("I_COMPLETE_FLG", "3");
    pushSet("UPDATED_DATE", u.now);
    pushSet("UPDATED_BY", u.userId);
    pushSet("UPDATED_PRG_NM", u.prgNm);
    if (colWOH["MODIFY_COUNT"]) pushSet("MODIFY_COUNT", "ISNULL(MODIFY_COUNT,0) + 1", true);

    if (sets.length) {
      var sqlUpdateWOH = "UPDATE dbo." + TABLE_WOH + " SET " + sets.join(", ") + " WHERE I_WO = " + toSqlLiteral(I_WO);
      TalonDbUtil.update(db, sqlUpdateWOH);
    }

    TalonDbUtil.delete(db, "DELETE FROM dbo." + TABLE_WOUSEMAT + " WHERE I_WO = " + toSqlLiteral(I_WO));
    TalonDbUtil.delete(db, "DELETE FROM dbo." + TABLE_WRDTL + " WHERE I_WO = " + toSqlLiteral(I_WO));

    // ============================================================
    // Separate RMData into 2 groups
    // ============================================================
    var priorityList = [];
    var noPriorityList = [];
    
    for (var i = 0; i < RMData.length; i++) {
      var item = RMData[i];
      if (!item || !isPicked(item["I_PICK_FLG"])) continue;
      
      var priority = toNum(item["I_PRIORITY"]);
      if (priority > 0) {
        priorityList.push(item);
      } else {
        noPriorityList.push(item);
      }
    }

    // Sort priority list (low to high)
    priorityList.sort(function(a, b) {
      return toNum(a["I_PRIORITY"]) - toNum(b["I_PRIORITY"]);
    });

    // Combine: priority first, then no priority
    var sortedRMData = priorityList.concat(noPriorityList);

    // ============================================================
    // Process sorted data
    // ============================================================
    var woQty = fg ? toNum(fg["I_WO_QTY"]) : 0;
    var rmWgtGram = fg ? toNum(fg["I_RM_WGT"]) : 0;
    var totalNeedWeightKg = (woQty * rmWgtGram) / 1000;

    var ln = 0;
    for (var i = 0; i < sortedRMData.length; i++) {
      var src = sortedRMData[i];
      ln++;
      
      var currentWeightInStock = toNum(src["I_CUR_WGT"]);

      // --- 3.1 Insert T_PR_WOUSEMAT ---
      var rowM = {
        "I_WO": I_WO,
        "I_LNNO": ln,
        "I_PICK_FLG": "1",
        "I_COIL_BK": "1",
        "I_WEIGHT": currentWeightInStock,
        "I_COILNO": src["I_COILNO"],
        "I_CUTNO": src["I_CUTNO"],
        "I_HOOPNO": src["I_HOOPNO"],
        "I_LOCATION": src["I_LOCCD"],
        "I_PRIORITY": src["I_PRIORITY"],
        "CREATED_DATE": u.now,
        "CREATED_BY": u.userId,
        "CREATED_PRG_NM": u.prgNm,
        "UPDATED_DATE": u.now,
        "UPDATED_BY": u.userId,
        "UPDATED_PRG_NM": u.prgNm,
        "MODIFY_COUNT": 0
      };
      var mtWo = (src["RM_WO"] && String(src["RM_WO"]).trim() !== "") ? src["RM_WO"] : src["I_COILNO"];
      rowM["I_WO_COILNO"] = mtWo;
      rowM["I_WO_CUTNO"] = mtWo;
      rowM["I_WO_HOOPNO"] = mtWo;
      insertByMapping(TABLE_WOUSEMAT, rowM, colWOUSEMAT);

      // --- 3.2 Insert T_PR_WR_DTL ---
      var rowD = {
        "I_WO": I_WO,
        "I_COIL_SEQ": ln,
        "I_ITEMCODE": firstItem,
        "I_COILNO": src["I_COILNO"],
        "I_CUT_NO": src["I_CUTNO"],
        "I_HOOPNO": src["I_HOOPNO"],
        "I_ORG_WGT": currentWeightInStock,
        "I_COIL_BK": "1",
        "I_COIL_SCANNED_STATUS": "0",
        "CREATED_DATE": u.now,
        "CREATED_BY": u.userId,
        "CREATED_PRG_NM": u.prgNm,
        "UPDATED_DATE": u.now,
        "UPDATED_BY": u.userId,
        "UPDATED_PRG_NM": u.prgNm,
        "MODIFY_COUNT": 0
      };
      insertByMapping(TABLE_WRDTL, rowD, colWRDTL);

      // --- 3.3 UPDATE T_MT_STOCK (Only for items with priority) ---
      var hasPriority = toNum(src["I_PRIORITY"]) > 0;
      
      if (hasPriority && totalNeedWeightKg > 0) {
        var weightToSub = (currentWeightInStock >= totalNeedWeightKg) ? totalNeedWeightKg : currentWeightInStock;
        totalNeedWeightKg -= weightToSub;

        if (weightToSub > 0) {
          var sqlUpdateStock = "UPDATE dbo." + TABLE_STOCK + " " +
            "SET I_CUR_WGT = ISNULL(I_CUR_WGT, 0) - " + weightToSub + ", " +
            "    UPDATED_DATE = " + toSqlLiteral(u.now) + ", " +
            "    UPDATED_BY = " + toSqlLiteral(u.userId) + " " +
            "WHERE I_COILNO = " + toSqlLiteral(src["I_COILNO"]) +
            "  AND I_CUTNO = " + toSqlLiteral(src["I_CUTNO"]) +
            "  AND I_HOOPNO = " + toSqlLiteral(src["I_HOOPNO"]);
          TalonDbUtil.update(db, sqlUpdateStock);
        }
      }
    }

    var result = runSP('SP_DMTT_L_PR_WO', I_WO);
    if (result.status) {
      TALON.addMsg("Confirm, Update Work Order, and Stock Deducted successfully.");
      TALON.setIsSuccess(true);
    } else {
      TALON.addErrorMsg(result.msg);
      TALON.setIsSuccess(false);
    }

  } catch (e) {
    TalonDbUtil.rollback(db);
    TALON.addErrorMsg("Save failed: " + e);
    TALON.setIsSuccess(false);
  }
}

function runSP(procName, ref_no) {
  var params = [];
  params['I_WO'] = ref_no;
  params['O_RESULT'] = '';

  var outputParams = ['O_RESULT'];
  var result = TalonDbUtil.prepareCall(
    TALON.getDbConfig(),
    procName,
    params,
    outputParams
  );

  return JSON.parse(result[0]);
}

function insertByMapping(tableName, dataMap, colSet) {
  var finalData = {}, finalCols = [];
  for (var k in dataMap) {
    if (colSet[k.toUpperCase()]) {
      finalData[k] = dataMap[k];
      finalCols.push(k);
    }
  }
  TalonDbUtil.insertByMap(db, tableName, finalData, Java.to(finalCols, "java.lang.String[]"));
}

function getUser() {
  var info = TALON.getUserInfoMap();
  return {
    userId: info ? info["USER_ID"] : "SYSTEM",
    prgNm: info ? info["FUNC_ID"] : "BATCH",
    now: new java.util.Date()
  };
}

function toSqlLiteral(v) {
  if (v == null) return "NULL";
  if (v instanceof java.util.Date) {
    var sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    return "'" + sdf.format(v) + "'";
  }
  if (typeof v === "number") return String(v);
  var s = String(v).replace(/'/g, "''");
  return s.trim() === "" ? "NULL" : "'" + s + "'";
}

function isPicked(v) {
  var s = String(v || "").trim().toUpperCase();
  return (v === true || s === "1" || s === "Y" || s === "TRUE" || s === "ON");
}

function toNum(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  return parseFloat(String(v).replace(/,/g, "")) || 0;
}

function getColSet(tableName) {
  var sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='" + tableName + "'";
  var rows = TalonDbUtil.select(db, sql);
  var set = {};
  if (rows) {
    for (var i = 0; i < rows.length; i++) {
      set[String(rows[i]["COLUMN_NAME"]).toUpperCase()] = true;
    }
  }
  return set;
}