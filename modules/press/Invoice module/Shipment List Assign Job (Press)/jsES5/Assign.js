
var data = TALON.getConditionData();

//TALON.addMsg(data['SELECTED']);
TALON.createNextFunc("AssignJob", { "SHIP_LIST" : data['SELECTED']});