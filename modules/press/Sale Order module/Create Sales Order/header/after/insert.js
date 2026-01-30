
var data = TALON.getTargetData();

var dltdate = data['I_DLYDATE'];
var fmt = DateFmt.formatDate(dltdate.toString());
var SOStatus = data['I_COMPCLS'];
var SOId = data['I_SONO'];
var qtId = data['I_QT_NO'];

TALON.putBindValue("I_DLYDATE", fmt);
TALON.putBindValue("I_COMPCLS", SOStatus);
TALON.putBindValue("I_SONO", SOId);
TALON.putBindValue("I_QT_NO", qtId);

