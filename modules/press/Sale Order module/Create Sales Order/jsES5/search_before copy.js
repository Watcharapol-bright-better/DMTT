var searchData = TALON.getConditionData();
var userInfo   = TALON.getUserInfoMap();
var userId     = userInfo['USER_ID'];


if (!searchData.I_SONO) {

    // DMTT_N_SO
    var getNumbering = 
    "DECLARE @Id NVARCHAR(MAX) " + 
    "EXEC SP_RUN_NUMBERING_V1 " + 
    " @CodeType = 'DMTT_N_SO', " + 
    " @Format = N'SOPyyyymmxxxx', " + 
    " @GeneratedNo = @Id OUTPUT " + 
    "SELECT @Id AS [NUMBERING] ";

    SONo = TalonDbUtil.select(TALON.getDbConfig(), getNumbering )[0]['NUMBERING'];
    //TalonDbUtil.commit(TALON.getDbConfig());
    var headerSql =
        "SELECT " +
        "   '" + SONo + "' AS [I_SONO], " +
        "   '00' AS [I_COMPCLS], " +
        "   0 AS [I_CURRENCY], " +
        "   GETDATE() AS [I_SODATE], " +
        "   '" + searchData.I_QT_NO + "' AS [I_QT_NO], " +
        "   '" + userId + "' AS [I_ENDUSER]";

    var headerResult = TalonDbUtil.select(TALON.getDbConfig(), headerSql);
    TALON.setSearchedDisplayList(1, headerResult);
    TALON.setSearchConditionData("I_SONO", SONo, "");

    // --------------------------------------------
    // var runtNumberingIn = 
    //         "DECLARE @Id NVARCHAR(MAX) " + 
    //         "EXEC SP_RUN_NUMBERING_V1 " + 
    //         " @CodeType = 'DMTT_N_SOI', " + 
    //         " @Format = N'yyyymmddxxxxxx', " + 
    //         " @GeneratedNo = @Id OUTPUT " + 
    //         "SELECT @Id AS [NUMBERING] ";    
    // var internalNo = TalonDbUtil.select(TALON.getDbConfig(), runtNumberingIn )[0]['NUMBERING'];        

   var detailSql =
    "SELECT " +
    "   '" + SONo + "' AS [I_SONO], " +
    //"   '" +internalNo+ "' AS [INTERNAL_NO]," + 
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
