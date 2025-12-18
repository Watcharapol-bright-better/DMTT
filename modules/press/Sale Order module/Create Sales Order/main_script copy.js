var HeaderData = TALON.getBlockData_Card(1);
var DetailData = TALON.getBlockData_List(2);

var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];


function esc(val) {
    if (val === null || val === undefined) return "NULL";
    return "'" + String(val).replace(/'/g, "''") + "'";
}

var _I_SONO         = SONo;
var _I_QT_NO        = HeaderData['I_QT_NO'];
var _I_LNNO         = 1;
var _I_SODATE       = HeaderData['I_SODATE'];
var _I_COMPCLS      = HeaderData['I_COMPCLS'];
var _I_CUSTOMER_PO  = HeaderData['I_CUSTOMER_PO'];
var _I_CSCODE       = HeaderData['I_CSCODE'];
var _I_CURRENCY     = HeaderData['I_CURRENCY'];
var _I_SHIPTO       = HeaderData['I_SHIPTO'];
var _I_BILLTO       = HeaderData['I_BILLTO'];
var _I_ENDUSER      = HeaderData['I_ENDUSER'];
var _I_REM1         = HeaderData['I_REM1'];
var _I_DLYDATE      = HeaderData['I_DLYDATE'];

var _CREATED_DATE   = "GETDATE()";
var _CREATED_BY     = esc(UserId);
var _CREATED_PRG_NM = ProgramNM;
var _UPDATED_DATE   = "GETDATE()";
var _UPDATED_BY     = esc(UserId);
var _UPDATED_PRG_NM = ProgramNM;
var _MODIFY_COUNT   = 0;

var sqlHeader =
    "INSERT INTO T_PR_SORD ( " +
        "I_SONO, I_QT_NO, I_LNNO, I_SODATE, I_COMPCLS, I_CUSTOMER_PO, " +
        "I_CSCODE, I_CURRENCY, I_SHIPTO, I_BILLTO, I_ENDUSER, " +
        "I_REM1, I_DLYDATE, " +
        "CREATED_DATE, CREATED_BY, CREATED_PRG_NM, " +
        "UPDATED_DATE, UPDATED_BY, UPDATED_PRG_NM, MODIFY_COUNT " +
    ") VALUES ( " +
        esc(_I_SONO) + "," +
        esc(_I_QT_NO) + "," +
        _I_LNNO + "," +
        esc(_I_SODATE) + "," +
        esc(_I_COMPCLS) + "," +
        esc(_I_CUSTOMER_PO) + "," +
        esc(_I_CSCODE) + "," +
        esc(_I_CURRENCY) + "," +
        esc(_I_SHIPTO) + "," +
        esc(_I_BILLTO) + "," +
        esc(_I_ENDUSER) + "," +
        esc(_I_REM1) + "," +
        esc(_I_DLYDATE) + "," +
        _CREATED_DATE + "," +
        _CREATED_BY + "," +
        _CREATED_PRG_NM + "," +
        _UPDATED_DATE + "," +
        _UPDATED_BY + "," +
        _UPDATED_PRG_NM + "," +
        _MODIFY_COUNT +
    ")";

TalonDbUtil.insert(TALON.getDbConfig(), sqlHeader);

for (var i = 0; i < DetailData.length; i++) {
    var d = DetailData[i];

    var _D_I_SONO        = SONo;
    var _D_I_LNNO        = i + 1;
    var _D_I_ITEMCODE    = d['I_ITEMCODE'];
    var _D_I_DESC        = null;
    var _D_I_UNTPRI      = d['I_UNTPRI'] || 0;
    var _D_I_QTY         = 1;
    var _D_I_AMOUNT      = d['I_AMOUNT'] || 0;
    var _D_I_DLY_PLACE   = d['I_DLY_PLACE'];

    var _D_CREATED_DATE   = "GETDATE()";
    var _D_CREATED_BY     = UserId;
    var _D_CREATED_PRG_NM = ProgramNM;
    var _D_UPDATED_DATE   = "GETDATE()";
    var _D_UPDATED_BY     = esc(UserId);
    var _D_UPDATED_PRG_NM = ProgramNM;
    var _D_MODIFY_COUNT   = 0;

    var sqlDetail =
        "INSERT INTO T_PR_SORD ( " +
            "I_SONO, I_LNNO, I_ITEMCODE, I_DESC, I_UNTPRI, I_QTY, I_AMOUNT, I_DLY_PLACE, " +
            "CREATED_DATE, CREATED_BY, CREATED_PRG_NM, " +
            "UPDATED_DATE, UPDATED_BY, UPDATED_PRG_NM, MODIFY_COUNT " +
        ") VALUES ( " +
            esc(_D_I_SONO) + "," +
            _D_I_LNNO + "," +
            esc(_D_I_ITEMCODE) + "," +
            "NULL," +
            _D_I_UNTPRI + "," +
            _D_I_QTY + "," +
            _D_I_AMOUNT + "," +
            esc(_D_I_DLY_PLACE) + "," +
            _D_CREATED_DATE + "," +
            _D_CREATED_BY + "," +
            _D_CREATED_PRG_NM + "," +
            _D_UPDATED_DATE + "," +
            _D_UPDATED_BY + "," +
            _D_UPDATED_PRG_NM + "," +
            _D_MODIFY_COUNT +
        ")";

    TalonDbUtil.insert(TALON.getDbConfig(), sqlDetail);
}
