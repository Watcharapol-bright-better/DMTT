

SELECT 
    ROW_NUMBER() OVER (PARTITION BY [QT].[I_QT_NO] ORDER BY (SELECT NULL)) AS [I_LNNO],
    [QT].[I_ITEMCODE],    -- Part NO
    [MP].[I_DESC],        -- Part Name
    NULL AS [I_QTY],      -- Order QTY (pcs)
    NULL AS [I_AMOUNT],   -- Amount
    NULL AS [I_DLY_PLACE] -- Delivery Place

FROM [T_PR_QT] AS [QT]
    LEFT JOIN [MS_PRFG] AS [MP] 
        ON [MP].[I_ITEMCODE] = [QT].[I_ITEMCODE]
    LEFT JOIN [MS_CS] AS [MC] 
        ON [MC].[I_CSCODE] = [QT].[I_CSCODE]


WHERE [QT].[I_QT_NO] = 'Q251101'
