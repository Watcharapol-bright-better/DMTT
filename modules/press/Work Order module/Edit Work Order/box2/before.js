
var box1 = TALON.getBlockData_Card(1);
var box2 = TALON.getBlockData_List(2);


var _I_PLAN_START = box1['I_PLAN_START'];
var _I_PLAN_FINISHED = box1['I_PLAN_FINISHED'];
var _I_DLY_DATE = box2['I_DLY_DATE'];


TALON.addMsg('Start Datetime : ' + _I_PLAN_START);
TALON.addMsg('Finish Datetime : ' + _I_PLAN_FINISHED);
TALON.addMsg('Delay Date : ' + _I_DLY_DATE);


