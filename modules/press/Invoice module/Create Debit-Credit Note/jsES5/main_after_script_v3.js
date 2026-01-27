var searchData = TALON.getConditionData();
var HeaderData = TALON.getBlockData_Card(1);
var DetailData = TALON.getBlockData_List(2);
var UserInfo   = TALON.getUserInfoMap();

var UserId     = UserInfo['USER_ID'];
var ProgramNM  = UserInfo['FUNC_ID'];
var now        = new java.util.Date();

var _I_SHIP_ORDER_NO = HeaderData['I_SHIP_ORDER_NO'];
var _I_INVOICE_NO = HeaderData['I_INVOICE_NO'];
var _I_INVOICE_DATE = HeaderData['I_INVOICE_DATE'];
// TALON.addMsg(_I_SHIP_ORDER_NO);
// TALON.addMsg(_I_INVOICE_NO);
// TALON.addMsg(_I_INVOICE_DATE);

var fmt = DateFmt.formatDate(_I_INVOICE_DATE.toString());
// TALON.addMsg(fmt);
// TALON.addMsg(now);

var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

var _I_TYPE = HeaderData['I_TYPE'];
//TALON.addMsg('Invoice Type : ' + _I_TYPE);

var currType =
        (_I_TYPE === '1') ? 'Debit Note' :
        (_I_TYPE === '2') ? 'Credit Note' :
        'Unknown';

var invoiceType = {
    'Debit Note': '1',
    'Credit Note' : '2'
};

var runIV = '';
if (_I_SHIP_ORDER_NO !== '' || _I_SHIP_ORDER_NO !== null) {

    var sql = "SELECT IIF(EXISTS (SELECT 1 FROM [T_PR_INVOICE_H] WHERE [I_INVOICE_NO] = '"+searchData.I_INVOICE_NO+"'), 1, 0) AS [Result]";
    var isReady = TalonDbUtil.select(TALON.getDbConfig(), sql )[0]['Result'];

    // TALON.addMsg('[I_INVOICE_NO] : ' + searchData.I_INVOICE_NO);
    // TALON.addMsg(isReady);
    if (isReady === 1) {
         TALON.addErrorMsg('⚠️ '+ currType +' ['+searchData.I_INVOICE_NO+'] already exists. ');
    } else {

        switch (_I_TYPE) {
            case invoiceType['Debit Note']:
                runIV = RunningNo.genId('DMTT_N_DN', 'DNyymmddxxxx', true);
                //TALON.addMsg('DMTT_N_DN : ' + runIV);
                break;

            case invoiceType['Credit Note']:
                runIV = RunningNo.genId('DMTT_N_CN', 'CNyymmddxxxx', true);
                //TALON.addMsg('DMTT_N_CN : ' + runIV);
                break;

            default:
                //TALON.addErrorMsg('❌ Invalid invoice type');
                //TALON.setIsSuccess(false);
                break;
        }

        TALON.setSearchConditionData( "I_INVOICE_NO" , runIV , "" );
        var HeaderCol = [
            'I_TYPE',
            'I_SHIP_ORDER_NO',
            'I_INVOICE_NO',
            'I_SHIP_ORDER_DATE',
            'I_INVOICE_DATE',
            'I_CSCODE',
            'I_REMARK',
            'I_SHIP_TO',

            'CREATED_DATE',
            'CREATED_BY',
            'CREATED_PRG_NM',
            'UPDATED_DATE',
            'UPDATED_BY',
            'UPDATED_PRG_NM',
            'MODIFY_COUNT'
        ]
        
        HeaderData['I_TYPE']         = _I_TYPE;
        HeaderData['I_INVOICE_NO']   = runIV;

        HeaderData['CREATED_DATE']   = now;
        HeaderData['CREATED_BY']     = UserId;
        HeaderData['CREATED_PRG_NM'] = ProgramNM;
        HeaderData['UPDATED_DATE']   = now;
        HeaderData['UPDATED_BY']     = UserId;
        HeaderData['UPDATED_PRG_NM'] = ProgramNM;
        HeaderData['MODIFY_COUNT']   = 0;

        TalonDbUtil.insertByMap(
            TALON.getDbConfig(),
            'T_PR_INVOICE_H', // TABLE_NAME
            HeaderData,
            HeaderCol
        );

        // ====================================

        var DetailCol = [
            'I_INVOICE_NO',
            'INTERNAL_NO',
            'I_INVOICE_LNNO',
            'I_ITEMCODE',
            'I_PKGCD',
            'I_PALLET_QTY',
            'I_QTY',
            'I_NET_WGT',
            'I_UNIT_PRICE',
            'I_AMOUNT',

            'CREATED_DATE',
            'CREATED_BY',
            'CREATED_PRG_NM',
            'UPDATED_DATE',
            'UPDATED_BY',
            'UPDATED_PRG_NM',
            'MODIFY_COUNT'
        ];

        var internalNo = "";
        var lnNo = 1;
        DetailData.forEach(function (Box2) {
        
            internalNo = RunningNo.genId('DMTT_N_IV_IN', 'yyyymmddxxxxxxx', true);
        
            Box2['I_INVOICE_NO']   = runIV;
            Box2['INTERNAL_NO']    = internalNo;
            Box2['I_INVOICE_LNNO'] = lnNo;
        
            Box2['CREATED_DATE']   = DateFmt.formatDateTime(now.toString());
            Box2['CREATED_BY']     = UserId;
            Box2['CREATED_PRG_NM'] = ProgramNM;
            Box2['UPDATED_DATE']   = DateFmt.formatDateTime(now.toString());
            Box2['UPDATED_BY']     = UserId;
            Box2['UPDATED_PRG_NM'] = ProgramNM;
            Box2['MODIFY_COUNT']   = 0;
        
            TalonDbUtil.insertByMap(
                TALON.getDbConfig(),
                'T_PR_INVOICE_D',
                Box2,
                DetailCol
            );
        
            lnNo++;
        });

        var sql =
            "UPDATE [T_PR_SHIP_INST_H] SET " +
            " [I_INVOICE_NO]   = '"+runIV+"', " +
            " [I_INVOICE_DATE]   = '"+ fmt +"', " +
            " [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, " +
            " [UPDATED_DATE]  = GETDATE(), " +
            " [CREATED_PRG_NM]= '" + ProgramNM + "', " +
            " [CREATED_BY]    = '" + UserId + "' " +
            "WHERE [I_SHIP_INST]  = '" + _I_SHIP_ORDER_NO + "'";
        TalonDbUtil.update(TALON.getDbConfig(), sql);
        TALON.addMsg('✅ '+ currType +' created successfully. ');
    }

} 