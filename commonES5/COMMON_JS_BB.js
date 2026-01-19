
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


var ContentType = {
    TEXT_PLAIN: "text/plain; charset=utf-8",
    TEXT_HTML: "text/html; charset=utf-8",
    MULTIPART: "multipart/mixed"
};  

/**
 * Send email via SMTP.
 *
 * sendEmail(toEmails, mailData, options)
 *
 * toEmails : string | array
 *   - Recipient email(s)
 *
 * mailData : object
 *   - subject     : string   - Email subject
 *   - body        : string   - Email body
 *   - contentType : string   - Content type (default: TEXT_PLAIN)
 *
 * options : object (optional)
 *   - cc          : string | array - CC email(s)
 *   - bcc         : string | array - BCC email(s)
 *   - fromAddress : string         - From email
 *   - fromName    : string         - From name
 *
 * return :
 *   { success: boolean, message: string }
 * 
 * 
 * // Simple text email
 * sendEmail("user@example.com", {
 *   subject: "Hello",
 *   body: "This is a test"
 * });
 * 
 * 
 * // HTML email with CC
 * sendEmail(
 *   ["user1@example.com", "user2@example.com"],
 *   {
 *     subject: "Report",
 *     body: "<h1>Monthly Report</h1>",
 *     contentType: ContentType.TEXT_HTML
 *   },
 *   {
 *     cc: "manager@example.com"
 *   }
 * );
 * 
 * 
 * // Full options
 * var result = sendEmail(
 *   "customer@example.com",
 *   {
 *     subject: "Order Confirmation",
 *     body: "<p>Thank you!</p>",
 *     contentType: ContentType.TEXT_HTML
 *   },
 *   {
 *     cc: ["sales@example.com"],
 *     bcc: ["archive@example.com"],
 *     fromName: "Sales Team 📧"
 *   }
 * );
 * 
 * if (result.success) {
 *   TALON.addMsg(result.message);
 * } else {
 *   TALON.addErrorMsg(result.message);
 * }
 */
function sendEmail(toEmails, mailData, options) {
  try {
    var Properties = Java.type("java.util.Properties");
    var Session = Java.type("jakarta.mail.Session");
    var Message = Java.type("jakarta.mail.Message");
    var Transport = Java.type("jakarta.mail.Transport");
    var PasswordAuthentication = Java.type("jakarta.mail.PasswordAuthentication");
    var MimeMessage = Java.type("jakarta.mail.internet.MimeMessage");
    var InternetAddress = Java.type("jakarta.mail.internet.InternetAddress");
    var Authenticator = Java.type("jakarta.mail.Authenticator");
    var MimeUtility = Java.type("jakarta.mail.internet.MimeUtility");

    options = options || {};
    var fromAddress = options.fromAddress || "noreply@bright-better.com";
    var fromName = options.fromName || "TALON Mail Notification";
    var contentType = mailData.contentType || ContentType.TEXT_PLAIN;

    // Validate required fields
    if (!toEmails || (Array.isArray(toEmails) && toEmails.length === 0)) {
      return { success: false, message: "❌ To email is required" };
    }
    if (!mailData.subject) {
      return { success: false, message: "❌ Subject is required" };
    }
    if (!mailData.body) {
      return { success: false, message: "❌ Body is required" };
    }

    if (!Array.isArray(toEmails)) {
      toEmails = [toEmails];
    }

    // Get SMTP config from database
    var sql = "SELECT DSP1, DSP2, DSP3, DSP4 FROM [TLN_M_HANYO_CODE_MAIN] " +
              "WHERE [SIKIBETU_CODE] = 'DMTT_G_EMAIL_CFT'";
    var config = TalonDbUtil.select(TALON.getDbConfig(), sql)[0];

    // SMTP Configuration
    var MAIL_SMTP_SERVER = config['DSP1'];      // "smtp.office365.com"
    var MAIL_SMTP_PORT = config['DSP2'];        // "587"
    var MAIL_SMTP_LOGIN = config['DSP3'];       // "noreply@bright-better.com"
    var MAIL_SMTP_PASSWORD = config['DSP4'];    // password
    var MAIL_SMTP_TIMEOUT = "60000";

    // SMTP Properties
    var props = new Properties();
    props.put("mail.smtp.host", MAIL_SMTP_SERVER);
    props.put("mail.smtp.port", MAIL_SMTP_PORT);
    props.put("mail.smtp.auth", "true");
    props.put("mail.smtp.starttls.enable", "true");
    props.put("mail.smtp.ssl.trust", MAIL_SMTP_SERVER);
    props.put("mail.smtp.connectiontimeout", MAIL_SMTP_TIMEOUT);
    props.put("mail.smtp.timeout", MAIL_SMTP_TIMEOUT);
    props.put("mail.smtp.writetimeout", MAIL_SMTP_TIMEOUT);

    // Create session with authentication
    var session = Session.getInstance(
      props,
      new (Java.extend(Authenticator))({
        getPasswordAuthentication: function () {
          return new PasswordAuthentication(MAIL_SMTP_LOGIN, MAIL_SMTP_PASSWORD);
        }
      })
    );

    // Create message
    var message = new MimeMessage(session);
    
    // Set FROM with proper encoding for display name
    var encodedFromName = MimeUtility.encodeText(fromName, "UTF-8", "B");
    message.setFrom(new InternetAddress(fromAddress, encodedFromName, "UTF-8"));
    
    // Set TO recipients
    message.setRecipients(
      Message.RecipientType.TO,
      InternetAddress.parse(toEmails.join(","))
    );

    // Set CC recipients (optional)
    if (options.cc && options.cc.length > 0) {
      var ccEmails = Array.isArray(options.cc) ? options.cc : [options.cc];
      if (ccEmails.length > 0) {
        message.addRecipients(
          Message.RecipientType.CC,
          InternetAddress.parse(ccEmails.join(","))
        );
      }
    }

    // Set BCC recipients (optional)
    if (options.bcc && options.bcc.length > 0) {
      var bccEmails = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      if (bccEmails.length > 0) {
        message.addRecipients(
          Message.RecipientType.BCC,
          InternetAddress.parse(bccEmails.join(","))
        );
      }
    }

    // Set subject with proper encoding
    message.setSubject(mailData.subject, "UTF-8");
    message.setContent(mailData.body, contentType);
    Transport.send(message);

    var recipients = toEmails.length;
    var ccCount = (options.cc && options.cc.length) ? (Array.isArray(options.cc) ? options.cc.length : 1) : 0;
    var bccCount = (options.bcc && options.bcc.length) ? (Array.isArray(options.bcc) ? options.bcc.length : 1) : 0;
    
    var msg = "✅ Email sent to " + recipients + " recipient" + (recipients > 1 ? "s" : "");
    if (ccCount > 0) msg += " • CC: " + ccCount;
    if (bccCount > 0) msg += " • BCC: " + bccCount;

    return {
      success: true,
      message: msg
    };

  } catch (e) {
    return {
      success: false,
      message: "❌ Failed to send email: " + e.message
    };
  }
}