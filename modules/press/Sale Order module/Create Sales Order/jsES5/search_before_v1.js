var searchData = TALON.getConditionData();
var userInfo   = TALON.getUserInfoMap();
var userId     = userInfo['USER_ID'];


if (!searchData.I_SONO) {

    //TALON.addMsg(searchData['I_NAME']);

    // DMTT_N_SO
    var SONo = RunningNo.genId('DMTT_N_SO', 'SOPyymmxxxx', true);
    
    var headerSql =
        "SELECT " +
        "   '" + SONo + "' AS [I_SONO], " +
        "   '00' AS [I_COMPCLS], " +
        "   [MC].[I_CSCODE], " +
        "   [H].[I_CURRENCY], " +
        "   GETDATE() AS [I_SODATE], " +
        "   '" + searchData.I_QT_NO + "' AS [I_QT_NO], " +
        "   '" + userId + "' AS [I_PIC]" +
        "FROM [T_PR_QT_H] [H] " +
        "LEFT JOIN [MS_CS] AS [MC] ON [MC].[I_NAME] = '"+searchData['I_NAME']+"'" +
        "WHERE [H].[I_QT_NO] =  '" + searchData.I_QT_NO + "'"


    var headerResult = TalonDbUtil.select(TALON.getDbConfig(), headerSql);
    TALON.setSearchedDisplayList(1, headerResult);
    
    TALON.setSearchConditionData("I_SONO", SONo, "");


   var detailSql =
    "SELECT " +
    "   '" + SONo + "' AS [I_SONO], " +
    "   QD.I_ITEMCODE, " +                  // Part No
    "   MP.I_DESC, " +                      // Part Name
    // "   QD.I_SELLING_PRICE AS [I_UNTPRI], " +
    "   15025 AS [I_UNTPRI], " +
    "   NULL AS [I_QTY], " +
    "   NULL AS [I_AMOUNT], " +
    "   MP.I_DLY_PLACE " +
    "FROM T_PR_QT_D AS QD " +
    "INNER JOIN T_PR_QT_H AS QH " +
    "   ON QH.I_QT_NO = QD.I_QT_NO " +
    "LEFT JOIN MS_PRFG AS MP " +
    "   ON MP.I_ITEMCODE = QD.I_ITEMCODE " +
    "LEFT JOIN MS_CS AS MC " +
    "   ON MC.I_CSCODE = QH.I_CSCODE " +
    "WHERE QD.I_QT_NO = '" + searchData.I_QT_NO + "' " +
    "ORDER BY QD.INTERNAL_NO";


    var qtList = TalonDbUtil.select(TALON.getDbConfig(), detailSql);
    TALON.setSearchedDisplayList(2, qtList);

} else {

    var detailSql =
    "SELECT " +
    //"   ROW_NUMBER() OVER (PARTITION BY QD.I_QT_NO ORDER BY QD.INTERNAL_NO) AS [I_LNNO], " +
    "   QD.I_ITEMCODE, " +                  // Part No
    "   MP.I_DESC, " +                      // Part Name
    // "   QD.I_SELLING_PRICE AS [I_UNTPRI], " +
    "   15025 AS [I_UNTPRI], " +
    "   NULL AS [I_QTY], " +
    "   NULL AS [I_AMOUNT], " +
    "   MP.I_DLY_PLACE " +
    "FROM T_PR_QT_D AS QD " +
    "INNER JOIN T_PR_QT_H AS QH " +
    "   ON QH.I_QT_NO = QD.I_QT_NO " +
    "LEFT JOIN MS_PRFG AS MP " +
    "   ON MP.I_ITEMCODE = QD.I_ITEMCODE " +
    "LEFT JOIN MS_CS AS MC " +
    "   ON MC.I_CSCODE = QH.I_CSCODE " +
    "WHERE QD.I_QT_NO = '" + searchData.I_QT_NO + "' " +
    "ORDER BY QD.INTERNAL_NO";

    
    var qtList = TalonDbUtil.select(TALON.getDbConfig(), detailSql);
    TALON.setSearchedDisplayList(2, qtList);


}
