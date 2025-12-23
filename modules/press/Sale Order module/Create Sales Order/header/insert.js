var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

var data = TALON.getTargetData();

var dltdate = data['I_DLYDATE'];
var fmt = sdfDisplay.format(dltdate);
var SOStatus = data['I_COMPCLS'];
var SOId = data['I_SONO'];

TALON.putBindValue("I_DLYDATE", fmt);
TALON.putBindValue("I_COMPCLS", SOStatus);
TALON.putBindValue("I_SONO", SOId);

