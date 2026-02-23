var data = TALON.getBlockData_List(2);
var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var selectedItem = null;

data.forEach(function(item) {
  if (item['SEL_CHK'] === "1" && !selectedItem) {
    selectedItem = item;
  }
});

if (!selectedItem) {
  TALON.addErrorMsg('⚠️ No Invoice selected');
} else {

  data.forEach(function(item) {
    if (item['SEL_CHK'] === "1") {

      var result = runNewRequest('SP_WF_REQUEST', item['I_INVOICE_NO'], 'test 1');
      if (result.status) {
        var x = result.message;
        //TALON.addMsg(x);
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