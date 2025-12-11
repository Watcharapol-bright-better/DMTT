
var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

var getNumbering =
        "DECLARE @Id NVARCHAR(MAX) " +
        "EXEC SP_RUN_NUMBERING_V1 " +
        "    @CodeType = 'DMTT_N_SO', " +
        "    @Format = N'SOPyyyymmxxxx', " +
        "    @GeneratedNo = @Id OUTPUT " +
        "SELECT @Id AS [NUMBERING] ";
var SONo = TalonDbUtil.select(TALON.getDbConfig(), getNumbering )[0]['NUMBERING'];

var UserInfo = TALON.getUserInfoMap();
var HeaderData = TALON.getBlockData_Card(1);
var DetailData = TALON.getBlockData_List(2);

var UserId   = UserInfo['USER_ID'];
var UserName = UserInfo['USER_NM'];

var ProgramNM = UserInfo['FUNC_ID'];

// Define the target table name
var TABLE_NAME = 'T_PR_SORD';

// Declare column structure
var headerCol = [
    'I_QT_NO',
    '',
    '',
];

var detailCol = [
    '',
    '',
    '',
];


headerCol['I_QT_NO'] = quotationNo;


TalonDbUtil.insertByMap(TALON.getDbConfig(), 'T_PRH', HeaderData, headerCol);

TalonDbUtil.insertByMap(TALON.getDbConfig(), 'T_PRH', DetailData, detailCol);


var sqlID ="SELECT '" +SONo+ "' AS [I_SONO]";
var getSO = TalonDbUtil.select(TALON.getDbConfig(), sqlID );
TALON.setSearchedDisplayList(1, getSO);


