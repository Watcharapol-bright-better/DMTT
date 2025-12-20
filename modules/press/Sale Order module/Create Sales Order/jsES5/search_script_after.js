var DetailData = TALON.getBlockData_List(2);
var searchData = TALON.getConditionData();
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var now       = new java.util.Date();

var _I_SONO = TALON.getBindValue('I_SONO'); 
// TALON.addMsg('2 I_SONO: '+_I_SONO);
//var _I_SONO = TALON.getBindValue('I_SONO');
var sql = "SELECT IIF(EXISTS (SELECT 1 FROM [T_PR_SORD] WHERE [DETAIL_TYPE] = '1' AND [I_SONO] = '"+ searchData.I_SONO +"'), 1, 0) AS [Result]";
var isReadySO = TalonDbUtil.select(TALON.getDbConfig(), sql )[0]['Result'];

// TALON.addErrorMsg("TEST : " + searchData.I_SONO);

var isSO = {
    exists: 1,
    noexists: 0
}

// TALON.addMsg('isReadySO '+isReadySO);
// TALON.addMsg(isReadySO === isSO.noexists);

if (isReadySO === isSO.noexists) {
    var _I_SODATE = TALON.getBindValue('I_SODATE');             // SO Date
    var _I_DLYDATE = TALON.getBindValue('I_DLYDATE');           // Delivery Date
    var _I_COMPCLS = TALON.getBindValue('I_COMPCLS');           // SO Status
    var _I_CUSTOMER_PO = TALON.getBindValue('I_CUSTOMER_PO');   // Customer PO No
    var _I_CSCODE = TALON.getBindValue('I_CSCODE');             // Customer Code
    var _I_ENDUSER = TALON.getBindValue('I_ENDUSER');           // P.I.C

    // =========================
    var TABLE_NAME = 'T_PR_SORD';

    var detailCol = [
        'I_SONO',
        'INTERNAL_NO',
        'I_LNNO',
        'DETAIL_TYPE',
        'I_SODATE',
        'I_DLYDATE',
        'I_COMPCLS',
        'I_CUSTOMER_PO',
        'I_CSCODE',
        'I_ENDUSER',
        'I_ITEMCODE',
        'I_UNTPRI',
        'I_QTY',
        'I_AMOUNT',
        'I_DLY_PLACE',
        'CREATED_DATE',
        'CREATED_BY',
        'CREATED_PRG_NM',
        'UPDATED_DATE',
        'UPDATED_BY',
        'UPDATED_PRG_NM',
        'MODIFY_COUNT'
    ];

    var internalNo = "";
    for (var i = 0; i < DetailData.length; i++) {
        var getNumbering = 
            "DECLARE @Id NVARCHAR(MAX) " + 
            "EXEC SP_RUN_NUMBERING_V1 " + 
            " @CodeType = 'DMTT_N_SOI', " + 
            " @Format = N'yyyymmddxxxxxx', " + 
            " @GeneratedNo = @Id OUTPUT " + 
            "SELECT @Id AS [NUMBERING] ";

        internalNo = TalonDbUtil.select(TALON.getDbConfig(), getNumbering )[0]['NUMBERING'];

        var Box2 = DetailData[i];
        Box2['I_SONO']         = _I_SONO;
        Box2['INTERNAL_NO']    = internalNo;
        Box2['DETAIL_TYPE']    = '1'; // Box Details
        Box2['I_SODATE']       = _I_SODATE;
        Box2['I_DLYDATE']      = _I_DLYDATE;
        Box2['I_COMPCLS']      = _I_COMPCLS;
        Box2['I_CUSTOMER_PO']  = _I_CUSTOMER_PO;
        Box2['I_CSCODE']       = _I_CSCODE;
        Box2['I_ENDUSER']      = _I_ENDUSER;
        Box2['I_CONFIRM_STATUS'] = '0'; // Not Confirmed

        Box2['CREATED_DATE']   = now;
        Box2['CREATED_BY']     = UserId;
        Box2['CREATED_PRG_NM'] = ProgramNM;
        Box2['UPDATED_DATE']   = now;
        Box2['UPDATED_BY']     = UserId;
        Box2['UPDATED_PRG_NM'] = ProgramNM;
        Box2['MODIFY_COUNT']   = 0;

        TalonDbUtil.insertByMap(
            TALON.getDbConfig(),
            TABLE_NAME,
            Box2,
            detailCol
        );

    }

   

}