

/*
 * var val = extractUniqueID('1:SOP26010041,2:SOP26010041,3:SOP26010041,5:SOP26010042,7:SOP26010043,');
 * print(val); // SOP26010041,SOP26010042,SOP26010043
 */
function extractUniqueID(str) {

    var result = {};
    var list = str.split(',');

    list.forEach(function (item) {

        if (!item) return;

        var parts = item.split(':');
        if (parts.length !== 2) return;

        var id = parts[1].trim();
        if (id) {
            result[id] = true;
        }
    });

    // แปลง key กลับเป็น array
    var idSet = [];
    for (var key in result) {
        if (result.hasOwnProperty(key)) {
            idSet.push(key);
        }
    }

    return idSet;
}


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
}


function onCloseSOBySONO(sono) {

    var sqlChk =
        "SELECT " +
        " ISNULL([SI].[I_SHIP_CFM], 0) AS [I_SHIP_CFM], " +
        " [SD].[I_COMPCLS], " +
        " [SD].[I_LNNO] " +
        "FROM [T_PR_SORD_D] [SD] " +
        "LEFT JOIN [T_MT_SHIP_INST] [SI] " +
        "  ON [SI].[I_SONO] = [SD].[I_SONO] " +
        "WHERE [SD].[I_SONO] = '" + sono + "'";

    var rows = TalonDbUtil.select(TALON.getDbConfig(), sqlChk);

    if (!rows || rows.length === 0) {
        TALON.addErrorMsg("❌ SO not found : " + sono);
        return;
    }

    rows.forEach(function (row) {

        var deliveredQty = Number(row.I_SHIP_CFM);
        var status = row.I_COMPCLS;
        var lnno = row.I_LNNO;

        // Case: Open & Delivered > 0 → Close
        if (status === OSStatus.Open && deliveredQty > 0) {

            var sqlUpdate =
                "UPDATE [T_PR_SORD_D] SET " +
                " [I_COMPCLS] = '" + OSStatus.Closed + "' " +
                "WHERE [I_SONO] = '" + sono + "' " +
                "AND [I_LNNO] = '" + lnno + "' ";

            TalonDbUtil.update(TALON.getDbConfig(), sqlUpdate);
            TALON.addMsg("✅ Closed SO Detail Successfully");
        }

        // Case 2: Open & Delivered Qty = 0
        if (status === OSStatus.Open && deliveredQty === 0) {
            TALON.addErrorMsg(
                "⚠️ SO Detail have not been delivered yet. Please use Cancel function instead."
            );

        }

        // Case 3: Closed
        if (status === OSStatus.Closed) {
            TALON.addErrorMsg("⚠️ SO Detail is already closed");
        }

        // Case 4: Cancelled
        if (status === OSStatus.Cancelled) {
            TALON.addErrorMsg("⚠️ SO Detail is already cancelled");
        }
    });

    
}


var searchData = TALON.getConditionData();
var soList = extractUniqueID(searchData.SELECTED);

soList.forEach(function (sono) {
    onCloseSOBySONO(sono);
});



// var msg = "";
// valStr.forEach(function(item) {
//     msg += "index: " + item.index +
//            ", I_SONO: " + item.I_SONO +
//            ", I_LNNO: " + item.I_LNNO + "\n";    
// });
// TALON.addMsg(msg);
