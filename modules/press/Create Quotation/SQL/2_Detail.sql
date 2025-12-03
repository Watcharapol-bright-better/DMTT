
SELECT
    [BASE].[I_ITEMCODE],
    [BASE].[I_DESC],
    [BASE].[I_COMMODITY],
    [BASE].[I_THICK],
    [BASE].[I_WIDTH],
    [BASE].[I_PROD_WGT],
    [BASE].[I_RM_WGT],
    [BASE].[I_LOSS_WGT],
    [BASE].[I_PITCH],
    [BASE].[MAT_COST],
    [BASE].[SCRAP_COST],
    [BASE].[MAT_AMOUNT],
    [BASE].[SCRAP_AMOUNT],
    [BASE].[I_FEE_PROCESS],
    [BASE].[I_FEE_CUSTOM],
    [BASE].[I_FEE_PACK],
    [BASE].[I_FEE_EXPENSE],
    [BASE].[I_FEE_DLY],
    [BASE].[MANAGEMENT_EXPENSE],
    [BASE].[TOTAL_PRICE],
    [BASE].[I_QTPATTERN],
    [BASE].[I_QT_NO],
    [BASE].[I_QT_LN],
    [BASE].[I_CSCODE],
    [BASE].[I_SELECTED]
FROM (
    SELECT
    [MP].[I_ITEMCODE]                                                     AS [I_ITEMCODE],
    [MP].[I_DESC]                                                         AS [I_DESC],
    [MP].[I_COMMODITY]                                                    AS [I_COMMODITY],
    [MP].[I_THICK]                                                        AS [I_THICK],
    [MP].[I_WIDTH]                                                        AS [I_WIDTH],
    ([MP].[I_PROD_WGT] / 100.0) * (100.0 + (100.0 - [MP].[I_YIELD]))      AS [I_PROD_WGT],
    ([MP].[I_RM_WGT]   / 100.0) * (100.0 + (100.0 - [MP].[I_YIELD]))      AS [I_RM_WGT],
    ([MP].[I_LOSS_WGT] / 100.0) * (100.0 + (100.0 - [MP].[I_YIELD]))      AS [I_LOSS_WGT],
    [MP].[I_PITCH]                                                        AS [I_PITCH],
    ''                                                                    AS [MAT_COST],
    ''                                                                    AS [SCRAP_COST],
    ''                                                                    AS [MAT_AMOUNT],
    ''                                                                    AS [SCRAP_AMOUNT],
    [MP].[I_FEE_PROCESS]                                                  AS [I_FEE_PROCESS],
    [MP].[I_FEE_CUSTOM]                                                   AS [I_FEE_CUSTOM],
    [MP].[I_FEE_PACK]                                                     AS [I_FEE_PACK],
    [MP].[I_FEE_EXPENSE]                                                  AS [I_FEE_EXPENSE],
    [MP].[I_FEE_DLY]                                                      AS [I_FEE_DLY],
    (
    COALESCE([MP].[I_FEE_PROCESS], 0)
    + COALESCE([MP].[I_FEE_CUSTOM], 0)
    + COALESCE([MP].[I_FEE_PACK], 0)
    + COALESCE([MP].[I_FEE_EXPENSE], 0)
    + COALESCE([MP].[I_FEE_DLY], 0)
    )                                                                     AS [MANAGEMENT_EXPENSE],
    ''                                                                    AS [TOTAL_PRICE],
    [MP].[I_QTPATTERN]                                                    AS [I_QTPATTERN],
    [TQ].[I_QT_NO]                                                        AS [I_QT_NO],
    [TQ].[I_CSCODE]                                                       AS [I_CSCODE],
    NULL                                                                  AS [I_SELECTED],
    ROW_NUMBER() OVER (
    PARTITION BY [MP].[I_ITEMCODE]
    ORDER BY [MP].[I_ITEMCODE]
    )                                                                     AS [I_QT_LN]
    FROM  [MS_PRFG] AS [MP]
    LEFT JOIN [T_PR_QT] AS [TQ]
    ON [TQ].[I_ITEMCODE] = [MP].[I_ITEMCODE]
    ) AS [BASE]
WHERE [BASE].[I_QT_LN] = 1
