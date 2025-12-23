

var userData = TALON.getUserInfoMap();
var UserId    = userData['USER_ID'];
var ProgramNM = userData['FUNC_ID'];
var HEADER   = TALON.getBlockData_Card(1);
var DETAIL   = TALON.getBlockData_List(2);


TALON.addMsg('HEADER: '+HEADER);
TALON.addMsg('DETAIL: '+DETAIL);

var CSCODE   = HEADER["I_CSCODE"];

var getNumbering = 
    "DECLARE @Id NVARCHAR(MAX) " + 
    "EXEC SP_RUN_NUMBERING_V1 " + 
    " @CodeType = 'DMTT_N_QT', " + 
    " @Format = N'QUTyyyymmxxx', " + 
    " @GeneratedNo = @Id OUTPUT " + 
    "SELECT @Id AS [NUMBERING] ";

var QUOTATIONNO = TalonDbUtil.select(TALON.getDbConfig(), getNumbering )[0]['NUMBERING'];


