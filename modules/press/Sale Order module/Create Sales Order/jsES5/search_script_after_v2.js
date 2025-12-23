

var fmt = TALON.getBindValue('I_DLYDATE');
var SOStatus = TALON.getBindValue('I_COMPCLS');
var SOId = TALON.getBindValue('I_SONO');


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
        + "    [I_DLYDATE] = '" + fmt + "' "
        + "WHERE [I_SONO] = '" + SOId + "'";

    TalonDbUtil.update(TALON.getDbConfig(), sqlupdate);
}
