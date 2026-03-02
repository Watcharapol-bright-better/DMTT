// ===== Content Type Enum =====
var ContentType = {
  TEXT_PLAIN: "text/plain; charset=utf-8",
  TEXT_HTML: "text/html; charset=utf-8",
  MULTIPART: "multipart/mixed"
};

// ===== Approval Status Mapping =====
var ApprStatus = {
  "0": "Pending",
  "1": "Approved",
  "2": "Unapproved",
  "3": "Rejected"
};

function getApprStatus(typeCode) {
  return ApprStatus[typeCode] || "Wait";
}

function getApprStatusBadge(statusCode) {
  var statusText = getApprStatus(statusCode);
  var backgroundColor;
  var textColor;

  switch (statusCode) {
    case "0": // Pending
      backgroundColor = "#fff8e1";
      textColor = "#f57f17";
      break;

    case "1": // Approved
      backgroundColor = "#e8f5e9";
      textColor = "#2e7d32";
      break;

    case "2": // Unapproved
      backgroundColor = "#eceff1";
      textColor = "#455a64";
      break;

    case "3": // Rejected
      backgroundColor = "#ffebee";
      textColor = "#c62828";
      break;

    default: // Unknown
      backgroundColor = "#f5f5f5";
      textColor = "#757575";
  }

  return (
    '<span style="background-color:' +
    backgroundColor +
    '; color:' +
    textColor +
    '; padding:4px 8px; border-radius:4px; font-weight:500; font-size:12px;">' +
    statusText +
    "</span>"
  );
}

// ===== Create HTML Table Function =====
function createTableHTML(items) {
  var html = '<div style="font-family: Arial, sans-serif;">';
  html += '<h2 style="color: #333;">Quotation List (Request Approve)</h2>';

  html += '<table style="border-collapse: collapse; width: 100%; margin-top: 20px;">';
  html += "<thead>";
  html += '<tr style="background-color: #4c5eaf; color: white;">';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">No.</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Quotation No.</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Quotation Month</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Customer Code</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Customer Name</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Customer PO Month</th>';
  html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Currency</th>';
  html += "</tr>";
  html += "</thead>";
  html += "<tbody>";

  // Filter เอาเฉพาะ Header (LVL = 1)
  var headers = [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].LVL === "1") {
      headers.push(items[i]);
    }
  }

  for (var i = 0; i < headers.length; i++) {
    var item = headers[i];
    var rowColor = i % 2 === 0 ? "#f9f9f9" : "#ffffff";

    html += '<tr style="background-color: ' + rowColor + ';">';
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' + (i + 1) + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;"><strong>' +
      (item.I_QT_NO || "") + "</strong></td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (DateFmt.formatDate(item.I_QT_MTH.toString()) || "") + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (item.I_CSCODE || "") + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (item.I_NAME || "") + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (DateFmt.formatDate(item.I_PO_MONTH.toString()) || "") + "</td>";
    html += '<td style="border: 1px solid #ddd; padding: 10px;">' +
      (item.I_CURRENCY || "") + "</td>";
    html += "</tr>";
  }

  html += "</tbody>";
  html += "</table>";

  html += '<p style="margin-top: 20px; color: #666;">Total Records: <strong>' +
    headers.length + "</strong></p>";

  html +=
    '<div style="margin-top: 30px; text-align: center;">' +
    '<a href="'+TALON.getBindValue('DOMAIN_TLN')+'/MAIL_REDIRECT_QT.html" ' +
    'style="background-color: #4c5eaf; color: white; padding: 12px 24px; ' +
    'text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">' +
    'Approval' +
    '</a>' +
    '</div>';

  html += "</div>";

  return html;
}


// ===== Main Execution =====
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

if (selectedItem.length === 0) {
  TALON.addErrorMsg('⚠️ No Quotation selected');
} else {
  var successCount = 0;
  var errorMessages = [];

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
      "WHERE REQ.I_USER_ID = '" + UserId + "' " +
      "  AND REQ.I_KIND = '1001' " +
      "  AND REQ.I_ACTIVE_FLAG = '1' " +
      "ORDER BY APP.I_LEVEL";

  var userData = TalonDbUtil.select(TALON.getDbConfig(), sql)[0];
  var department = userData['I_GROUP'];

  // Group items by QT_NO to get unique quotations
  var uniqueQTs = {};
  selectedItem.forEach(function(item) {
    if (!uniqueQTs[item.I_QT_NO]) {
      uniqueQTs[item.I_QT_NO] = item;
    }
  });

  // Process each unique QT
  for (var qtNo in uniqueQTs) {
    var result = runWorkflowAction('SP_WF_SUBMIT_REQUEST', qtNo, department, 'Request for approval');
    
    if (result.status) {
      successCount++;
    } else {
      errorMessages.push(qtNo + ': ' + result.message);
    }
  }

  // Send email only after all items are processed successfully
  if (successCount > 0) {
    if (userData) {
      var MAIL_SEND_TO = [userData['APPROVER_EMAIL']];
      var MAIL_SEND_CC = [userData['REQUESTER_EMAIL']];

      sendEmail(
        MAIL_SEND_TO,
        {
          subject: "Request Approve - Quotation",
          body: createTableHTML(selectedItem),
          contentType: ContentType.TEXT_HTML
        },
        {
          cc: MAIL_SEND_CC,
          fromName: "TALON System 📧"
        }
      );

      TALON.addMsg('✅ Send Request Successfully (' + successCount + ' quotation(s))');
    } else {
      TALON.addErrorMsg('⚠️ User authority data not found');
    }
  }

  if (errorMessages.length > 0) {
    errorMessages.forEach(function(msg) {
      TALON.addErrorMsg(msg);
    });
  }
}

function runWorkflowAction(procName, ref_no, dept, remark) {
  var params = [];
  params['I_USER_ID'] = UserId;
  params['I_REF_DOC_NO'] = ref_no;
  params['I_GROUP'] = dept;
  params['I_REMARK'] = remark;
  params['O_RESULT'] = '';

  var outputParams = ['O_RESULT'];
  var result = TalonDbUtil.prepareCall(
    TALON.getDbConfig(),
    procName,
    params,
    outputParams
  );
  
  return JSON.parse(result[0]);
}
