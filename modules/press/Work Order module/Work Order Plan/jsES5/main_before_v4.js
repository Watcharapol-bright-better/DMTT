
var NewData       = TALON.getBlockData_List(2)[0];
var searchData = TALON.getConditionData();
TALON.setSearchConditionData("I_TRANSECTION", NewData['I_WO'], "");
TALON.addMsg('Click close button to Create Work Order Plan Screen');