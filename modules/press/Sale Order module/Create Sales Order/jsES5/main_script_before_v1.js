var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];

var fmt = TALON.getBindValue('I_DLYDATE');
var SOStatus = TALON.getBindValue('I_COMPCLS');
var SOId = TALON.getBindValue('I_SONO');
var QTId = TALON.getBindValue('I_QT_NO');

/* ===== Check existing ===== */
var sqlChk = ""
    + "SELECT 1 "
    + "FROM [T_PR_SORD_D] "
    + "WHERE [I_SONO] = '" + SOId + "'";

var isExisting = TalonDbUtil.select(
    TALON.getDbConfig(),
    sqlChk
);

/* ===== If found then update ===== */
if (isExisting != null && isExisting.size() > 0) {

    var sqlupdate = ""
        + "UPDATE [T_PR_SORD_D] "
        + "SET [I_COMPCLS] = '" + SOStatus + "', "
        + "    [I_DLYDATE] = '" + fmt + "', "
        + "    [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, " 
        + "    [UPDATED_DATE]  = GETDATE(), " 
        + "    [UPDATED_PRG_NM]= '" + ProgramNM + "', " 
        + "    [UPDATED_BY]    = '" + UserId + "' " 
        + "WHERE [I_SONO] = '" + SOId + "'";

   TalonDbUtil.update(TALON.getDbConfig(), sqlupdate);
  
  var sqlupdateQt = ""
    + "UPDATE [T_PR_QT_H] "
    + "SET [I_SO_FLG] = '1', "
    + "    [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, " 
    + "    [UPDATED_DATE]  = GETDATE(), " 
    + "    [UPDATED_PRG_NM]= '" + ProgramNM + "', " 
    + "    [UPDATED_BY]    = '" + UserId + "' " 
    + "WHERE [I_QT_NO] = '" + QTId + "'";
  
  TalonDbUtil.update(TALON.getDbConfig(), sqlupdateQt);
}
