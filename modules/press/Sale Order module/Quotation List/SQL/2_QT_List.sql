

SELECT *
FROM (

-- LVL 1 : HEADER (DISTINCT)
SELECT
       /**%CHK%**/ '' AS [CHK],
       '1' AS [LVL],
       NULL              AS [I_QT_MTH],
       [TQ].[I_QT_NO]    AS [I_QT_NO],
       NULL              AS [I_PO_MONTH],
       [TQ].[I_EXG_MONTH] AS [I_EXG_MONTH],
       NULL              AS [I_CSCODE],
       [MC].[I_NAME]     AS [I_NAME],
       NULL              AS [I_REM1],
       NULL              AS [I_ITEMCODE],
       NULL              AS [I_DESC],
       NULL              AS [I_TYPE],
       NULL              AS [I_COMMODITY],
       NULL              AS [I_THICK],
       NULL              AS [I_WIDTH],
       NULL              AS [I_PROD_WGT],
       NULL              AS [I_CURRENCY],
       NULL              AS [I_UNIT_PRICE],
       NULL              AS [I_QT_LN]
FROM [T_PR_QT] AS [TQ]
    LEFT JOIN [MS_CS]   AS [MC] ON [MC].[I_CSCODE] = [TQ].[I_CSCODE]
    LEFT JOIN [MS_PRFG] AS [MP] ON [MP].[I_ITEMCODE] = [TQ].[I_ITEMCODE]
GROUP BY
       [TQ].[I_QT_NO],
       [TQ].[I_CSCODE],
       [MC].[I_NAME],
       [TQ].[I_EXG_MONTH],
       [TQ].[I_REM1]

UNION ALL

-- LVL 2 : DETAIL
SELECT
       /**%CHK%**/ '' AS [CHK],
       '2' AS [LVL],
       [TQ].[I_QT_MTH]    AS [I_QT_MTH],
       [TQ].[I_QT_NO]     AS [I_QT_NO],
       [TQ].[I_PO_MONTH]  AS [I_PO_MONTH],
       [TQ].[I_EXG_MONTH] AS [I_EXG_MONTH],
       [TQ].[I_CSCODE]    AS [I_CSCODE],
       [MC].[I_NAME]      AS [I_NAME],
       [TQ].[I_REM1]      AS [I_REM1],
       [TQ].[I_ITEMCODE]  AS [I_ITEMCODE],
       [MP].[I_DESC]      AS [I_DESC],
       [TQ].[I_TYPE]      AS [I_TYPE],
       [TQ].[I_COMMODITY] AS [I_COMMODITY],
       [TQ].[I_THICK]     AS [I_THICK],
       [TQ].[I_WIDTH]     AS [I_WIDTH],
       [TQ].[I_PROD_WGT]  AS [I_PROD_WGT],
       [TQ].[I_CURRENCY]  AS [I_CURRENCY],
       NULL               AS [I_UNIT_PRICE],
       [TQ].[I_QT_LN]     AS [I_QT_LN]
FROM [T_PR_QT] AS [TQ]
    LEFT JOIN [MS_CS]   AS [MC] ON [MC].[I_CSCODE] = [TQ].[I_CSCODE]
    LEFT JOIN [MS_PRFG] AS [MP] ON [MP].[I_ITEMCODE] = [TQ].[I_ITEMCODE]
    
) T

WHERE [I_QT_NO] = /**%I_QT_NO%**/ '' 
