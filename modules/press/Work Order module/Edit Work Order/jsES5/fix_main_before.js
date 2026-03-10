
var db = TALON.getDbConfig();
var TABLE_WOH = "T_PR_WOH";
var TABLE_WOUSEMAT = "T_PR_WOUSEMAT";
var TABLE_WRDTL = "T_PR_WR_DTL"; // เป้าหมายใหม่

var HeaderData = TALON.getBlockData_Card(1);
var FGDetailData = TALON.getBlockData_List(2);
var RMData = TALON.getBlockData_List(3);


var startDate = HeaderData['I_PLAN_START'];
var finishDate = HeaderData['I_PLAN_FINISHED'];
var deliveryDate = FGDetailData[0]['I_DLY_DATE'];

// TALON.addMsg('Start Datetime : ' + startDate);
// TALON.addMsg('Finish Datetime : ' + finishDate);
// TALON.addMsg('Delivery Date : ' + deliveryDate);

var err_flg = false;

// var startDate = _I_PLAN_START;
// var finishDate = _I_PLAN_FINISHED;
// var deliveryDate = _I_DLY_DATE ? _I_DLY_DATE : null;

var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

// Finish >= Start
if (finishDate.getTime() < startDate.getTime()) {

  TALON.addErrorMsg(
    "❌ Invalid Date Range \n" +
    "    • Start Datetime : " + sdfDisplay.format(startDate) + "\n" +
    "    • Finish Datetime : " + sdfDisplay.format(finishDate) + "\n" +
    "  → Finish Datetime cannot be earlier than Start Datetime"
  );

  err_flg = true;
}

// Delivery > Finish
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

// Load Column Sets สำหรับตรวจสอบความถูกต้อง
var colWOH = getColSet(TABLE_WOH);
var colWOUSEMAT = getColSet(TABLE_WOUSEMAT);
var colWRDTL = getColSet(TABLE_WRDTL); // Load เพิ่ม

if (!I_WO) {
  TALON.addErrorMsg("Work Order No is required.");
  TALON.setIsSuccess(false);
}


if (err_flg) {
  TALON.setIsSuccess(false);
} else {

  try {
    TalonDbUtil.begin(db);

    // --- PART A: UPDATE HEADER (คงเดิม) ---
    var fg = (FGDetailData && FGDetailData.length) ? FGDetailData[0] : null;
    var firstItem = fg ? fg["I_ITEMCODE"] : null; // เก็บ Item Code ไว้ใช้สำหรับ WR_DTL
    var sets = [];
    //[ "A = ''", "B = ''"  ]

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
      var sqlWOH = "UPDATE dbo." + TABLE_WOH + " SET " + sets.join(", ") + " WHERE I_WO = " + toSqlLiteral(I_WO);
      // UPDATE sdxsss SET A='', B='' WHERE
      TalonDbUtil.update(db, sqlWOH);
    }

    // --- PART B: REBUILD MATERIAL (T_PR_WOUSEMAT & T_PR_WR_DTL) ---
    // ล้างข้อมูลเก่าทั้ง 2 ตาราง
    TalonDbUtil.delete(db, "DELETE FROM dbo." + TABLE_WOUSEMAT + " WHERE I_WO = " + toSqlLiteral(I_WO));
    TalonDbUtil.delete(db, "DELETE FROM dbo." + TABLE_WRDTL + " WHERE I_WO = " + toSqlLiteral(I_WO));

    var ln = 0;
    for (var i = 0; i < RMData.length; i++) {
      var src = RMData[i];
      if (!src || !isPicked(src["I_PICK_FLG"])) continue;

      ln++;

      // 1. จัดการตาราง T_PR_WOUSEMAT (เดิม)
      var rowM = {
        "I_WO": I_WO,
        "I_LNNO": ln,
        "I_PICK_FLG": "1",
        "I_COIL_BK": "1",
        "I_WEIGHT": (src["I_CUR_WGT"] != null && String(src["I_CUR_WGT"]).trim() !== "") ? src["I_CUR_WGT"] : (src["I_ORG_WGT"] || 0),
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

      // 2. จัดการตาราง T_PR_WR_DTL (เพิ่มใหม่)
      var rowD = {
        "I_WO": I_WO,
        "I_COIL_SEQ": ln,
        "I_ITEMCODE": firstItem,
        "I_COILNO": src["I_COILNO"],
        "I_CUT_NO": src["I_CUTNO"], // ชื่อคอลัมน์ตามที่คุณระบุ
        "I_HOOPNO": src["I_HOOPNO"],
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
    }

    TalonDbUtil.commit(db);
    
    
    var result = runSP('SP_DMTT_L_PR_WO', I_WO);
    if (result.status) {
      TALON.addMsg("Change details of Work Order successfully.");
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
  var finalData = {},
    finalCols = [];
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
    userId: info["USER_ID"],
    prgNm: info["FUNC_ID"],
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

function getColSet(tableName) {
  var sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='" + tableName + "'";
  var rows = TalonDbUtil.select(db, sql);
  var set = {};
  if (rows) {
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      set[String(r["COLUMN_NAME"]).toUpperCase()] = true;
    }
  }
  return set;
}
