var data = TALON.getBlockData_List(2);
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var selectedItem = null;

data.forEach(function(item) {
    if (item['SEL_CHK'] === "1") {
        selectedItem = item;
    }
});

var Properties = Java.type("java.util.Properties");
var Session = Java.type("jakarta.mail.Session");
var Message = Java.type("jakarta.mail.Message");
var Transport = Java.type("jakarta.mail.Transport");
var PasswordAuthentication = Java.type("jakarta.mail.PasswordAuthentication");
var MimeMessage = Java.type("jakarta.mail.internet.MimeMessage");
var InternetAddress = Java.type("jakarta.mail.internet.InternetAddress");
var Authenticator = Java.type("jakarta.mail.Authenticator");

// ===== Mail Config =====
var MAIL_FROM_ADDRESS = "noreply@bright-better.com";
var MAIL_FROM_NAME = "TALON Mail Notification";

var MAIL_SMTP_LOGIN = "noreply@bright-better.com";
var MAIL_SMTP_PASSWORD = "Bbetter1606";

var MAIL_SMTP_SERVER = "smtp.office365.com";
var MAIL_SMTP_PORT = "587";
var MAIL_SMTP_TIMEOUT = "60000";

var MAIL_SEND_TO = "Watcharapol@bright-better.com";

// ===== SMTP Properties =====
var props = new Properties();
props.put("mail.smtp.host", MAIL_SMTP_SERVER);
props.put("mail.smtp.port", MAIL_SMTP_PORT);
props.put("mail.smtp.auth", "true");
props.put("mail.smtp.starttls.enable", "true");

props.put("mail.smtp.ssl.trust", MAIL_SMTP_SERVER);

props.put("mail.smtp.connectiontimeout", MAIL_SMTP_TIMEOUT);
props.put("mail.smtp.timeout", MAIL_SMTP_TIMEOUT);
props.put("mail.smtp.writetimeout", MAIL_SMTP_TIMEOUT);

// ===== Session with Auth =====
var session = Session.getInstance(
    props,
    new (Java.extend(Authenticator))({
        getPasswordAuthentication: function () {
            return new PasswordAuthentication(
                MAIL_SMTP_LOGIN,
                MAIL_SMTP_PASSWORD
            );
        }
    })
);

if (!selectedItem) {
    TALON.addErrorMsg('⚠️ No Invoice selected');
} else {


    data.forEach(function(item) {
        if (item['SEL_CHK'] === "1") {
            TALON.addMsg('✅ : '+item);
        }
    });
    
    var subject = "Test Mail from Nashorn";
    var body = "This mail was sent using Nashorn + jakarta.mail\n\nRegards,\nTALON";

    // ===== Create Message =====
    var message = new MimeMessage(session);
    message.setFrom(new InternetAddress(MAIL_FROM_ADDRESS, MAIL_FROM_NAME));
    message.setRecipients(
        Message.RecipientType.TO,
        InternetAddress.parse(MAIL_SEND_TO)
    );
    message.setSubject(subject);
    message.setText(body);

    // ===== Send =====
    //Transport.send(message);
    TALON.addMsg('✅ Mail sent Successfully ');

}
