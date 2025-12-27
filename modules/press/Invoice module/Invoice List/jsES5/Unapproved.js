var data = TALON.getBlockData_List(2);
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
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

    var checkStatus = "SELECT [I_APPR_STATUS] FROM [T_PR_INVOICE_H] WHERE [I_INVOICE_NO] = '" 
        + selectedItem['I_INVOICE_NO'] + "'";

    var Status = TalonDbUtil
        .select(TALON.getDbConfig(), checkStatus)[0]['I_APPR_STATUS'];

    var isApproval = {
        Unapproved: '0',
        Approved: '1'
    };

    if (Status === isApproval.Unapproved) {
        TALON.addErrorMsg('⚠️ Invoice already unapproved');
    } else {

        data.forEach(function(item) {
        if (item['SEL_CHK'] === "1") {

            var sql =
                "UPDATE [T_PR_INVOICE_H] SET " +
                " [I_APPR_STATUS]   = '0', " +
                " [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, " +
                " [UPDATED_DATE]  = GETDATE(), " +
                " [CREATED_PRG_NM]= '" + ProgramNM + "', " +
                " [CREATED_BY]    = '" + UserId + "' " +
                "WHERE [I_INVOICE_NO]  = '" + item['I_INVOICE_NO'] + "'";

            TalonDbUtil.update(TALON.getDbConfig(), sql);
        }
    });


        TALON.addMsg('✅ Unapproved successfully');
    }
}
