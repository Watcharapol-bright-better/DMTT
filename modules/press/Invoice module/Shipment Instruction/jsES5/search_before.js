
var searchData = TALON.getConditionData();
TALON.addMsg(searchData.I_SHIP_DLY_DATE);

var sql =
    "SELECT " +
    " ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + 1 AS [I_SHIP_LNNO], " + // Shipment Instruction Line
    " [SD].[I_SONO], " +                // SO No.
    " [SD].[I_ITEMCODE], " +             // Part No.
    " [MP].[I_DESC], " +                 // Part Name
    " [SD].[I_QTY], " +                  // SO Balance QTY
    " [SI].[I_SHIP_QTY], " +              // Shipment QTY
    " [MP].[I_PCS_BOX], " +               // Box QTY
    " [SI].[I_LOTNO_FR], " +              // Lot From
    " [SI].[I_LOTNO_TO], " +              // Lot To
    " [SI].[CREATED_DATE], " +
    " [SI].[CREATED_BY], " +
    " [SI].[CREATED_PRG_NM], " +
    " [SI].[UPDATED_DATE], " +
    " [SI].[UPDATED_BY], " +
    " [SI].[UPDATED_PRG_NM], " +
    " [SI].[MODIFY_COUNT] " +
    "FROM [T_PR_SORD] AS [SD] " +
    "INNER JOIN [MS_PRFG] AS [MP] " +
    " ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE] " +
    "LEFT JOIN [T_PR_SHIP_INST] AS [SI] " +
    " ON [SI].[I_SONO] = [SD].[I_SONO]" +
    "WHERE [SD].[I_DLYDATE] = '" + searchData.I_SHIP_DLY_DATE + "'"

var data = TalonDbUtil.select(TALON.getDbConfig(), sql);
TALON.addMsg(sql);
TALON.setSearchedDisplayList(2, data);


var sql = ""
    + "SELECT "
    + "ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + 1 AS [I_SHIP_LNNO] "
    + ",[SI].[I_SHIP_INST] "
    + ",[SD].[I_SONO] "
    + ",[SD].[I_ITEMCODE] "
    + ",[MP].[I_DESC] "
    + ",[SD].[I_QTY] "
    + ",ISNULL([SI].[I_SHIP_QTY], 1) AS [I_SHIP_QTY] "
    + ",[MP].[I_PCS_BOX] "
    + ",[SI].[I_LOTNO_FR] "
    + ",[SI].[I_LOTNO_TO] "
    + ",[SI].[CREATED_DATE] "
    + ",[SI].[CREATED_BY] "
    + ",[SI].[CREATED_PRG_NM] "
    + ",[SI].[UPDATED_DATE] "
    + ",[SI].[UPDATED_BY] "
    + ",[SI].[UPDATED_PRG_NM] "
    + ",[SI].[MODIFY_COUNT] "
    + "FROM [T_PR_SORD] AS [SD] "
    + "INNER JOIN [MS_PRFG] [MP] "
    + "ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE] "
    + "LEFT JOIN [T_PR_SHIP_INST] [SI] "
    + "ON [SI].[I_SONO] = [SD].[I_SONO]";
var data = TalonDbUtil.select(TALON.getDbConfig(), sql);
var rows = [];
data.forEach(function(item) {
    var lineData = { 
      'I_SHIP_LNNO'     : item['I_SHIP_LNNO'],
      'I_SONO'       : item['I_SONO'],
      'I_ITEMCODE' : item['I_ITEMCODE'],
      'I_QTY'     : item['I_QTY'],
      'I_SHIP_QTY' : item['I_SHIP_QTY'],
      'I_PCS_BOX'       : item['I_PCS_BOX'],
      'I_LOTNO_FR'       : item['I_LOTNO_FR'],
      'I_LOTNO_TO'       : item['I_LOTNO_TO']
    };
    rows.push(lineData);
});
//TALON.addMsg(JSON.stringify(rows));
TALON.setSearchedDisplayList(2, rows);
