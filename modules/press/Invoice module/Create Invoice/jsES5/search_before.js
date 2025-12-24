var searchData = TALON.getConditionData();
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];

var shipOrderNo = searchData['I_SHIP_ORDER_NO'];

if (shipOrderNo !== '' || shipOrderNo !== null) {

    var getIVNumbering = 
        "DECLARE @Id NVARCHAR(MAX) " + 
        "EXEC SP_RUN_NUMBERING_V1 " + 
        " @CodeType = 'DMTT_N_IV', " + 
        " @Format = N'IVyyyymmxxxxx', " + 
        " @GeneratedNo = @Id OUTPUT " + 
        "SELECT @Id AS [NUMBERING] ";
        
    var runIV = TalonDbUtil.select(TALON.getDbConfig(), getIVNumbering )[0]['NUMBERING'];

    var sqlBox1 = ""
        + "SELECT "
        + "     [H].[I_SHIP_INST] AS [I_SHIP_ORDER_NO] "
        + "    ,'"+runIV+"' AS [I_INVOICE_NO] "
        + "    ,[H].[I_SHIP_INST_DATE] AS [I_SHIP_ORDER_DATE] "
        + "    ,GETDATE() AS [I_INVOICE_DATE] "
        + "    ,[H].[I_CSCODE] AS [I_CORRESP_CODE] "
        + "    ,[CS].[I_REMARK] AS [I_ATTN] "
        + "    ,[H].[I_SHIPTO] AS [I_SHIP_TO] "
        + "    ,GETDATE() AS [CREATED_DATE] "
        + "    ,'"+UserId+"' AS [CREATED_BY] "
        + "    ,'"+ProgramNM+"' AS [CREATED_PRG_NM] "
        + "    ,GETDATE() AS [UPDATED_DATE] "
        + "    ,'"+UserId+"' AS [UPDATED_BY] "
        + "    ,'"+ProgramNM+"' AS [UPDATED_PRG_NM] "
        + "    ,0 AS [MODIFY_COUNT] "        
        + "FROM [T_PR_SHIP_INST_H] [H] "
        + "LEFT JOIN [MS_CS] [CS] "
        + "    ON [CS].[I_CSCODE] = [H].[I_CSCODE] "
        + "LEFT JOIN [T_PR_INVOICE_H] [IH] "
        + "    ON [IH].[I_SHIP_ORDER_NO] = [H].[I_SHIP_INST] "
        + "WHERE [H].[I_SHIP_INST] = '" + shipOrderNo + "'";
    
    var boxCard = TalonDbUtil.select(TALON.getDbConfig(), sqlBox1 );
    TALON.setSearchedDisplayList(1, boxCard);

    var sqlBox2 = ""
        + "SELECT DISTINCT "
        + "     [D].[INTERNAL_NO] AS [INST_INNO] "
        + "    ,'"+runIV+"' AS [I_INVOICE_NO] "
        + "    ,'' AS [INTERNAL_NO] "
        + "    ,NULL AS [I_INVOICE_LNNO] "
        + "    ,[D].[I_ITEMCODE] "
        + "    ,[CS].[I_DESC] "
        + "    ,[CS].[I_PKGCD] "
        + "    ,1 AS [I_PALLET_QTY] "
        + "    ,[D].[I_SHIP_QTY] AS [I_QTY] "
        + "    ,([D].[I_SHIP_QTY] * [CS].[I_PROD_WGT]) AS [I_NET_WGT] "
        + "    ,[SOD].[I_UNTPRI] AS [I_UNIT_PRICE] "
        + "    ,ISNULL([SOD].[I_AMOUNT], 0) AS [I_AMOUNT] "
        + "    ,'' AS [I_SHIP_ORDER_NO] "

        + "    ,GETDATE() AS [CREATED_DATE] "
        + "    ,'"+UserId+"' AS [CREATED_BY] "
        + "    ,'"+ProgramNM+"' AS [CREATED_PRG_NM] "
        + "    ,GETDATE() AS [UPDATED_DATE] "
        + "    ,'"+UserId+"' AS [UPDATED_BY] "
        + "    ,'"+ProgramNM+"' AS [UPDATED_PRG_NM] "
        + "    ,0 AS [MODIFY_COUNT] "
        + "FROM [T_PR_SHIP_INST_D] [D] "
        + "INNER JOIN [MS_PRFG] [CS] "
        + "    ON [CS].[I_ITEMCODE] = [D].[I_ITEMCODE] "
        + "INNER JOIN [T_PR_STOCK] [SK] "
        + "    ON [SK].[I_ITEMCODE] = [D].[I_ITEMCODE] "
        + "INNER JOIN [T_PR_SORD_D] [SOD] "
        + "    ON [SOD].[I_ITEMCODE] = [D].[I_ITEMCODE] "
        + "   AND [D].[I_SONO] = [SOD].[I_SONO] "
        + "WHERE [D].[I_SHIP_INST] = '" + shipOrderNo + "'";


    var boxList = TalonDbUtil.select(TALON.getDbConfig(), sqlBox2 );
    TALON.setSearchedDisplayList(2, boxList);

}
