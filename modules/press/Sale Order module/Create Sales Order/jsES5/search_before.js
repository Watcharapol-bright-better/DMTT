var searchData = TALON.getConditionData();
var userInfo   = TALON.getUserInfoMap();
var userId     = userInfo['USER_ID'];
var SONo       = '';


// * Generate SO No
if (!searchData.I_SONO) {

    var getNumbering = 
    "DECLARE @Id NVARCHAR(MAX) " + 
    "EXEC SP_RUN_NUMBERING_V1 " + 
    " @CodeType = 'DMTT_N_SO', " + 
    " @Format = N'SOPyyyymmxxxx', " + 
    " @GeneratedNo = @Id OUTPUT " + 
    "SELECT @Id AS [NUMBERING] ";

    SONo = TalonDbUtil.select(TALON.getDbConfig(), getNumbering )[0]['NUMBERING'];
    TalonDbUtil.commit(TALON.getDbConfig());
    var headerSql =
        "SELECT " +
        "   '" + SONo + "' AS [I_SONO], " +
        "   '0' AS [DETAIL_TYPE], " +
        "   1 AS [I_LNNO], " +
        "   '00' AS [I_COMPCLS], " +
        "   0 AS [I_CURRENCY], " +
        "   GETDATE() AS [I_SODATE], " +
        "   '" + searchData.I_QT_NO + "' AS [I_QT_NO], " +
        "   '" + userId + "' AS [I_ENDUSER]";

    var headerResult = TalonDbUtil
        .select(TALON.getDbConfig(), headerSql);

    TALON.setSearchedDisplayList(1, headerResult);
    TALON.putBindValue('I_SONO', SONo);
    TALON.setSearchConditionData('I_SONO', SONo, '');

    var detailSql =
    "SELECT " +
    "   '" + SONo + "' AS [I_SONO], " +
    "   ROW_NUMBER() OVER (PARTITION BY QT.I_QT_NO ORDER BY (SELECT NULL)) + 1 AS [I_LNNO], " +
    "   QT.I_ITEMCODE, " +                  // Part No
    "   MP.I_DESC, " +                      // Part Name
    "   QT.I_SELLING_PRICE AS [I_UNTPRI], " +
    "   NULL AS [I_QTY], " +
    "   (1 * QT.I_SELLING_PRICE) AS [I_AMOUNT], " +
    "   MP.I_DLY_PLACE " +
    "FROM T_PR_QT QT " +
    "LEFT JOIN MS_PRFG MP ON MP.I_ITEMCODE = QT.I_ITEMCODE " +
    "LEFT JOIN MS_CS MC ON MC.I_CSCODE = QT.I_CSCODE " +
    "LEFT JOIN T_PR_SORD SD ON SD.I_QT_NO = QT.I_QT_NO " +
    "WHERE QT.I_QT_NO = '" + searchData.I_QT_NO + "'";

    var qtList = TalonDbUtil
        .select(TALON.getDbConfig(), detailSql);

    TALON.setSearchedDisplayList(2, qtList);

} else {

    var detailSql =
        "SELECT " +
        "   '" + SONo + "' AS [I_SONO], " +
        "   ROW_NUMBER() OVER (PARTITION BY QT.I_QT_NO ORDER BY (SELECT NULL)) + 1 AS [I_LNNO], " +
        "   QT.I_ITEMCODE, " +                  // Part No
        "   MP.I_DESC, " +                      // Part Name
        "   QT.I_SELLING_PRICE AS [I_UNTPRI], " +
        "   NULL AS [I_QTY], " +
        "   (1 * QT.I_SELLING_PRICE) AS [I_AMOUNT], " +
        "   MP.I_DLY_PLACE " +
        "FROM T_PR_QT QT " +
        "LEFT JOIN MS_PRFG MP ON MP.I_ITEMCODE = QT.I_ITEMCODE " +
        "LEFT JOIN MS_CS MC ON MC.I_CSCODE = QT.I_CSCODE " +
        "LEFT JOIN T_PR_SORD SD ON SD.I_QT_NO = QT.I_QT_NO " +
        "WHERE QT.I_QT_NO = '" + searchData.I_QT_NO + "'";
    
    var qtList = TalonDbUtil
        .select(TALON.getDbConfig(), detailSql);
    
    TALON.setSearchedDisplayList(2, qtList);


}
