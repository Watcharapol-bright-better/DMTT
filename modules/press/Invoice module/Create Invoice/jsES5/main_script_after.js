var data = TALON.getBlockData_Card(1);
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];

var _I_SHIP_ORDER_NO = data['I_SHIP_ORDER_NO'];
var _I_INVOICE_NO = data['I_INVOICE_NO'];
var _I_INVOICE_DATE = data['I_INVOICE_DATE'];
// TALON.addMsg(_I_SHIP_ORDER_NO);
// TALON.addMsg(_I_INVOICE_NO);
// TALON.addMsg(_I_INVOICE_DATE);

var fmt = DateFmt.formatDate(_I_INVOICE_DATE.toString());
// TALON.addMsg(fmt);

if (_I_SHIP_ORDER_NO !== '' || _I_SHIP_ORDER_NO !== null) {
    
    var sql =
        "UPDATE [T_PR_SHIP_INST_H] SET " +
        " [I_INVOICE_NO]   = '"+_I_INVOICE_NO+"', " +
        " [I_INVOICE_DATE]   = '"+ fmt +"', " +
        " [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, " +
        " [UPDATED_DATE]  = GETDATE(), " +
        " [CREATED_PRG_NM]= '" + ProgramNM + "', " +
        " [CREATED_BY]    = '" + UserId + "' " +
        "WHERE [I_SHIP_INST]  = '" + _I_SHIP_ORDER_NO + "'";
    TalonDbUtil.update(TALON.getDbConfig(), sql);
}