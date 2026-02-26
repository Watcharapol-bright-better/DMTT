var data = TALON.getBlockData_List(2);
var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var selectedItem = [];

data.forEach(function(item) {
  if (item['SEL_CHK'] === "1" && !selectedItem) {
    selectedItem.push(item);
  }
});

if (!selectedItem) {
  TALON.addErrorMsg('⚠️ No Invoice selected');
} else {

  data.forEach(function(item) {
    if (item['SEL_CHK'] === "1") {

      var result = runApprove('SP_WF_APPROVAL_ACTION', item['I_INVOICE_NO'], null);
      if (result.status) {
        TALON.addMsg('✅ Invoice Rejected Successfully');
      } else {
        var y = result.message;
        TALON.addErrorMsg(y);
      }
      
    }
  });
}



function runRejecte(procName, ref_no, remark) {
  var params = [];
  params['I_USER_ID'] = UserId;
  params['I_REF_DOC_NO'] = ref_no;
  params['I_KIND'] = actorType['Approver'];
  params['I_STATUS'] = actionType['Approved'];
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