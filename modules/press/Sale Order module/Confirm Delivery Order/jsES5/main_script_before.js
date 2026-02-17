/*************************************************
 * Click to Confirm Delivery Date
 *
 * Logic:
 * Case 1: Total Delivery Qty equals SO Qty
 *         - "Confirmed Successfully"
 *         - I_CONFIRM_STATUS = '1'
 *
 * Case 2: Total Delivery Qty not equals SO Qty
 *         - "Delivery Qty does not equal to SO Qty"
 *************************************************/
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var data = TALON.getBlockData_List(2);

var isAllMatched = true;
var hasProcess = false;

function onQtyChk(item) {

    var sqlChk = ""
    + "SELECT "
    + "    [D].[I_SONO] "
    + "   ,[D].[INTERNAL_NO] "
    + "   ,[D].[I_LNNO] "
    + "   ,[D].[I_AMOUNT] "
    + "   ,[D].[I_UNTPRI] "
    + "   ,[D].[I_QTY] "
    + "   ,ISNULL([SHIP_1_SUM].[I_DELIVERED], 0) AS [I_DELIVERED] "
    + "   ,ISNULL([SHIP_2_SUM].[I_PICKED], 0) AS [I_PICKED] "
    + "   ,ISNULL([D].[I_CONFIRM_STATUS], 0) AS [I_CONFIRM_STATUS] "
    + "FROM [T_PR_SORD_D] [D] "
    + "LEFT JOIN [T_PR_SORD_H] [H] "
    + "    ON [H].[I_SONO] = [D].[I_SONO] "
    + "LEFT JOIN [MS_CS] [MC] "
    + "    ON [MC].[I_CSCODE] = [H].[I_CSCODE] "
    + "LEFT JOIN ( "
    + "    SELECT "
    + "        [SHIPD].[I_SONO] "
    + "       ,[SHIPD].[I_ITEMCODE] "
    + "       ,SUM([SHIPD].[I_SHIP_QTY]) AS [I_DELIVERED] "
    + "    FROM [T_PR_SHIP_INST_D] [SHIPD] "
    + "    LEFT JOIN [T_PR_SHIP_INST_H] [SHIPH] "
    + "        ON [SHIPH].[I_SHIP_INST] = [SHIPD].[I_SHIP_INST] "
    + "    WHERE [SHIPH].[I_SHIP_CFM] = '3' "
    + "    GROUP BY [SHIPD].[I_SONO], [SHIPD].[I_ITEMCODE] "
    + ") [SHIP_1_SUM] "
    + "    ON [SHIP_1_SUM].[I_SONO] = [D].[I_SONO] "
    + "    AND [SHIP_1_SUM].[I_ITEMCODE] = [D].[I_ITEMCODE] "
    + "LEFT JOIN ( "
    + "    SELECT "
    + "        [SHIPD].[I_SONO] "
    + "       ,[SHIPD].[I_ITEMCODE] "
    + "       ,SUM([SHIPD].[I_SHIP_QTY]) AS [I_PICKED] "
    + "    FROM [T_PR_SHIP_INST_D] [SHIPD] "
    + "    LEFT JOIN [T_PR_SHIP_INST_H] [SHIPH] "
    + "        ON [SHIPH].[I_SHIP_INST] = [SHIPD].[I_SHIP_INST] "
    + "    WHERE [SHIPH].[I_SHIP_CFM] IN ('0', '1', '2') "
    + "    GROUP BY [SHIPD].[I_SONO], [SHIPD].[I_ITEMCODE] "
    + ") [SHIP_2_SUM] "
    + "    ON [SHIP_2_SUM].[I_SONO] = [D].[I_SONO] "
    + "    AND [SHIP_2_SUM].[I_ITEMCODE] = [D].[I_ITEMCODE] "
    + "WHERE [D].[I_SONO] = '" + item.I_SONO + "' " 
    + "  AND [D].[INTERNAL_NO] = '" + item.INTERNAL_NO + "' ";

    var checkData = TalonDbUtil.select(TALON.getDbConfig(), sqlChk);

    if (!checkData || checkData.length === 0) {
        isAllMatched = false;
    } else {

        var soQty = Number(checkData[0].I_QTY);
        var deliveryQty = Number(checkData[0].I_DELIVERED);

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
