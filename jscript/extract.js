
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



var val = extractUniqueID('1:SOP26010041,2:SOP26010041,3:SOP26010041,5:SOP26010042,7:SOP26010043,');
print(val);

// jrunscript -f jscript/extract.js