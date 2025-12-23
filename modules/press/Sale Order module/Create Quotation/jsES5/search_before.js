var userData = TALON.getUserInfoMap();

var getNumbering = 
    "DECLARE @Id NVARCHAR(MAX) " + 
    "EXEC SP_RUN_NUMBERING_V1 " + 
    " @CodeType = 'DMTT_N_QT', " + 
    " @Format = N'QUTyyyymmxxx', " + 
    " @GeneratedNo = @Id OUTPUT " + 
    "SELECT @Id AS [NUMBERING] ";
    
var id = TalonDbUtil.select(TALON.getDbConfig(), getNumbering )[0]['NUMBERING'];
TALON.putBindValue('I_QT_NO', id);

var sql = "SELECT '"+id+"' AS [I_QT_NO]," +
"GETDATE() AS [I_QT_MTH], " +
"GETDATE() AS [I_PO_MONTH]," +
"GETDATE() AS [I_EXG_MONTH], " +
"33.52 AS [I_EXG_RATE], " +
"'THB' AS [I_CURRENCY]," +
"'"+ userData["USER_ID"] +"' AS [I_REM1]";
var qtList = TalonDbUtil.select(TALON.getDbConfig(), sql );
TALON.setSearchedDisplayList(1, qtList);
