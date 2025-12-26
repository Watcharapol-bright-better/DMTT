var DetailData = TALON.getBlockData_List(2);

var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];

var PACK_STATUS = {
    PENDING: '0',
    PICKING: '1',
    COMPLETED: '2',
    CONFIRMED: '3'
};

var shipInst = null;
var notPackedItems = [];

for (var i = 0; i < DetailData.length; i++) {

    var d = DetailData[i];

    if (!shipInst) {
        shipInst = d['I_SHIP_INST'];
    }

    if (d['I_SHP_PCK_STATUS'] !== PACK_STATUS.COMPLETED) {
        notPackedItems.push(d['I_ITEMCODE']);
    }
}

if (notPackedItems.length > 0) {

    TALON.addErrorMsg(
        "❌ Items not in Completed status:\n" + 
        "- " + notPackedItems.join("\n- ")
    );
    TALON.setIsSuccess(false);

} else {

    try {

        var sqlUpdate = ""
            + "UPDATE [H] "
            + "SET [H].I_SHIP_CFM = '" + PACK_STATUS.CONFIRMED + "', "
            + "    [H].UPDATED_BY = '" + UserId + "', "
            + "    [H].UPDATED_PRG_NM = '" + ProgramNM + "', "
            + "    [H].UPDATED_DATE = GETDATE(), "
            + "    [H].MODIFY_COUNT = ISNULL([H].MODIFY_COUNT, 0) + 1 "
            + "FROM T_PR_SHIP_INST_H [H] "
            + "WHERE [H].I_SHIP_INST = '" + shipInst + "'";

        TalonDbUtil.update(TALON.getDbConfig(), sqlUpdate);

        TALON.addMsg("✅ Shipment confirmed successfully");
        TALON.setIsSuccess(true);

    } catch (e) {

        TALON.addErrorMsg("❌ Shipment confirmation failed: " + e);
        TALON.setIsSuccess(false);
    }
}
