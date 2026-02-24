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
  html += '<h2 style="color: #333;">Invoice List (Request Approve)</h2>';

  html +=
    '<table style="border-collapse: collapse; width: 100%; margin-top: 20px;">';
  html += "<thead>";
  html += '<tr style="background-color: #4c5eaf; color: white;">';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">No.</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Invoice No</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Invoice Type</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Ship Order No</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Customer Name</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Ship To</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Invoice Date</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Status</th>';
  html += "</tr>";
  html += "</thead>";
  html += "<tbody>";

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var rowColor = i % 2 === 0 ? "#f9f9f9" : "#ffffff";

    html += '<tr style="background-color: ' + rowColor + ';">';
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' + (i + 1) + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;"><strong>' +
      (item.I_INVOICE_NO || "") + "</strong></td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      getInvoiceTypeName(item.I_TYPE) + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (item.I_SHIP_ORDER_NO || "") + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (item.I_NAME || "") + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (item.I_SHIP_TO || "") + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      DateFmt.formatDate(item.I_INVOICE_DATE.toString()) + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      getApprStatusBadge(item.I_APPR_STATUS) + "</td>";
    html += "</tr>";
  }

  html += "</tbody>";
  html += "</table>";

  html += '<p style="margin-top: 20px; color: #666;">Total Records: <strong>' +
    items.length + "</strong></p>";

  html +=
    '<div style="margin-top: 30px; text-align: center;">' +
    '<a href="'+TALON.getBindValue('DOMAIN_TLN')+'/MAIL_REDIRECT_INV.html" ' +
    'style="background-color: #4c5eaf; color: white; padding: 12px 24px; ' +
    'text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">' +
    'Approval' +
    '</a>' +
    '</div>';

  html += "</div>";

  return html;
}

var data = TALON.getBlockData_List(2);
var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var selectedItem = [];

data.forEach(function(item) {
  if (item['SEL_CHK'] === "1") {
    selectedItem.push(item);
  }
});

if (!selectedItem) {
  TALON.addErrorMsg('⚠️ No Invoice selected');
} else {

  data.forEach(function(item) {
    if (item['SEL_CHK'] === "1") {


      var result = runNewRequest('SP_WF_REQUEST', item['I_INVOICE_NO'], 'test 1');
      // result.status
      if (result.status) {        
        var sql =
              "" +
              "SELECT " +
              "    REQ.I_USER_ID AS REQUESTER_ID, " +
              "    REQ.I_EMAIL AS REQUESTER_EMAIL, " +
              "    REQ.I_GROUP, " +
              "    'Requester' AS REQUESTER_ROLE, " +
              "    APP.I_USER_ID AS APPROVER_ID, " +
              "    APP.I_EMAIL AS APPROVER_EMAIL, " +
              "    APP.I_LEVEL AS APPROVER_LEVEL, " +
              "    CASE APP.I_IS_FINAL " +
              "        WHEN '1' THEN 'YES' " +
              "        ELSE 'NO' " +
              "    END AS IS_FINAL_APPROVER, " +
              "    'Approver' AS APPROVER_ROLE " +
              "FROM [USER_AUTHORITY] REQ " +
              "INNER JOIN [USER_AUTHORITY] APP " +
              "    ON APP.I_GROUP = REQ.I_GROUP " +
              "    AND APP.I_KIND = '1002' " +
              "    AND APP.I_ACTIVE_FLAG = '1' " +
              "WHERE REQ.I_USER_ID = '"+UserId+"' " +
              "  AND REQ.I_KIND = '1001' " +
              "  AND REQ.I_ACTIVE_FLAG = '1' " +
              "ORDER BY APP.I_LEVEL";        
          var userData = TalonDbUtil.select(TALON.getDbConfig(), sql)[0];
          //TALON.addMsg(userData);
          
          var MAIL_SEND_TO = [userData['APPROVER_EMAIL']];
          var MAIL_SEND_CC = [userData['REQUESTER_EMAIL']];

          //TALON.addMsg(MAIL_SEND_TO);
          //TALON.addMsg(MAIL_SEND_CC);

          sendEmail(
            MAIL_SEND_TO,
            {
              subject: "Request Approve",
              body: createTableHTML(selectedItem),
              contentType: ContentType.TEXT_HTML
            },
            {
              cc: MAIL_SEND_CC,
              fromName: "TALON System 📧" 
            }
          );

        TALON.addMsg('✅ Send Request Successfully');
      } else {
        var y = result.message;
        TALON.addErrorMsg(y);
      }


    }
  });
}


function runNewRequest(procName, ref_no, remark) {
  var params = [];
  params['I_USER_ID'] = UserId;
  params['I_REF_DOC_NO'] = ref_no;
  params['I_GROUP'] = '1';
  params['I_PRIORITY'] = 'N';
  params['I_REMARK'] = remark;
  params['O_RESULT'] = ''; // Output parameter

  var outputParams = ['O_RESULT'];
  var result = TalonDbUtil.prepareCall(
    TALON.getDbConfig(),
    procName,
    params,
    outputParams
  );
  //TALON.addMsg(result);
  return JSON.parse(result[0]);
}