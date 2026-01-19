var data = TALON.getBlockData_List(2);
var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo["USER_ID"];
var ProgramNM = UserInfo["FUNC_ID"];
var selectedItems = [];

data.forEach(function (item) {
  if (item["SEL_CHK"] === "1") {
    selectedItems.push(item);
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

var MAIL_SEND_TO = ["watcharapol@bright-better.com"];

var MAIL_SEND_CC = [
  "watcharapol@bright-better.com",

  "pawared@bright-better.com",
  "apirak@bright-better.com",
  "wutthiphat@bright-better.com",
];

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
      return new PasswordAuthentication(MAIL_SMTP_LOGIN, MAIL_SMTP_PASSWORD);
    },
  }),
);

// ===== Invoice Type Mapping =====
var InvoiceType = {
  0: "Invoice",
  1: "Debit Note",
  2: "Credit Note",
};

function getInvoiceTypeName(typeCode) {
  return InvoiceType[typeCode] || "Unknown";
}

var ApprStatus = {
  0: "Unapproved",
  1: "Approved",
};

function getApprStatus(typeCode) {
  return ApprStatus[typeCode] || "Unknown";
}

function getApprStatusBadge(statusCode) {
  var statusText = getApprStatus(statusCode);
  var backgroundColor = "";
  var textColor = "";

  if (statusCode === "0") {
    backgroundColor = "#ffebee";
    textColor = "#c62828";
  } else if (statusCode === "1") {
    backgroundColor = "#e8f5e9";
    textColor = "#2e7d32";
  } else {
    backgroundColor = "#f5f5f5";
    textColor = "#757575";
  }

  return (
    '<span style="background-color: ' +
    backgroundColor +
    "; color: " +
    textColor +
    '; padding: 4px 8px; border-radius: 4px; font-weight: 500;">' +
    statusText +
    "</span>"
  );
}

function createTableHTML(items) {
  var html = '<div style="font-family: Arial, sans-serif;">';
  html += '<h2 style="color: #333;">Invoice List (Press)</h2>';
  html +=
    '<table style="border-collapse: collapse; width: 100%; margin-top: 20px;">';
  html += "<thead>";
  html += '<tr style="background-color: #4c5eaf; color: white;">';
  html +=
    '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">No.</th>';
  html +=
    '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Invoice No</th>';
  html +=
    '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Invoice Type</th>';
  html +=
    '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Ship Order No</th>';
  html +=
    '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Customer Name</th>';
  html +=
    '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Ship To</th>';
  html +=
    '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Invoice Date</th>';
  html +=
    '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Status</th>';
  html += "</tr>";
  html += "</thead>";
  html += "<tbody>";

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var rowColor = i % 2 === 0 ? "#f9f9f9" : "#ffffff";

    html += '<tr style="background-color: ' + rowColor + ';">';
    html +=
      '<td style="border: 1px solid #ddd; padding: 10px;">' + (i + 1) + "</td>";
    html +=
      '<td style="border: 1px solid #ddd; padding: 10px;"><strong>' +
      (item.I_INVOICE_NO || "") +
      "</strong></td>";
    html +=
      '<td style="border: 1px solid #ddd; padding: 10px;"><span style="background-color: #e3f2fd; padding: 4px 8px; border-radius: 4px;">' +
      getInvoiceTypeName(item.I_TYPE) +
      "</span></td>";
    html +=
      '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (item.I_SHIP_ORDER_NO || "") +
      "</td>";
    html +=
      '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (item.I_NAME || "") +
      "</td>";
    html +=
      '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (item.I_SHIP_TO || "") +
      "</td>";
    html +=
      '<td style="border: 1px solid #ddd; padding: 10px;">' +
      DateFmt.formatDate(item.I_INVOICE_DATE.toString()) +
      "</td>";
    html +=
      '<td style="border: 1px solid #ddd; padding: 10px;">' +
      getApprStatusBadge(item.I_APPR_STATUS) +
      "</td>";
    html += "</tr>";
  }

  html += "</tbody>";
  html += "</table>";
  html +=
    '<p style="margin-top: 20px; color: #666;">Total Records: <strong>' +
    items.length +
    "</strong></p>";
  html += "</div>";

  return html;
}

if (!selectedItems || selectedItems.length === 0) {
  TALON.addErrorMsg("⚠️ No Invoice selected");
} else {
  var subject = "Invoice List - " + selectedItems.length + " record(s)";
  var body = createTableHTML(selectedItems);

  var message = new MimeMessage(session);
  message.setFrom(new InternetAddress(MAIL_FROM_ADDRESS, MAIL_FROM_NAME));
  message.setRecipients(
    Message.RecipientType.TO,
    InternetAddress.parse(MAIL_SEND_TO.join(",")),
  );

  if (MAIL_SEND_CC && MAIL_SEND_CC.length > 0) {
    message.addRecipients(
      Message.RecipientType.CC,
      InternetAddress.parse(MAIL_SEND_CC.join(",")),
    );
  }

  message.setSubject(subject);
  message.setContent(body, "text/html; charset=utf-8");

  Transport.send(message);
  TALON.addMsg(
    "✅ Mail sent successfully to " + selectedItems.length + " invoices ",
  );
}
