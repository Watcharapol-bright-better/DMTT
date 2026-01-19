

var data = TALON.getTargetData();


var csCode = data['I_CSCODE']; // Customer Code
var qtPattern = data['I_TYPE']; // Pattern

// TALON.addMsg(csCode);
// TALON.addMsg(qtPattern);


if (!csCode || !qtPattern) {

    if (!csCode && !qtPattern) {
        TALON.addErrorMsg("Customer Code and Pattern are required fields.");
    } else if (!csCode) {
        TALON.addErrorMsg("Customer Code is a required field.");
    } else if (!qtPattern) {
        TALON.addErrorMsg("Pattern is a required field.");
    }

} else {

    var qtID = RunningNo.genId('DMTT_N_QT', 'QUTyyyymmxxxx', false);

    // INSERT TO : T_PR_QT table
    // I_QT_STATUS : '0'
    var sql = ""
        + "SELECT "
        + "     '"+qtID+"' AS [I_QT_NO] "
        + "    ,[Q].[I_QTPATTERN] "
        + "    ,[Q].[I_CSCODE] "
        + "    ,[Q].[I_ITEMCODE] "
        + "    ,[Q].[I_DESC] "
        + "    ,[Q].[I_COMMODITY] "
        + "    ,[Q].[I_THICK] "
        + "    ,[Q].[I_WIDTH] "
        + "    ,[Q].[I_PROD_WGT] "
        + "    ,[Q].[I_RM_WGT] "
        + "    ,[Q].[I_LOSS_WGT] "
        + "    ,[Q].[I_PITCH] "
        + "    ,[Q].[MAT_COST] "
        + "    ,[Q].[SCRAP_COST] "
        + "    ,([Q].[MAT_COST]   * [Q].[I_RM_WGT])   AS [MAT_AMOUNT] "
        + "    ,([Q].[SCRAP_COST] * [Q].[I_LOSS_WGT]) AS [SCRAP_AMOUNT] "
        + "    ,[Q].[I_FEE_PROCESS] "
        + "    ,[Q].[I_FEE_CUSTOM] "
        + "    ,[Q].[I_FEE_PACK] "
        + "    ,[Q].[I_FEE_EXPENSE] "
        + "    ,[Q].[I_FEE_DLY] "
        + "    ,[Q].[MANAGEMENT_EXPENSE] "
        + "    ,[Q].[TOTAL_PRICE] "
        + "FROM ( "
        + "    SELECT "
        + "         [MP].[I_QTPATTERN] "
        + "        ,[MP].[I_CSCODE] "
        + "        ,[MP].[I_ITEMCODE] "
        + "        ,[MP].[I_DESC] "
        + "        ,[MP].[I_COMMODITY] "
        + "        ,[MP].[I_THICK] "
        + "        ,[MP].[I_WIDTH] "
        + "        ,([MP].[I_PROD_WGT] / 100.0) * (200.0 - [MP].[I_YIELD]) AS [I_PROD_WGT] "
        + "        ,([MP].[I_RM_WGT]   / 100.0) * (200.0 - [MP].[I_YIELD]) AS [I_RM_WGT] "
        + "        ,([MP].[I_LOSS_WGT] / 100.0) * (200.0 - [MP].[I_YIELD]) AS [I_LOSS_WGT] "
        + "        ,[MP].[I_PITCH] "
        + "        ,ISNULL(NULL, 1) AS [MAT_COST] "
        + "        ,ISNULL(NULL, 1) AS [SCRAP_COST] "
        + "        ,[MP].[I_FEE_PROCESS] "
        + "        ,[MP].[I_FEE_CUSTOM] "
        + "        ,[MP].[I_FEE_PACK] "
        + "        ,[MP].[I_FEE_EXPENSE] "
        + "        ,[MP].[I_FEE_DLY] "
        + "        ,COALESCE([MP].[I_FEE_PROCESS], 0) "
        + "       + COALESCE([MP].[I_FEE_CUSTOM], 0) "
        + "       + COALESCE([MP].[I_FEE_PACK], 0) "
        + "       + COALESCE([MP].[I_FEE_EXPENSE], 0) "
        + "       + COALESCE([MP].[I_FEE_DLY], 0) AS [MANAGEMENT_EXPENSE] "
        + "        ,ROUND(RAND(CHECKSUM(NEWID())) * 1350 + 150, 2) AS [TOTAL_PRICE] "
        + "    FROM [MS_PRFG] [MP] "
        + "WHERE [MP].[I_CSCODE] = '" + csCode + "' "
        + "  AND [MP].[I_QTPATTERN] = '" + qtPattern + "' "
        + ") [Q]";


    // "WHERE [MP].[I_CSCOD] = 'C006' " +
    // "  AND [MP].[I_QTPATTERN] = '1' ";

    // TALON.addMsg(sql);
    var data = TalonDbUtil.select(TALON.getDbConfig(), sql);
    TALON.setSearchedDisplayList(2, data);

}

