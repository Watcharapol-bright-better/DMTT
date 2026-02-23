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

      var result = runRejecte('SP_WF_APPROVE_REJECT', item['I_INVOICE_NO'], 'Rejected!');
      if (result.status) {
        var sql =
          "UPDATE [T_PR_INVOICE_H] SET " +
          " [I_APPR_STATUS]   = '2', " +
          " [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, " +
          " [UPDATED_DATE]  = GETDATE(), " +
          " [CREATED_PRG_NM]= '" + ProgramNM + "', " +
          " [CREATED_BY]    = '" + UserId + "' " +
          "WHERE [I_INVOICE_NO]  = '" + item['I_INVOICE_NO'] + "'";

        TalonDbUtil.update(TALON.getDbConfig(), sql);
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
  params['I_KIND'] = '1003'; // Rejected
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