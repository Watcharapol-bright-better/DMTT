var searchData = TALON.getConditionData();
var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo["USER_ID"];
var ProgramNM = UserInfo["FUNC_ID"];
var now = new java.util.Date();

var _I_SONO = TALON.getBindValue("I_SONO");
// TALON.addMsg('2 I_SONO: '+_I_SONO);
var sql =
  "SELECT IIF(EXISTS (SELECT 1 FROM [T_PR_SORD] WHERE [I_SONO] = '" +
  searchData.I_SONO +
  "'), 1, 0) AS [Result]";
var isReadySO = TalonDbUtil.select(TALON.getDbConfig(), sql)[0]["Result"];

// TALON.addErrorMsg("TEST : " + searchData.I_SONO);

var isSO = {
  exists: 1,
  noexists: 0,
};

if (isReadySO === isSO.noexists) {
  /*
  Box2 = {I_SONO=SOP26010063, CREATED_BY=, I_ITEMCODE=000001, CREATED_DATE=null, I_UNTPRI=15025, I_LNNO=1, I_DESC=BLANK BUSBAR, INTERNAL_NO=, I_QTY=1, I_DLY_PLACE=, UPDATED_BY=, UPDATED_PRG_NM=, UPDATED_DATE=null, CREATED_PRG_NM=, MODIFY_COUNT=null, I_AMOUNT=15025.00}
  */
  var Box2 = TALON.getTargetData();
  if (Box2["I_QTY"] !== null) {
    // =========================
    var TABLE_NAME = "T_PR_SORD_D";

    var detailCol = [
      "I_SONO", // ^
      "I_LNNO", // ^
      "I_ITEMCODE",
      "I_UNTPRI",
      "I_QTY",
      "I_AMOUNT",
      "I_DLY_PLACE",
      "INTERNAL_NO", // ^
      "I_DLYDATE",
      "I_CONFIRM_STATUS",

      "CREATED_DATE",
      "CREATED_BY",
      "CREATED_PRG_NM",
      "UPDATED_DATE",
      "UPDATED_BY",
      "UPDATED_PRG_NM",
      "MODIFY_COUNT",
    ];

    var internalNo = RunningNo.genId("DMTT_N_SO_IN", "yyyymmddxxxxxx", true);
    var _I_DLYDATE = TALON.getBindValue("I_DLYDATE");

    Box2["I_SONO"] = _I_SONO;
    Box2["INTERNAL_NO"] = internalNo;

    Box2["I_DLYDATE"] = DateFmt.formatDateTime(_I_DLYDATE.toString());
    Box2["I_CONFIRM_STATUS"] = "0"; // Not Confirmed

    Box2["CREATED_DATE"] = DateFmt.formatDateTime(now.toString());
    Box2["CREATED_BY"] = UserId;
    Box2["CREATED_PRG_NM"] = ProgramNM;
    Box2["UPDATED_DATE"] = DateFmt.formatDateTime(now.toString());
    Box2["UPDATED_BY"] = UserId;
    Box2["UPDATED_PRG_NM"] = ProgramNM;
    Box2["MODIFY_COUNT"] = 0;

    TalonDbUtil.insertByMap(TALON.getDbConfig(), TABLE_NAME, Box2, detailCol);
  }
} else {
  TALON.addErrorMsg("⚠️ Sales Order already exists.");
}
