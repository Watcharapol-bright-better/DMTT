// jrunscript -f jscript/data_format.js
function _isString(val) {
        print(typeof val)
        return typeof val === "string";
    }

/**
 * Date format utility.
 * Format datetime string to standard format.
 *
 * Example:
 * print(DateFmt.formatDate("2025-01-10"));
 * // 2025-01-10
 *
 * print(DateFmt.formatDateTime("2025-01-10 14:30:00"));
 * // 2025-01-10 14:30:00
 *
 * print(DateFmt.formatDate("Mon Dec 29 00:00:00 ICT 2025"));
 * // 2025-12-29
 *
 * print(DateFmt.formatDateTime("Thu Dec 25 06:38:09 GMT 2025"));
 * // 2025-12-25 06:38:09
 */
var DateFmt = (function () {

    var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
    var Locale = Java.type("java.util.Locale");

    function _parseDate(dateStr) {

        var formats = [
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd",
            "EEE MMM dd HH:mm:ss z yyyy" // Mon Dec 29 00:00:00 ICT 2025 / GMT
        ];

        var i, sdf;

        for (i = 0; i < formats.length; i++) {
            try {
                sdf = new SimpleDateFormat(formats[i], Locale.ENGLISH);
                return sdf.parse(dateStr);
            } catch (e) {
                // try next format
            }
        }

        return null;
    }

    function formatDate(dateStr) {

        if (!_isString(dateStr)) {
            return null;
        }

        var date = _parseDate(dateStr);
        if (!date) {
            return null;
        }

        var sdf = new SimpleDateFormat("yyyy-MM-dd");
        return sdf.format(date);
    }

    function formatDateTime(dateStr) {

        if (!_isString(dateStr)) {
            return null;
        }

        var date = _parseDate(dateStr);
        if (!date) {
            return null;
        }

        var sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(date);
    }

    return {
        formatDate: formatDate,
        formatDateTime: formatDateTime
    };

})();







// d2 = DateFmt.formatDateTime("Mon Dec 29 14:30:00 ICT 2025");
// print(d2);


// var Date = Java.type("java.util.Date");
// var today = new Date(); // Java Date

// print(today);

 
// var a  = DateFmt.formatDate('Thu Dec 25 06:38:09 GMT 2025');
// print(a);

// var b  = DateFmt.formatDate(today.toString());
// print(b);


// var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
// var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

// var date = 'Thu Dec 25 06:38:09 GMT 2025';
// var c = sdfDisplay.format(date);
// print(c);


// var parser = new SimpleDateFormat("EEE MMM dd HH:mm:ss z yyyy", Locale.ENGLISH);
// var dateObj = parser.parse("Thu Dec 25 06:38:09 GMT 2025");

// var sdf = new SimpleDateFormat("yyyy-MM-dd");
// var result = sdf.format(dateObj);
