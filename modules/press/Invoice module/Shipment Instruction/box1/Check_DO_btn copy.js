
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
//TALON.addMsg(sql);
TALON.setSearchedDisplayList(2, data);


