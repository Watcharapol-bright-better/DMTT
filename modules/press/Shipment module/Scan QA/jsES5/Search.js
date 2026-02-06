var data = TALON.getBlockData_Card(1);

var _I_SHIP_INST       = data['I_SHIP_INST'];
var _I_PALLET_NO       = data['I_PALLET_NO'];
var _SAMPLE_LABEL_TAG  = data['SAMPLE_LABEL_TAG'];
var _I_PLTNO           = data['I_PLTNO'];

function showIfNotEmpty(label, value) {
    if (value !== null && value !== undefined && value !== '') {
        TALON.addMsg('✅ ' + label + ' : ' + value);
    }
}


// Show Block data (only when has value)
// showIfNotEmpty('Ship Instruction', _I_SHIP_INST);
// showIfNotEmpty('Pallet No', _I_PALLET_NO);
// showIfNotEmpty('Sample Label Tag', _SAMPLE_LABEL_TAG);
// showIfNotEmpty('PLT No', _I_PLTNO);

var isErr = false;

function setDisplay() { 
  var sql = "SELECT "
    + "  '" + _I_SHIP_INST + "' AS [I_SHIP_INST]"
    + " ,'" + _I_PALLET_NO + "' AS [I_PALLET_NO]"
    + " ,'" + _SAMPLE_LABEL_TAG + "' AS [SAMPLE_LABEL_TAG]"
    + " ,'" + _I_PLTNO + "' AS [I_PLTNO]";
  
  var result = TalonDbUtil.select(TALON.getDbConfig(), sql);
  TALON.setSearchedDisplayList(1, result);
}

if (_I_SHIP_INST !== '') { 
  setDisplay();
  showIfNotEmpty('Ship Instruction', _I_SHIP_INST);
} else if (_I_PALLET_NO !== '') {
  setDisplay();
  showIfNotEmpty('Pallet No', _I_PALLET_NO);
} else if (_SAMPLE_LABEL_TAG !== '') {
  setDisplay();
  showIfNotEmpty('Sample Label Tag', _SAMPLE_LABEL_TAG);
} else if (_I_PLTNO !== '') {
  setDisplay();
  showIfNotEmpty('PLT No', _I_PLTNO);
  TALON.setSearchConditionData("Active", "", "1");
} else {
  isErr = true;
}



