var block1 = TALON.getBlockData_Card(1);
var ship_id = block1['I_SHIP_INST'];
// var SHIP_NO = block1['SISCAN'];
// TALON.addMsg("PK_NO : " + PK_NO)
// TALON.setSearchConditionData("PKSCAN", PK_NO, "");

// --------------------------------------------------
// 6. Save SHIP_NO (unchanged logic)
// --------------------------------------------------
var searchData = TALON.getConditionData();
var ship_id_search = searchData['I_SHIP_INST'];

if(ship_id_search == '') {
    TALON.setSearchConditionData("I_SHIP_INST", ship_id, "");  
} 
