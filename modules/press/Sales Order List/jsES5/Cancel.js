function extractValues(input) {
    var result = [];
    var newIndex = 1;

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


var OSStatus = {
    Open: '00',
    Delivered: '01',
    Closed: '02',
    Cancelled: '03'
};


function onCancelSOChk(item) {

    var sqlChk = "SELECT " +
    " ISNULL([SI].[I_SHIP_CFM], 0) AS [I_SHIP_CFM], " + // Delivered Qty
    " [SD].[I_COMPCLS] " +                           // SO Status
    "FROM [T_PR_SORD] [SD] " +
    "LEFT JOIN [T_MT_SHIP_INST] [SI] " +
    "  ON [SI].[I_SONO] = [SD].[I_SONO] " +
    "WHERE [SD].[I_SONO] = '" + item.I_SONO + "' " +
    "AND [SD].[I_LNNO] = " + item.I_LNNO + "";


    var checkData = TalonDbUtil.select(TALON.getDbConfig(), sqlChk);

    if (!checkData || checkData.length === 0) {
        TALON.addErrorMsg("❌ SO Detail not found");
        return;
    }

    var deliveredQty = Number(checkData[0].I_SHIP_CFM || 0);
    var status = checkData[0].I_COMPCLS;

    // Case 1: Open & Delivered Qty = 0
    if (status === OSStatus.Open && deliveredQty === 0) {

        var sqlUpdate = "UPDATE [T_PR_SORD] " +
            "SET [I_COMPCLS] = '" + OSStatus.Cancelled + "' " +
            "WHERE I_SONO = '" + item.I_SONO + "' " +
            "AND I_LNNO = '" + item.I_LNNO + "'";

        TalonDbUtil.update(TALON.getDbConfig(), sqlUpdate);

        TALON.addMsg("✅ Cancelled SO Detail Successfully");
        TALON.setIsSuccess(true);
        return;
    }

    // Case 2: Open & Delivered Qty > 0
    if (status === OSStatus.Open && deliveredQty > 0) {
        TALON.addErrorMsg(
            "⚠️ SO Detail have been partially delivered. Please use Close SO funtion instead."
        );
        return;
    }

    // Case 3: Closed
    if (status === OSStatus.Closed) {
        TALON.addErrorMsg("⚠️ SO Detail is already closed");
        return;
    }

    // Case 4: Cancelled
    if (status === OSStatus.Cancelled) {
        TALON.addErrorMsg("⚠️ SO Detail is already cancelled");
        return;
    }
}


var searchData = TALON.getConditionData();
var valStr = extractValues(searchData.SELECTED);


valStr.forEach(function(item) {
    onCancelSOChk(item);
});
