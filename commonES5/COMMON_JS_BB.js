
function formatDateYMD(date) {
    var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
    var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

    return sdfDisplay.format(date);
}

function formatDateYMDHMS(date) {
    var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
    var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    return sdfDisplay.format(date);
}


function _isString(val) {
    return typeof val === "string";
}


function _isBoolean(val) {
    return typeof val === "boolean";
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
    var GregorianCalendar = Java.type("java.util.GregorianCalendar");

    function _newSDF(pattern) {
        var sdf = new SimpleDateFormat(pattern, Locale.ENGLISH);
        sdf.setCalendar(new GregorianCalendar());
        return sdf;
    }

    function _parseDate(dateStr) {

        var formats = [
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd",
            "EEE MMM dd HH:mm:ss z yyyy"
        ];

        for (var i = 0; i < formats.length; i++) {
            try {
                return _newSDF(formats[i]).parse(dateStr);
            } catch (e) {}
        }
        return null;
    }

    function formatDate(dateStr) {
        if (typeof dateStr !== "string") return null;

        var date = _parseDate(dateStr);
        if (!date) return null;

        return _newSDF("yyyy-MM-dd").format(date);
    }

    function formatDateTime(dateStr) {
        if (typeof dateStr !== "string") return null;

        var date = _parseDate(dateStr);
        if (!date) return null;

        return _newSDF("yyyy-MM-dd HH:mm:ss").format(date);
    }

    return {
        formatDate: formatDate,
        formatDateTime: formatDateTime
    };

})();






/**
 * Running number generator.
 * Get next running number from database.
 *
 * genId(id, format, isCommit)
 *
 * id       : string   - Code type (ex. "DMTT_N_IV")
 * format   : string   - Number format (ex. "IVyyyymmxxxxx")
 * isCommit : boolean  - Commit after generate (default: false)
 *
 * Example:
 * var no = RunningNo.genId("DMTT_N_IV", "IVyyyymmxxxxx", true);
 */
var RunningNo = (function () {

    var _SP = "SP_RUN_NUMBERING_V1";
    

    function genId(id, format, isCommit) {

        if (typeof isCommit === "undefined") {
            isCommit = false;
        }

        if (!_isString(id)) {
            TALON.setIsSuccess(false);
            TALON.addErrorMsg("id must be string");
            return null;
        }

        if (!_isString(format)) {
            TALON.setIsSuccess(false);
            TALON.addErrorMsg("format must be string");
            return null;
        }

        if (!_isBoolean(isCommit)) {
            TALON.setIsSuccess(false);
            TALON.addErrorMsg("isCommit must be boolean");
            return null;
        }

        var sql =
            "DECLARE @Id NVARCHAR(MAX) " +
            "EXEC " + _SP + " " +
            " @CodeType = N'" + id + "', " +
            " @Format = N'" + format + "', " +
            " @GeneratedNo = @Id OUTPUT " +
            "SELECT @Id AS [NUMBERING]";

        var result = TalonDbUtil.select(
            TALON.getDbConfig(),
            sql
        );

        if (!result || !result.length) {
            TALON.setIsSuccess(false);
            TALON.addErrorMsg("generate id failed");
            return null;
        }

        if (isCommit === true) {
            TalonDbUtil.commit(TALON.getDbConfig());
        }

        return result[0]["NUMBERING"].toString();
    }

    return {
        genId: genId
    };

})();



print(DateFmt.formatDateTime("Thu Dec 25 06:38:09 GMT 2025"));
print(DateFmt.formatDate("Mon Dec 29 00:00:00 ICT 2025"));
print(DateFmt.formatDateTime("2025-01-10 14:30:00"));

var now = new java.util.Date();
print(DateFmt.formatDateTime(now.toString()));
