(function () {
  // ============================================================
  // 1. CONFIG & INITIALIZATION
  // ============================================================
  var db = TALON.getDbConfig();

  var TABLE_WOH      = "T_PR_WOH";       
  var TABLE_WOUSEMAT = "T_PR_WOUSEMAT";  
  var TABLE_WOPRCS   = "T_PR_WOPRCS";    
  var TABLE_WR_DTL   = "T_PR_WR_DTL";    
  var TABLE_STOCK    = "T_MT_STOCK";     

  var HEADER_BLOCK_ID = 1; 
  var FG_BLOCK_ID     = 2; 
  var RM_BLOCK_ID     = 3; 
  var PRCS_BLOCK_ID   = 4; 

  var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
  var sdfDMYHMS = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
  var sdfYMDHMS = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

  // ============================================================
  // 2. HELPERS
  // ============================================================
  function escSql(s){ return String(s == null ? "" : s).replace(/'/g, "''"); }
  function hasText(v){ return v != null && String(v).trim() !== ""; }

  function toJavaDate(v){
    if (v == null || v === "") return null;
    try { v.getTime(); return v; } catch(e){}
    var s = String(v).trim();
    try { return sdfDMYHMS.parse(s); } catch(e1){}
    try { return sdfYMDHMS.parse(s); } catch(e2){}
    return null;
  }

  function toNumOrZero(v){
    if (!hasText(v)) return 0;
    var n = Number(String(v).replace(/,/g, "").trim());
    return isNaN(n) ? 0 : n;
  }

  function audit(m, now, userId, prg){
    m["CREATED_DATE"] = now; m["CREATED_BY"] = userId; m["CREATED_PRG_NM"] = prg;
    m["UPDATED_DATE"] = now; m["UPDATED_BY"] = userId; m["UPDATED_PRG_NM"] = prg;
    m["MODIFY_COUNT"] = 0;
  }

  // 1. ปรับให้ดึงเฉพาะคอลัมน์ที่ "ไม่ใช่" IDENTITY
  function getColSet(fullTableName){
    var schema = "dbo", table = fullTableName;
    if (String(fullTableName).indexOf(".") >= 0){
      var parts = String(fullTableName).split(".");
      schema = parts[0]; table = parts[1];
    }
    // เพิ่มเงื่อนไข COLUMNPROPERTY เพื่อเช็คว่าคอลัมน์ไหนเป็น IsIdentity หรือไม่
    var sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
              "WHERE TABLE_SCHEMA='" + escSql(schema) + "' AND TABLE_NAME='" + escSql(table) + "' " +
              "AND COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA + '.' + TABLE_NAME), COLUMN_NAME, 'IsIdentity') = 0";
    
    var rows = TalonDbUtil.select(db, sql);
    var set = {};
    for (var i=0; i<rows.length; i++){ 
        set[String(rows[i]["COLUMN_NAME"]).toUpperCase()] = true; 
    }
    return set;
  }

  // 2. ฟังก์ชัน Insert จะข้ามคอลัมน์ ID อัตโนมัติเพราะโดนกรองออกตั้งแต่ getColSet แล้ว
  function insertSmart(tableName, row, colSet){
    var cols = [];
    var data = {};
    for (var k in row){
      if (colSet[String(k).toUpperCase()]) {
        cols.push(k);
        data[k] = row[k];
      }
    }
    if (cols.length > 0) {
        TalonDbUtil.insertByMap(db, tableName, data, cols);
    }
  }

  // ============================================================
  // 3. MAIN PROCESS
  // ============================================================
  var HeaderData   = TALON.getBlockData_Card(HEADER_BLOCK_ID);
  var FGDetailData = TALON.getBlockData_List(FG_BLOCK_ID);
  var RMData       = TALON.getBlockData_List(RM_BLOCK_ID);
  var PrcsData     = TALON.getBlockData_List(PRCS_BLOCK_ID);

  var UserInfo = TALON.getUserInfoMap();
  var UserId = UserInfo["USER_ID"], ProgramNM = UserInfo["FUNC_ID"], now = new java.util.Date();

  if (!FGDetailData || FGDetailData.length === 0){ TALON.addErrorMsg("FG detail is empty."); return; }

  try {
    db.begin(); 

    var woNo = RunningNo.genId("DMTT_N_WO", "WOyyMM-xx", true);
    var colWOH = getColSet(TABLE_WOH), colWOUSEMAT = getColSet(TABLE_WOUSEMAT), 
        colWOPRCS = getColSet(TABLE_WOPRCS), colWRDTL = getColSet(TABLE_WR_DTL);

    // ✅ คำนวณน้ำหนักตัดสต็อกล่วงหน้า
    var woQtyCal = toNumOrZero(TALON.getBlockRequestParameter(FG_BLOCK_ID + "_I_WO_QTY", 0));
    var rmWgtGram = toNumOrZero(FGDetailData[0]["I_RM_WGT"]); 
    var deductWgtTotal = (woQtyCal * rmWgtGram) / 1000.0; 

    // --- 1) Insert T_PR_WOH ---
    for (var i = 0; i < FGDetailData.length; i++){
      var fg = FGDetailData[i], rowH = { "I_WO": woNo, "I_COMPLETE_FLG": "0" };
      rowH["I_PLAN_START"] = toJavaDate(HeaderData["I_PLAN_START"]);
      rowH["I_PLAN_FINISHED"] = toJavaDate(HeaderData["I_PLAN_FINISHED"]);
      rowH["I_PR_MACHINE"] = HeaderData["I_PR_MACHINE"];
      rowH["I_WODATE"] = toJavaDate(HeaderData["I_WODATE"]); 
      rowH["I_CUSTOMER"] = HeaderData["I_CSCODE"];
      rowH["I_WO_TYPE"] = HeaderData["I_WO_TYPE"];
      rowH["I_ITEMCODE"] = fg["I_ITEMCODE"];
      rowH["I_WO_QTY"] = woQtyCal; 
      rowH["I_DLY_DATE"] = toJavaDate(fg["I_DLY_DATE"]);
      rowH["I_REQ_COIL"] = toNumOrZero(fg["I_REQ_COIL"]);
      if (hasText(HeaderData["SHIFT"])) rowH["SHIFT"] = HeaderData["SHIFT"];
      audit(rowH, now, UserId, ProgramNM);
      insertSmart(TABLE_WOH, rowH, colWOH);
    }

    // --- 2) Insert T_PR_WOUSEMAT, T_PR_WR_DTL & UPDATE STOCK ---
    var ln = 0, firstItem = FGDetailData[0]["I_ITEMCODE"];
    for (var r = 0; r < RMData.length; r++){
      var src = RMData[r];
      if (src["I_PICK_FLG"] != "1" && src["I_PICK_FLG"] !== true) continue;
      
      ln++;
      var rowM = { 
        "I_WO": woNo, "I_LNNO": ln, "I_PICK_FLG": "1", 
        "I_COILNO": src["I_COILNO"], "I_CUTNO": src["I_CUTNO"], "I_HOOPNO": src["I_HOOPNO"],
        "I_WO_COILNO": src["RM_WO"], "I_WO_CUTNO": src["RM_WO"], "I_WO_HOOPNO": src["RM_WO"],
        "I_COIL_BK": "1" , "I_PRIORITY": src["I_PRIORITY"]
      };
      rowM["I_WEIGHT"] = toNumOrZero(src["I_CUR_WGT"]);
      if (hasText(src["I_LOCCD"])) rowM["I_LOCATION"] = src["I_LOCCD"];
      audit(rowM, now, UserId, ProgramNM);
      insertSmart(TABLE_WOUSEMAT, rowM, colWOUSEMAT);


      var rowD = { 
        "I_WO": woNo, "I_COIL_SEQ": ln, "I_ITEMCODE": firstItem, 
        "I_COILNO": src["I_COILNO"], "I_CUT_NO": src["I_CUTNO"], "I_HOOPNO": src["I_HOOPNO"],
        "I_COIL_BK": "1" 
      };
      audit(rowD, now, UserId, ProgramNM);
      insertSmart(TABLE_WR_DTL, rowD, colWRDTL);
    }

    // --- 3) Insert T_PR_WOPRCS ---
    if (PrcsData && PrcsData.length > 0) {
      var pr0 = PrcsData[0];
      var prRow = { "I_WO": woNo, "I_SEQ": 1, "I_PRCSCD": pr0["I_PRCSCD"] };
      prRow["I_PLN_STR_DATE"] = toJavaDate(pr0["I_PLN_STR_DATE"]);
      prRow["I_PLN_END_DATE"] = toJavaDate(pr0["I_PLN_END_DATE"]);
      audit(prRow, now, UserId, ProgramNM);
      insertSmart(TABLE_WOPRCS, prRow, colWOPRCS);
    }

    db.commit(); 
    
// 1. เตรียมข้อมูลเพื่อส่งเข้า Procedure
// (หมายเหตุ: woNo และ UserId มีค่าอยู่แล้วจากสคริปต์หลักด้านบน)
var itemDataList = new Array();
itemDataList['I_WO'] = woNo;    // ส่งค่า WO ที่พึ่งสร้างเสร็จ
itemDataList['iID']  = UserId;  // ส่ง User ID คนทำรายการ

// 2. กำหนดตัวแปรสำหรับรับค่า Output กลับมา (oMSG)
itemDataList['oMSG'] = ''; 
var recitemNameList = [
     'oMSG'
];

// 3. สั่ง Execute (เช็คชื่อ PROCEDURE_NAME ให้ตรงกับใน SQL นะครับ)
var itemRecList = TalonDbUtil.prepareCall(
    TALON.getDbConfig(), 
    'DMTT_L_PR_WO',   // ชื่อ Procedure ที่แก้ Error 8101 แล้ว
    itemDataList, 
    recitemNameList
);

// 4. แสดงผลลัพธ์ที่ได้จาก Procedure
// โดยปกติถ้าสำเร็จ oMSG จะคืนค่า 'OK'
for (var i = 0; i < itemRecList.length; i++) {
    var rec = itemRecList[i];
    var paramName = recitemNameList[i];
    
    if (rec !== 'OK') {
        // ถ้าไม่ใช่ OK ให้โชว์ Error Message ที่ได้จาก SQL
        TALON.addErrorMsg("Log Process: " + rec);
    } 
}
    // ✅ กลับมาใช้ addMsg แบบเดิมที่คุณต้องการ
    TALON.addMsg("Created WO Successfully: " + woNo);
    TALON.setSearchConditionData("I_WO", woNo, "");

  } catch (e) {
    db.rollback(); 
    TALON.addErrorMsg("Create WO failed: " + e);
  }
})();