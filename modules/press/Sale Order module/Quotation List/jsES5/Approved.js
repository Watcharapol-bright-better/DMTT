var data = TALON.getBlockData_List(2);
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var selectedItem = null;

data.forEach(function(item) {
    if (item['CHK'] === "1" && !selectedItem) {
        selectedItem = item;
    }
});

if (!selectedItem) {
    TALON.addErrorMsg('⚠️ No quotation selected');
} else {

    var checkStatus = "SELECT [I_QT_STATUS] FROM [T_PR_QT_D] WHERE [I_QT_NO] = '" 
        + selectedItem['I_QT_NO'] + "'";

    var Status = TalonDbUtil
        .select(TALON.getDbConfig(), checkStatus)[0]['I_QT_STATUS'];

    var isApproval = {
        Unapproved: '0',
        Approved: '1'
    };

    // ถ้า Approved แล้ว
    if (Status === isApproval.Approved) {
        TALON.addErrorMsg('⚠️ Quotation already approved');
    } else {

        data.forEach(function(item) {
        if (item['CHK'] === "1") {

            var sql =
                "UPDATE [T_PR_QT_D] SET " +
                " [I_QT_STATUS]   = '1', " +
                " [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, " +
                " [UPDATED_DATE]  = GETDATE(), " +
                " [CREATED_PRG_NM]= '" + ProgramNM + "', " +
                " [CREATED_BY]    = '" + UserId + "' " +
                "WHERE [I_QT_NO]  = '" + item['I_QT_NO'] + "'";

                TalonDbUtil.update(TALON.getDbConfig(), sql);
            }
        });


        TALON.addMsg('✅ Quotation Approved Successfully');
    }
}
