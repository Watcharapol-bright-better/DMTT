var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

var searchData = TALON.getConditionData();
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var now       = new java.util.Date();

var data = TALON.getTargetData();

var dlyData = data['I_SHIP_DLY_DATE'];
var custData = data['I_CSCODE'];
var shipToData = data['I_SHIPTO'];


var fmt = sdfDisplay.format(dlyData);

if (searchData.I_SHIP_INST === '') {
    var runtNumbering = 
        "DECLARE @Id NVARCHAR(MAX) " + 
        "EXEC SP_RUN_NUMBERING_V1 " + 
        " @CodeType = 'DMTT_N_SII', " + 
        " @Format = N'yyyymmddxxxxxx', " + 
        " @GeneratedNo = @Id OUTPUT " + 
        "SELECT @Id AS [NUMBERING] ";
    
    var runtShipID = 
        "DECLARE @Id NVARCHAR(MAX) " + 
        "EXEC SP_RUN_NUMBERING_V1 " + 
        " @CodeType = 'DMTT_N_SI', " + 
        " @Format = N'SIyyyymmddxxxx', " + 
        " @GeneratedNo = @Id OUTPUT " + 
        "SELECT @Id AS [NUMBERING] ";
    
    internalNo = TalonDbUtil.select(TALON.getDbConfig(), runtNumbering )[0]['NUMBERING'];

    var shipID = TalonDbUtil.select(TALON.getDbConfig(), runtShipID )[0]['NUMBERING'];
    var sqlHeader = "SELECT " +
    "GETDATE() AS [I_SHIP_INST_DATE]," +
    "'" +shipID+ "' AS [I_SHIP_INST]," +
    "'0' AS [I_SHIP_CFM], " + // Shipment Status
    " '"+custData+"' AS [I_CSCODE], " + // Customer Code
    " '"+ sdfDisplay.format(dlyData) +"' AS [I_SHIP_DLY_DATE], " + // Delivery Date
    " '"+shipToData+"' AS [I_SHIPTO], " + // Ship To
    "'" +UserId+ "' AS [I_ENDUSER]";
    var setHeader = TalonDbUtil.select(TALON.getDbConfig(), sqlHeader );
    TALON.setSearchedDisplayList(1, setHeader);

    var sql = 
        "SELECT " +
        "    NULL AS [I_SHIP_INST], " +
        "    NULL AS [INTERNAL_NO], " +
        "    [SD].[I_SONO], " +
        "    [SD].[I_ITEMCODE], " +
        "    [MP].[I_DESC], " +
        "    [SD].[I_QTY], " +

        "    ISNULL([ST].[BAL_QTY], [SD].[I_QTY]) AS [I_SHIP_QTY], " +
        "    [MP].[I_PCS_BOX], " +

        "    [ST].[MIN_LOTNO] AS [I_LOTNO_FR], " +
        "    [ST].[MAX_LOTNO] AS [I_LOTNO_TO], " +

        "    [WO].[I_WODATE], " +
        "    NULL AS [CREATED_DATE], " +
        "    NULL AS [CREATED_BY], " +
        "    NULL AS [CREATED_PRG_NM], " +
        "    NULL AS [UPDATED_DATE], " +
        "    NULL AS [UPDATED_BY], " +
        "    NULL AS [UPDATED_PRG_NM], " +
        "    NULL AS [MODIFY_COUNT] " +

        "FROM [T_PR_SORD_D] AS [SD] " +

        "INNER JOIN [MS_PRFG] AS [MP] " +
        "    ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE] " +

        "LEFT JOIN [T_PR_WOH] AS [WO] " +
        "    ON [WO].[I_SONO] = [SD].[I_SONO] " +

        "LEFT JOIN ( " +
        "    SELECT " +
        "        [I_ITEMCODE], " +
        "        MIN([I_LOTNO]) AS [MIN_LOTNO], " +
        "        MAX([I_LOTNO]) AS [MAX_LOTNO], " +
        "        SUM([I_INQTY]) - SUM([I_OUTQTY]) AS [BAL_QTY] " +
        "    FROM [T_PR_STOCK] " +
        "    GROUP BY [I_ITEMCODE] " +
        ") AS [ST] " +
        "    ON [ST].[I_ITEMCODE] = [SD].[I_ITEMCODE] " +
        "WHERE [SD].[I_DLYDATE] = '" + sdfDisplay.format(dlyData)+ "'";

    //TALON.addMsg(sql);

    var data = TalonDbUtil.select(TALON.getDbConfig(), sql);
    var rows = [];

    
    data.forEach(function(item) {
        
        internalNo = TalonDbUtil.select(TALON.getDbConfig(), runtNumbering )[0]['NUMBERING'];
        var lineData = { 
            'I_SHIP_INST'    : shipID,
            'INTERNAL_NO'    : internalNo,
            'I_SONO'         : item['I_SONO'],
            'I_ITEMCODE'     : item['I_ITEMCODE'],
            'I_DESC'         : item['I_DESC'],
            'I_QTY'          : item['I_QTY'],
            'I_SHIP_QTY'     : item['I_SHIP_QTY'],
            'I_PCS_BOX'      : item['I_PCS_BOX'],
            'I_LOTNO_FR'     : item['I_LOTNO_FR'],
            'I_LOTNO_TO'     : item['I_LOTNO_TO'],
            'I_WODATE'       : item['I_WODATE'],
            
            'CREATED_DATE'   : now,
            'CREATED_BY'     : UserId,
            'CREATED_PRG_NM' : ProgramNM,
            'UPDATED_DATE'   : now,
            'UPDATED_BY'     : UserId,
            'UPDATED_PRG_NM' : ProgramNM,
            'MODIFY_COUNT'   : 0
        };

        rows.push(lineData);
    });

    // TALON.addMsg(JSON.stringify(rows));
    TALON.setSearchedDisplayList(2, rows);
}


