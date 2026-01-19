// ===== Content Type Enum =====
var ContentType = {
  TEXT_PLAIN: "text/plain; charset=utf-8",
  TEXT_HTML: "text/html; charset=utf-8",
  MULTIPART: "multipart/mixed"
};

// ===== Invoice Type Mapping =====
var InvoiceType = {
  0: "Invoice",
  1: "Debit Note",
  2: "Credit Note"
};

// ===== Approval Status Mapping =====
var ApprStatus = {
  0: "Unapproved",
  1: "Approved"
};

function getInvoiceTypeName(typeCode) {
  return InvoiceType[typeCode] || "Unknown";
}

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

// ===== Create HTML Table Function =====
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


// ===== Main Logic =====
var data = TALON.getBlockData_List(2);
var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo["USER_ID"];
var ProgramNM = UserInfo["FUNC_ID"];
var selectedItems = [];

// Filter selected items
data.forEach(function (item) {
  if (item["SEL_CHK"] === "1") {
    selectedItems.push(item);
  }
});

// Send email if items are selected
if (!selectedItems || selectedItems.length === 0) {
  TALON.addErrorMsg("⚠️ No Invoice selected");
} else {
  
  var MAIL_SEND_TO = ["watcharapol@bright-better.com"];

  var MAIL_SEND_CC = [
    "watcharapol@bright-better.com",
    "apirak@bright-better.com",
    "aelysiam@gmail.com",
  ];

  var MAIL_SEND_BCC = [
    "pawared@bright-better.com",
    "apirak@bright-better.com",
    "wutthiphat@bright-better.com",
  ];
  
  var result = sendEmail(
    MAIL_SEND_TO,
    {
      subject: "Invoice List - " + selectedItems.length + " record(s)",
      body: createTableHTML(selectedItems),
      contentType: ContentType.TEXT_HTML
    },
    {
      cc: MAIL_SEND_CC,
      bcc: MAIL_SEND_BCC,
      fromName: "TALON System 📧" 
    }
  );

  if (result.success) {
    TALON.addMsg(result.message);
  } else {
    TALON.addErrorMsg(result.message);
  }

}