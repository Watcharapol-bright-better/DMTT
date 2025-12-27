-- Detail
SELECT
    [QD].[I_QT_NO],                 -- Quotation ID
    [QD].[INTERNAL_NO],        -- Internal No

    [MP].[I_ITEMCODE],
    [MP].[I_DESC],
    [MP].[I_COMMODITY],
    [MP].[I_THICK],
    [MP].[I_WIDTH],

    ([MP].[I_PROD_WGT] / 100.0) * (200.0 - [MP].[I_YIELD]) AS [I_PROD_WGT],
    ([MP].[I_RM_WGT]   / 100.0) * (200.0 - [MP].[I_YIELD]) AS [I_RM_WGT],
    ([MP].[I_LOSS_WGT] / 100.0) * (200.0 - [MP].[I_YIELD]) AS [I_LOSS_WGT],

    [MP].[I_PITCH],
    '' AS [MAT_COST],
    '' AS [SCRAP_COST],
    '' AS [MAT_AMOUNT],
    '' AS [SCRAP_AMOUNT],

    [MP].[I_FEE_PROCESS],
    [MP].[I_FEE_CUSTOM],
    [MP].[I_FEE_PACK],
    [MP].[I_FEE_EXPENSE],
    [MP].[I_FEE_DLY],

    COALESCE([MP].[I_FEE_PROCESS], 0)
  + COALESCE([MP].[I_FEE_CUSTOM], 0)
  + COALESCE([MP].[I_FEE_PACK], 0)
  + COALESCE([MP].[I_FEE_EXPENSE], 0)
  + COALESCE([MP].[I_FEE_DLY], 0) AS [MANAGEMENT_EXPENSE],

    ROUND(RAND(CHECKSUM(NEWID())) * 1350 + 150, 2) AS [I_SELLING_PRICE],

    [MP].[I_QTPATTERN],
    [MP].[I_CSCODE],
    NULL AS [I_QT_LN]
FROM [MS_PRFG] AS [MP]
LEFT JOIN [T_PR_QT_D] AS [QD]
    ON [QD].[I_ITEMCODE] = [MP].[I_ITEMCODE]
LEFT JOIN [T_PR_QT_H] AS [QH]
    ON [QH].[I_QT_NO] = [QD].[I_QT_NO]

WHERE [QD].[I_QT_NO] = /**%I_QT_NO%**/''


SELECt * FROM T_PR_QT_D
