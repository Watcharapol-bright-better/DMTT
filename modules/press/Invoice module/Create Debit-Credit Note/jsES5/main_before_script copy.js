var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

var searchData = TALON.getConditionData();
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var now       = new java.util.Date();


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
    "1 AS [I_SHIP_LNNO]," +
    "GETDATE() AS [I_SHIP_INST_DATE]," +
    "'" +shipID+ "' AS [I_SHIP_INST]," +
    "'" +internalNo+ "' AS [INTERNAL_NO], " +
    "'0' AS [DETAIL_TYPE]," +
    "'" +UserId+ "' AS [I_ENDUSER]";
    var setHeader = TalonDbUtil.select(TALON.getDbConfig(), sqlHeader );
    TALON.setSearchedDisplayList(1, setHeader);
    
    var sql =
        "SELECT " +
        "     ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + 1 AS [I_SHIP_LNNO] " +
        "    ,[SI].[I_SHIP_INST] " +
        "    ,[SI].[INTERNAL_NO] " +
        "    ,'1' AS [DETAIL_TYPE]" +
        "    ,[SD].[I_SONO] " +
        "    ,[SD].[I_ITEMCODE] " +
        "    ,[MP].[I_DESC] " +
        "    ,[SD].[I_QTY] " +
        "    ,ISNULL([SI].[I_SHIP_QTY], 1) AS [I_SHIP_QTY] " +
        "    ,[MP].[I_PCS_BOX] " +
        "    ,[SI].[I_LOTNO_FR] " +
        "    ,[SI].[I_LOTNO_TO] " +
        "    ,[WO].[I_WODATE] " +
        "    ,[SI].[CREATED_DATE] " +
        "    ,[SI].[CREATED_BY] " +
        "    ,[SI].[CREATED_PRG_NM] " +
        "    ,[SI].[UPDATED_DATE] " +
        "    ,[SI].[UPDATED_BY] " +
        "    ,[SI].[UPDATED_PRG_NM] " +
        "    ,[SI].[MODIFY_COUNT] " +
        "FROM [T_PR_SORD] AS [SD] " +
        "    INNER JOIN [MS_PRFG] [MP] " +
        "        ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE] " +
        "    LEFT JOIN [T_PR_SHIP_INST] [SI] " +
        "       ON [SI].[I_SONO] = [SD].[I_SONO] AND [SD].[I_LNNO] = [SI].[I_SHIP_LNNO] " +
        "    LEFT JOIN [T_PR_WOH] [WO] " +
        "        ON [WO].[I_SONO] = [SD].[I_SONO]";

    //TALON.addMsg(sql);

    var data = TalonDbUtil.select(TALON.getDbConfig(), sql);
    var rows = [];

    
    data.forEach(function(item) {
        
        internalNo = TalonDbUtil.select(TALON.getDbConfig(), runtNumbering )[0]['NUMBERING'];
        var lineData = { 
            'I_SHIP_LNNO'    : item['I_SHIP_LNNO'],
            'I_SHIP_INST'    : shipID,
            'INTERNAL_NO'    : internalNo,
            'DETAIL_TYPE'    : '1',
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


