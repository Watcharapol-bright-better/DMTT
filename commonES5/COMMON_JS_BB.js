

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

