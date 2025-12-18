
function extractValues(input) {
    var result = [];
    var newIndex = 1; // เริ่มนับจาก 1

    var parts = input.split(',');
    parts.forEach(function(pair) {
        pair = pair.trim();
        if (pair !== '') {
            var idxSplit = pair.split(':');
            if (idxSplit.length === 2) {
                var values = idxSplit[1].split('|');

                result.push({
                    index: newIndex,
                    I_SONO: values[0] || '',
                    I_LNNO: values[1] || ''
                });

                newIndex++;
            }
        }
    });

    return result;
}


function onExceedQtyChk(item) {

    var sqlChk =
    "SELECT " +
    " [SD].[I_SONO], " +                // SO No.
    " [SD].[I_LNNO], " +
    " [SD].[I_QTY], " +                 // SO Qty
    " ISNULL([SI].[I_SHIP_CFM], 0) AS [I_SHIP_CFM] " + // Delivery Qty
    "FROM [T_PR_SORD] [SD] " +
    "LEFT JOIN [T_MT_SHIP_INST] AS [SI] " +
    " ON [SI].[I_SONO] = [SD].[I_SONO] " +
    "WHERE [SD].[I_SONO] = '" + item.I_SONO + "' " +
    "AND [SD].[I_LNNO] = " + item.I_LNNO + "";


    var checkData = TalonDbUtil.select(TALON.getDbConfig(), sqlChk);

    if (!checkData || checkData.length === 0) {
        TALON.addErrorMsg("❌ SO Detail not found");
        TALON.setIsSuccess(false);
        return;
    }

    var soQty = Number(checkData[0].I_QTY);
    var deliveryQty = Number(checkData[0].I_SHIP_CFM);

    // Case 1 : Total Delivery Qty = SO Qty
    if (deliveryQty === soQty) {

        var sqlUpd =
            "UPDATE [T_PR_SORD] " +
            "SET [I_CONFIRM_STATUS] = '1' " +
            "WHERE [I_SONO] = '" + item.I_SONO + "' " +
            "AND [I_LNNO] = " + item.I_LNNO + "";

        TalonDbUtil.update(TALON.getDbConfig(), sqlUpd);

        TALON.addMsg("✅ Confirmed Successfully");
        TALON.setIsSuccess(true);
    }
    // Case 2 : Total Delivery Qty ≠ SO Qty
    else {
        TALON.addMsg("⚠️ Delivery Qty does not equal to SO Qty");
        TALON.setIsSuccess(false);
    }
}


var searchData = TALON.getConditionData();
var valStr = extractValues(searchData.SELECTED);

if (valStr !== '') {
    valStr.forEach(function(item) {
        onExceedQtyChk(item);
    });
}
