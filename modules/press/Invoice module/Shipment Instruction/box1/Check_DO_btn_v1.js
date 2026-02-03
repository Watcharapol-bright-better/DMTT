var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

var searchData = TALON.getConditionData();
var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo["USER_ID"];
var ProgramNM = UserInfo["FUNC_ID"];
var now = new java.util.Date();

// var searchData = TALON.getConditionData();
// TALON.addMsg(typeof searchData.I_SHIP_INST);
if (searchData.I_SHIP_INST === "") {
  var data = TALON.getTargetData();
  var dlyData = data["I_SHIP_DLY_DATE"];
  var custData = data["I_CSCODE"];
  var shipToData = data["I_SHIPTO"];
  var fmt = sdfDisplay.format(dlyData);

  var shipID = RunningNo.genId("DMTT_N_SI", "SIyymmddxxxx", true);

  var sql =
    "" +
    "SELECT " +
    "    NULL AS [I_SHIP_LNNO], " +
    "    NULL AS [I_SHIP_INST], " +
    "    NULL AS [INTERNAL_NO], " +
    "    [SD].[I_SONO], " +
    "    [SD].[I_ITEMCODE], " +
    "    [MP].[I_DESC], " +
    "    ([MP].[I_PCS_BOX]/[MP].[I_BOX_PALLET]) AS [I_PALLET_QTY]," +
    "    ISNULL([ST].[BAL_QTY], [SD].[I_QTY]) AS [I_BALANCE_QTY], " +
    "    ISNULL([SD].[I_QTY], [ST].[BAL_QTY]) AS [I_SHIP_QTY], " +
    "    [ST].[I_BOX_QTY], " +
    "    [ST].[MIN_LOTNO] AS [I_LOTNO_FR], " +
    "    [ST].[MAX_LOTNO] AS [I_LOTNO_TO], " +
    "    [WO].[I_WODATE], " +
    "    '0' AS [I_SHP_PCK_STATUS], " +
    "    '0' AS [I_QA_STATUS]," +
    "    NULL AS [CREATED_DATE], " +
    "    NULL AS [CREATED_BY], " +
    "    NULL AS [CREATED_PRG_NM], " +
    "    NULL AS [UPDATED_DATE], " +
    "    NULL AS [UPDATED_BY], " +
    "    NULL AS [UPDATED_PRG_NM], " +
    "    NULL AS [MODIFY_COUNT] " +
    "FROM [T_PR_SORD_D] AS [SD] " +
    "INNER JOIN [MS_PRFG] AS [MP] " +
    "    ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE] " +
    "LEFT JOIN [T_PR_WOH] AS [WO] " +
    "    ON [WO].[I_SONO] = [SD].[I_SONO] " +
    "LEFT JOIN ( " +
    "    SELECT " +
    "        [I_ITEMCODE], " +
    "        COUNT([I_LOTNO]) AS [I_BOX_QTY], " +
    "        MIN([I_LOTNO]) AS [MIN_LOTNO], " +
    "        MAX([I_LOTNO]) AS [MAX_LOTNO], " +
    "        SUM([I_INQTY]) - SUM([I_OUTQTY]) AS [BAL_QTY] " +
    "    FROM [T_PR_STOCK] " +
    "    GROUP BY [I_ITEMCODE] " +
    ") AS [ST] " +
    "    ON [ST].[I_ITEMCODE] = [SD].[I_ITEMCODE]" +
    "WHERE [SD].[I_DLYDATE] = '" +
    sdfDisplay.format(dlyData) +
    "'";

  //TALON.addMsg(sql);

  var data = TalonDbUtil.select(TALON.getDbConfig(), sql);
  var rows = [];

  data.forEach(function (item) {
    var internalNo = RunningNo.genId("DMTT_N_SII", "yyyymmddxxxxxx", true);
    var lineData = {
      I_SHIP_INST: shipID,
      INTERNAL_NO: internalNo,
      I_SONO: item["I_SONO"],
      I_ITEMCODE: item["I_ITEMCODE"],
      I_DESC: item["I_DESC"],
      I_PALLET_QTY: item["I_PALLET_QTY"],
      I_BALANCE_QTY: item["I_BALANCE_QTY"],
      I_SHIP_QTY: item["I_SHIP_QTY"],
      I_BOX_QTY: item["I_BOX_QTY"],
      I_LOTNO_FR: item["I_LOTNO_FR"],
      I_LOTNO_TO: item["I_LOTNO_TO"],
      I_WODATE: item["I_WODATE"],
      I_SHP_PCK_STATUS: item["I_SHP_PCK_STATUS"],
      I_QA_STATUS: item["I_QA_STATUS"],

      CREATED_DATE: DateFmt.formatDateTime(now.toString()),
      CREATED_BY: UserId,
      CREATED_PRG_NM: ProgramNM,
      UPDATED_DATE: DateFmt.formatDateTime(now.toString()),
      UPDATED_BY: UserId,
      UPDATED_PRG_NM: ProgramNM,
      MODIFY_COUNT: 0,
    };

    rows.push(lineData);
  });

  // TALON.addMsg(JSON.stringify(rows));
  TALON.setSearchedDisplayList(2, rows);
  TALON.setSearchConditionData("I_SHIP_INST", shipID, "");
}
