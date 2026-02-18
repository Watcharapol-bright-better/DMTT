
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var data = TALON.getBlockData_List(2);

var isAllMatched = true;
var hasProcess = false;

function onQtyChk(item) {

var sqlChk =
    "" +
    "SELECT " +
    "       [D].[I_SONO] " +
    "      ,[D].[INTERNAL_NO] " +
    "      ,[D].[I_LNNO] " +
    "      ,ISNULL([D].[I_COMPCLS],'') AS [I_COMPCLS] " +
    "      ,ISNULL([H].[I_CUSTOMER_PO],'') AS [I_CUSTOMER_PO] " +
    "      ,[D].[I_DLYDATE] " +
    "      ,ISNULL([H].[I_CSCODE],'') AS [I_CSCODE] " +
    "      ,ISNULL([MC].[I_NAME],'') AS [I_NAME] " +
    "      ,ISNULL([H].[I_SODATE],GETDATE()) AS [I_SODATE] " +
    "      ,[D].[I_ITEMCODE] " +
    "      ,[FG].[I_DESC] " +
    "      ,[D].[I_AMOUNT] " +
    "      ,[D].[I_UNTPRI] " +
    "      ,[D].[I_QTY] " +
    "      ,[D].[I_DLY_PLACE] " +
    "      ,ISNULL([H].[I_PIC],'') AS [I_PIC] " +
    "      ,ISNULL(SUM([SHIP_1].[I_SHIP_QTY]),0) AS [I_DELIVERED] " +
    "      ,ISNULL(SUM([SHIP_2].[I_SHIP_QTY]),0) AS [I_PICKED] " +
    "      ,CASE " +
    "            WHEN ISNULL([D].[I_QTY],0) - ISNULL(NULL,0) - ISNULL(SUM([SHIP_2].[I_SHIP_QTY]),0) < 0 " +
    "            THEN 0 " +
    "            ELSE ISNULL([D].[I_QTY],0) - ISNULL(NULL,0) - ISNULL(SUM([SHIP_2].[I_SHIP_QTY]),0) " +
    "       END AS [BALANCE] " +
    "      ,ISNULL([D].[I_CONFIRM_STATUS], 0) AS [I_CONFIRM_STATUS] " +
    "      ,[D].[CREATED_DATE] " +
    "      ,[D].[CREATED_BY] " +
    "      ,[D].[CREATED_PRG_NM] " +
    "      ,[D].[UPDATED_DATE] " +
    "      ,[D].[UPDATED_BY] " +
    "      ,[D].[UPDATED_PRG_NM] " +
    "      ,[D].[MODIFY_COUNT] " +
    "FROM [T_PR_SORD_D] [D] " +
    "LEFT JOIN [T_PR_SORD_H] [H] ON [H].[I_SONO] = [D].[I_SONO] " +
    "LEFT JOIN [MS_CS] [MC] ON [MC].[I_CSCODE] = [H].[I_CSCODE] " +
    "LEFT JOIN [MS_PRFG] [FG] ON [FG].[I_ITEMCODE] = [D].[I_ITEMCODE] " +
    "LEFT JOIN ( " +
    "    SELECT " +
    "         [SHIPD].[I_SONO] " +
    "        ,[SHIPD].[I_ITEMCODE] " +
    "        ,[SHIPD].[I_SHIP_QTY] " +
    "        ,[SHIPH].[I_SHIP_CFM] " +
    "    FROM [T_PR_SHIP_INST_D] [SHIPD] " +
    "    LEFT JOIN [T_PR_SHIP_INST_H] [SHIPH] " +
    "        ON [SHIPH].[I_SHIP_INST] = [SHIPD].[I_SHIP_INST] " +
    "    WHERE [SHIPH].[I_SHIP_CFM] IN ('3') " +
    ") [SHIP_1] " +
    "    ON [SHIP_1].[I_SONO] = [D].[I_SONO] " +
    "    AND [SHIP_1].[I_ITEMCODE] = [D].[I_ITEMCODE] " +
    "LEFT JOIN ( " +
    "    SELECT " +
    "         [SHIPD].[I_SONO] " +
    "        ,[SHIPD].[I_ITEMCODE] " +
    "        ,[SHIPD].[I_SHIP_QTY] " +
    "        ,[SHIPH].[I_SHIP_CFM] " +
    "    FROM [T_PR_SHIP_INST_D] [SHIPD] " +
    "    LEFT JOIN [T_PR_SHIP_INST_H] [SHIPH] " +
    "        ON [SHIPH].[I_SHIP_INST] = [SHIPD].[I_SHIP_INST] " +
    "    WHERE [SHIPH].[I_SHIP_CFM] IN ('0','1','2') " +
    ") [SHIP_2] " +
    "    ON [SHIP_2].[I_SONO] = [D].[I_SONO] " +
    "    AND [SHIP_2].[I_ITEMCODE] = [D].[I_ITEMCODE] " +
    "WHERE [D].[I_SONO] = '"+item.I_SONO+"' " +
    "AND [D].[INTERNAL_NO] = '"+item.INTERNAL_NO+"' " +
    "GROUP BY " +
    "     [D].[I_SONO], [D].[I_LNNO], [D].[I_COMPCLS], [H].[I_CUSTOMER_PO] " +
    "    ,[D].[I_DLYDATE], [H].[I_CSCODE], [MC].[I_NAME], [H].[I_SODATE] " +
    "    ,[D].[I_AMOUNT], [D].[I_UNTPRI], [D].[I_QTY], [D].[I_DLY_PLACE] " +
    "    ,[H].[I_PIC], [D].[I_CONFIRM_STATUS] " +
    "    ,[D].[CREATED_DATE], [D].[CREATED_BY], [D].[CREATED_PRG_NM] " +
    "    ,[D].[UPDATED_DATE], [D].[UPDATED_BY], [D].[UPDATED_PRG_NM] " +
    "    ,[D].[MODIFY_COUNT], [INTERNAL_NO], [D].[I_ITEMCODE], [FG].[I_DESC]";

    var checkData = TalonDbUtil.select(TALON.getDbConfig(), sqlChk);

    if (!checkData || checkData.length === 0) {
        isAllMatched = false;
    } else {

        var soQty = Number(checkData[0].BALANCE);
        var deliveryQty = Number(checkData[0].I_QTY);

        // Case 2 : Qty not equal
        if (deliveryQty !== soQty) {
            isAllMatched = false;
        }
        // Case 1 : Qty equal
        else {

            var sqlUpd =
                "UPDATE [T_PR_SORD_D] " +
                "SET [I_CONFIRM_STATUS] = '1', " +
                " [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, " +
                " [UPDATED_DATE]  = GETDATE(), " +
                " [UPDATED_PRG_NM]= '" + ProgramNM + "', " +
                " [UPDATED_BY]    = '" + UserId + "' " +
                "WHERE [I_SONO] = '" + item.I_SONO + "' " +
                "AND [INTERNAL_NO] = '" + item.INTERNAL_NO + "' ";

            TalonDbUtil.update(TALON.getDbConfig(), sqlUpd);
        }
    }
}

// Start logic only when CHK = 1 and Lvl = 2
data.forEach(function(item) {

    if (item['CHK'] === "1" && item['Lvl'] == 2) {
        hasProcess = true;
        // TALON.addMsg(item);

        onQtyChk({
            I_SONO: item.I_SONO,
            INTERNAL_NO: item.INTERNAL_NO
        });
    }
});


if (hasProcess && isAllMatched) {
    TALON.addMsg("✅ Confirmed Successfully");
    TALON.setIsSuccess(true);
}
else if (hasProcess && !isAllMatched) {
    TALON.addErrorMsg("⚠️ Delivery Qty does not equal to SO Qty");
    TALON.setIsSuccess(false);
}
