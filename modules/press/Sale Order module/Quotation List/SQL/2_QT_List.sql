

SELECT *
FROM (
-- LVL 1 : HEADER 
SELECT DISTINCT 
       /**%CHK%**/ '' AS [CHK],
       '1' AS [LVL],
       NULL AS [I_QT_LN],
       [QH].[I_QT_MTH],
       [QH].[I_QT_NO],
       [QH].[I_PO_MONTH],
       [QH].[I_EXG_MONTH],
       [QH].[I_CSCODE],
       [MC].[I_NAME]       AS [I_NAME],
       [QH].[I_QT_STATUS],
       [QH].[I_REM1],
       NULL                AS [I_ITEMCODE],
       NULL                AS [I_DESC],
       [QH].[I_TYPE], 
       NULL                AS [I_COMMODITY],
       NULL                AS [I_THICK],
       NULL                AS [I_WIDTH],
       NULL                AS [I_PROD_WGT],
       [QH].[I_CURRENCY],
       NULL AS [I_UNIT_PRICE]
       
FROM [T_PR_QT_H] AS [QH]
    LEFT JOIN [T_PR_QT_D] AS [QD] ON [QH].[I_QT_NO] = [QD].[I_QT_NO]
    LEFT JOIN [MS_CS] AS [MC] ON [MC].[I_CSCODE] = [QH].[I_CSCODE]

UNION ALL

-- LVL 2 : DETAIL
SELECT
       /**%CHK%**/ '' AS [CHK],
       '2' AS [LVL],
       [QD].[I_QT_LN],
       [QH].[I_QT_MTH],
       [QD].[I_QT_NO],
       [QH].[I_PO_MONTH],
       [QH].[I_EXG_MONTH],
       [QH].[I_CSCODE],
       [MC].[I_NAME],
       [QH].[I_QT_STATUS],
       [QH].[I_REM1],
       [QD].[I_ITEMCODE],
       [MP].[I_DESC],
       [QH].[I_TYPE],
       [QD].[I_COMMODITY],
       [QD].[I_THICK],
       [QD].[I_WIDTH],
       [QD].[I_PROD_WGT],
       [QH].[I_CURRENCY],
       NULL AS [I_UNIT_PRICE]
       
FROM [T_PR_QT_D] AS [QD]
    LEFT JOIN [T_PR_QT_H] AS [QH] ON [QH].[I_QT_NO] = [QD].[I_QT_NO]
    LEFT JOIN [MS_CS] AS [MC] ON [MC].[I_CSCODE] = [QH].[I_CSCODE]
    LEFT JOIN [MS_PRFG] AS [MP] ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE]

) AS A
-- ORDER BY [Lvl], [I_QT_NO], [I_QT_LN]

