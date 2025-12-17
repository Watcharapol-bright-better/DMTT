var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

var HeaderData = TALON.getBlockData_Card(1);
var searchData = TALON.getConditionData();
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var now       = new java.util.Date();

var isSO = {
    exists: 1,
    noexists: 0
}

// TALON.addMsg('1 I_SONO: '+searchData.I_SONO);
var sql = "SELECT IIF(EXISTS (SELECT 1 FROM [T_PR_SORD] WHERE [I_SONO] = '"+ searchData.I_SONO +"'), 1, 0) AS Result";
var isReadySO = TalonDbUtil.select(TALON.getDbConfig(), sql )[0]['Result'];

if (isReadySO === isSO.exists) {
    TALON.addErrorMsg('⚠️ Sales Order already exists ');
} else {
    var TABLE_NAME = 'T_PR_SORD';
    var headerCol = [
        'I_SONO',
        'I_QT_NO',
        'I_LNNO',
        'I_SODATE',
        'I_COMPCLS',
        'I_CUSTOMER_PO',
        'I_CSCODE',
        'I_CURRENCY',
        'I_SHIPTO',
        'I_BILLTO',
        'I_ENDUSER',
        'I_REM1',
        'I_DLYDATE',
        'CREATED_DATE',
        'CREATED_BY',
        'CREATED_PRG_NM',
        'UPDATED_DATE',
        'UPDATED_BY',
        'UPDATED_PRG_NM',
        'MODIFY_COUNT'
    ];


    var _I_SODATE = HeaderData['I_SODATE'];  
    TALON.putBindValue('I_SODATE', sdfDisplay.format(_I_SODATE))           // SO Date

    var _I_DLYDATE = HeaderData['I_DLYDATE'];           // Delivery Date
    TALON.putBindValue('I_DLYDATE', sdfDisplay.format(_I_DLYDATE));

    var _I_COMPCLS = HeaderData['I_COMPCLS'];           // SO Status
    TALON.putBindValue('I_COMPCLS', _I_COMPCLS);

    var _I_CUSTOMER_PO = HeaderData['I_CUSTOMER_PO'];   // Customer PO No
    TALON.putBindValue('I_CUSTOMER_PO', _I_CUSTOMER_PO);

    var _I_CSCODE = HeaderData['I_CSCODE'];             // Customer Code
    TALON.putBindValue('I_CSCODE', _I_CSCODE);

    HeaderData['CREATED_DATE']   = now;
    HeaderData['CREATED_BY']     = UserId;
    HeaderData['CREATED_PRG_NM'] = ProgramNM;
    HeaderData['UPDATED_DATE']   = now;
    HeaderData['UPDATED_BY']     = UserId;
    HeaderData['UPDATED_PRG_NM'] = ProgramNM;
    HeaderData['MODIFY_COUNT']   = 0;

    TalonDbUtil.insertByMap(
        TALON.getDbConfig(),
        TABLE_NAME,
        HeaderData,
        headerCol
    );
    TALON.addMsg('✅ Sales Order created successfully ');
}
