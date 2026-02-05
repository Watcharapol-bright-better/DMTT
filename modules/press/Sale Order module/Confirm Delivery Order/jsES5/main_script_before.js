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

var data = TALON.getBlockData_List(2);

var isAllMatched = true;
var hasProcess = false;

function onQtyChk(item) {

    var sqlChk =
        "SELECT " +
        " [SD].[I_SONO], " +
        " [SD].[INTERNAL_NO], " +
        " [SD].[I_QTY], " +
        " ISNULL(NULL, 0) AS [I_DELIVERED] " +
        "FROM [T_PR_SORD_D] [SD] " +
        "LEFT JOIN [T_PR_SHIP_INST_D] [SI] " +
        " ON [SI].[I_SONO] = [SD].[I_SONO] " +
        "WHERE [SD].[I_SONO] = '" + item.I_SONO + "' " +
        "AND [SD].[INTERNAL_NO] = " + item.INTERNAL_NO;

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
                "SET [I_CONFIRM_STATUS] = '1' " +
                "WHERE [I_SONO] = '" + item.I_SONO + "' " +
                "AND [INTERNAL_NO] = " + item.INTERNAL_NO;

            //TalonDbUtil.update(TALON.getDbConfig(), sqlUpd);
        }
    }
}

// Start logic only when CHK = 1 and Lvl = 2
data.forEach(function(item) {

    if (item['CHK'] === "1" && item['Lvl'] == 2) {
        hasProcess = true;
        TALON.addMsg(item);

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
