var data = TALON.getConditionData();
var ship_id = data['I_SHIP_INST'];
var pallet_no = data['I_PALLET_NO'];

if (ship_id !== '') {

    var sql =
        "SELECT CASE WHEN EXISTS ( " +
        "  SELECT 1 FROM [T_PR_SHIP_INST_H] " +
        "  WHERE [I_SHIP_INST] = '" + ship_id + "' ) " +
        "THEN '1' ELSE '0' END AS IsExist ";

    var chkExist = TalonDbUtil.select(TALON.getDbConfig(), sql);

    if (chkExist[0]['IsExist'] === '0') {
        TALON.addErrorMsg("⚠️ Shipment Instruction No. is not in the System.");
        TALON.setSearchConditionData("I_SHIP_INST", "", "");
    }

} else if (pallet_no !== '') {

    var sql =
        "SELECT CASE WHEN EXISTS ( " +
        "  SELECT 1 FROM [T_PR_SHIP_INST_H] " +
        "  WHERE [I_SHIP_INST] = '" + ship_id + "' ) " +
        "THEN '1' ELSE '0' END AS IsExist ";

    var chkExist = TalonDbUtil.select(TALON.getDbConfig(), sql);

    if (chkExist[0]['IsExist'] === '0') {
        TALON.addErrorMsg(
            "⚠️ Scanned Shipping Mask is not in Shipment Instruction [" + ship_id + "]."
        );
        TALON.setSearchConditionData("I_PALLET_NO", "", "");
    }

} 

// else {
//     TALON.addMsg(data.I_SHIP_INST);
//     TALON.addMsg(data.I_PALLET_NO);
//     TALON.addMsg(data.SAMPLE_LABEL_TAG);
//     TALON.addMsg(data.I_PLTNO);
// }
