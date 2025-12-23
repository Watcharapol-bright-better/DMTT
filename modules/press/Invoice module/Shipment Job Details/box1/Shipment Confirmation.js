var DetailData = TALON.getBlockData_List(2);

var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];

try {

    for (var i = 0; i < DetailData.length; i++) {

        var d = DetailData[i];
        var _I_SHIP_INST = d['I_SHIP_INST'];

        var sqlUpdate = ""
            + "UPDATE D "
            + "SET D.I_PICKING_STATUS = '1', "
            + "    D.UPDATED_BY = '" + UserId + "', "
            + "    D.UPDATED_PRG_NM = '" + ProgramNM + "', "
            + "    D.UPDATED_DATE = GETDATE(), "
            + "    D.MODIFY_COUNT = ISNULL(D.MODIFY_COUNT, 0) + 1 "
            + "FROM T_PR_SHIP_INST_D D "
            + "WHERE D.I_SHIP_INST = '" + _I_SHIP_INST + "'";

        TalonDbUtil.update(TALON.getDbConfig(), sqlUpdate);
    }

    TALON.addMsg("✅ Shipment confirmed successfully ");

} catch (e) {
    TALON.addMsg("❌ Shipment confirmation failed: " + e);
}
