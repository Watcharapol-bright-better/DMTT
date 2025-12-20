var sql =
    "SELECT " +
    "     ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + 1 AS [I_SHIP_LNNO] " +
    "    ,[SI].[I_SHIP_INST] " +
    "    ,[SI].[INTERNAL_NO] " +
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

var internalNo = "";
data.forEach(function(item) {
    var runtNumbering = 
            "DECLARE @Id NVARCHAR(MAX) " + 
            "EXEC SP_RUN_NUMBERING_V1 " + 
            " @CodeType = 'DMTT_N_SII', " + 
            " @Format = N'yyyymmddxxxxxx', " + 
            " @GeneratedNo = @Id OUTPUT " + 
            "SELECT @Id AS [NUMBERING] ";

    internalNo = TalonDbUtil.select(TALON.getDbConfig(), runtNumbering )[0]['NUMBERING'];
    var lineData = { 
        'I_SHIP_LNNO'     : item['I_SHIP_LNNO'],
        'I_SHIP_INST'    : item['I_SHIP_INST'],
        'INTERNAL_NO'    : item['INTERNAL_NO'] = internalNo,
        'I_SONO'         : item['I_SONO'],
        'I_ITEMCODE'     : item['I_ITEMCODE'],
        'I_DESC'         : item['I_DESC'],
        'I_QTY'          : item['I_QTY'],
        'I_SHIP_QTY'     : item['I_SHIP_QTY'],
        'I_PCS_BOX'      : item['I_PCS_BOX'],
        'I_LOTNO_FR'     : item['I_LOTNO_FR'],
        'I_LOTNO_TO'     : item['I_LOTNO_TO'],
        'I_WODATE'       : item['I_WODATE'],
        'CREATED_DATE'   : item['CREATED_DATE'],
        'CREATED_BY'     : item['CREATED_BY'],
        'CREATED_PRG_NM' : item['CREATED_PRG_NM'],
        'UPDATED_DATE'   : item['UPDATED_DATE'],
        'UPDATED_BY'     : item['UPDATED_BY'],
        'UPDATED_PRG_NM' : item['UPDATED_PRG_NM'],
        'MODIFY_COUNT'   : item['MODIFY_COUNT']
    };

    rows.push(lineData);
});

// TALON.addMsg(JSON.stringify(rows));
TALON.setSearchedDisplayList(2, rows);
