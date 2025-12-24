

var data = TALON.getTargetData();


var cust = data['I_CSCODE']; // Customer Code
var pattern = data['I_TYPE']; // Pattern

// TALON.addMsg(cust);
// TALON.addMsg(pattern);


if (!cust || !pattern) {

    if (!cust && !pattern) {
        TALON.addErrorMsg("Customer Code and Pattern are required fields.");
    } else if (!cust) {
        TALON.addErrorMsg("Customer Code is a required field.");
    } else if (!pattern) {
        TALON.addErrorMsg("Pattern is a required field.");
    }

} else {

    // INSERT TO : T_PR_QT table
    var sql = 
    "SELECT " +
    "    [MP].[I_ITEMCODE], " +
    "    [MP].[I_DESC], " +
    "    [MP].[I_COMMODITY], " +
    "    [MP].[I_THICK], " +
    "    [MP].[I_WIDTH], " +

    "    ([MP].[I_PROD_WGT] / 100.0) * (200.0 - [MP].[I_YIELD]) AS [I_PROD_WGT], " +
    "    ([MP].[I_RM_WGT]   / 100.0) * (200.0 - [MP].[I_YIELD]) AS [I_RM_WGT], " +
    "    ([MP].[I_LOSS_WGT] / 100.0) * (200.0 - [MP].[I_YIELD]) AS [I_LOSS_WGT], " +

    "    [MP].[I_PITCH], " +
    "    '' AS [MAT_COST], " +
    "    '' AS [SCRAP_COST], " +
    "    '' AS [MAT_AMOUNT], " +
    "    '' AS [SCRAP_AMOUNT], " +

    "    [MP].[I_FEE_PROCESS], " +
    "    [MP].[I_FEE_CUSTOM], " +
    "    [MP].[I_FEE_PACK], " +
    "    [MP].[I_FEE_EXPENSE], " +
    "    [MP].[I_FEE_DLY], " +

    "    COALESCE([MP].[I_FEE_PROCESS], 0) " +
    "  + COALESCE([MP].[I_FEE_CUSTOM], 0) " +
    "  + COALESCE([MP].[I_FEE_PACK], 0) " +
    "  + COALESCE([MP].[I_FEE_EXPENSE], 0) " +
    "  + COALESCE([MP].[I_FEE_DLY], 0) AS [MANAGEMENT_EXPENSE], " +

    "    ROUND(RAND(CHECKSUM(NEWID())) * 1350 + 150, 2) AS [TOTAL_PRICE], " +

    "    [MP].[I_QTPATTERN], " +
    "    [TQ].[I_QT_NO], " +
    "    [TQ].[I_CSCODE], " +
    "    NULL AS [I_SELECTED], " +
    "    [MP].[I_CSCOD], " +

    "    ROW_NUMBER() OVER ( " +
    "        PARTITION BY [MP].[I_ITEMCODE] " +
    "        ORDER BY [MP].[I_ITEMCODE] " +
    "    ) AS [I_QT_LN] " +

    "FROM [MS_PRFG] AS [MP] " +
    "LEFT JOIN [T_PR_QT] AS [TQ] " +
    "    ON [TQ].[I_ITEMCODE] = [MP].[I_ITEMCODE] " +

    "WHERE [MP].[I_CSCOD] = '"+cust+"' " +
    "  AND [MP].[I_QTPATTERN] = '"+pattern+"' ";

    // "WHERE [MP].[I_CSCOD] = 'C006' " +
    // "  AND [MP].[I_QTPATTERN] = '1' ";


    // TALON.addMsg(sql);
    var data = TalonDbUtil.select(TALON.getDbConfig(), sql);
    TALON.setSearchedDisplayList(2, data);

}

