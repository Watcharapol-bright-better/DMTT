var data = TALON.getBlockData_List(2);
var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var selectedItem = [];

var actorType = {
  'Requester': '1001',
  'Approver': '1002'
}

var actionType = {
  'Approved': '1',
  'Unapproved': '2',
  'Rejected': '3'
}

data.forEach(function(item) {
  if (item['SEL_CHK'] === "1") {
    selectedItem.push(item);
  }
});


if (!selectedItem) {
    TALON.addErrorMsg('⚠️ No quotation selected');
} else {

  var Status = selectedItem['WF_CURRENT_EVENT_STATUS'];
  if (Status === actionType.Unapproved) {
    TALON.addErrorMsg('⚠️ Quotation already unapproved');
  } else {

    data.forEach(function(item) {
      if (item['SEL_CHK'] === "1") {
        var result = runWorkflowAction('SP_WF_APPROVAL_ACTION', item['I_QT_NO'], null);
        if (result.status) {
          TALON.addMsg('✅ Quotation [' + item['I_QT_NO'] + '] Unapproved Successfully');
        } else {
          var y = result.message;
          TALON.addErrorMsg(y);
        }

      }
    });

  }
}

function runWorkflowAction(procName, ref_no, remark) {
  var params = [];
  params['I_USER_ID'] = UserId;
  params['I_REF_DOC_NO'] = ref_no;
  params['I_KIND'] = actorType['Approver'];
  params['I_STATUS'] = actionType['Unapproved'];
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
