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

  var checkStatus = "SELECT [I_APPR_STATUS] FROM [T_PR_INVOICE_H] WHERE [I_INVOICE_NO] = '" +
    selectedItem['I_INVOICE_NO'] + "'";

  //TALON.addMsg(checkStatus);    

  var Status = TalonDbUtil
    .select(TALON.getDbConfig(), checkStatus)[0]['I_APPR_STATUS'];

  var isApproval = {
    Unapproved: '0',
    Approved: '1'
  };

  // ถ้า Approved แล้ว
  if (Status === isApproval.Approved) {
    TALON.addErrorMsg('⚠️ Invoice already approved');
  } else {

    data.forEach(function(item) {
      if (item['SEL_CHK'] === "1") {

        var result = runApprove('SP_WF_APPROVE_REJECT', item['I_INVOICE_NO'], 'Approved!');
        if (result.status) {
          var sql =
            "UPDATE [T_PR_INVOICE_H] SET " +
            " [I_APPR_STATUS]   = '1', " +
            " [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, " +
            " [UPDATED_DATE]  = GETDATE(), " +
            " [CREATED_PRG_NM]= '" + ProgramNM + "', " +
            " [CREATED_BY]    = '" + UserId + "' " +
            "WHERE [I_INVOICE_NO]  = '" + item['I_INVOICE_NO'] + "'";

          TalonDbUtil.update(TALON.getDbConfig(), sql);
          TALON.addMsg('✅ Invoice Approved Successfully');
        } else {
          var y = result.message;
          TALON.addErrorMsg(y);
        }

      }
    });



  }
}


function runApprove(procName, ref_no, remark) {
  var params = [];
  params['I_USER_ID'] = UserId;
  params['I_REF_DOC_NO'] = ref_no;
  params['I_KIND'] = '1002'; // Approved
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