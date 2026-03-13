var data = TALON.getTargetData();

//TALON.addMsg(data);
var _I_WO = data['I_WO_CONFIRM'];
//TALON.addMsg(_I_WO);


if (_I_WO && _I_WO !== "") {
  var sql = "UPDATE T_PR_WOH set I_COMPLETE_FLG = '3' where I_WO = '" + _I_WO + "'";
  TalonDbUtil.update(TALON.getDbConfig(), sql);
  TALON.addMsg('✅ Confirm work order process successfully');
}
