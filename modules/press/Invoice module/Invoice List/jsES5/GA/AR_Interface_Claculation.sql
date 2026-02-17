
SELECT 
     [IVD].[I_INVOICE_NO] AS [VOUCHERNO]
    ,[IVD].[I_INVOICE_NO] AS [INVOICENO]     
    ,[IVD].[I_SONO]
    ,[SD].[I_QT_NO]
    ,[QTH].[I_EXG_RATE_TYPE] AS [RATETYPE]
    ,[IVH].[I_INVOICE_DATE] AS [INPDATE]
    ,[IVD].[I_ITEMCODE]
    ,'AD' AS [HEADER_DEPTCODE]
    ,IIF([FG].[I_TYPE] = 1, '102012', '102011') AS [DEPTCODE]
    ,'40100050' AS [ACCODE]
    ,'S999' AS [HEADER_TAXABLECODE] 
    ,'1' AS [TAXTYPE]
    ,'1' AS [CORRESPTYPE]
    ,[IVD].[I_QTY]
    ,[IVD].[I_UNIT_PRICE]
    ,[IVD].[I_AMOUNT]
    ,[QTD].[I_RM_AMT]
    ,[QTD].[I_LOSS_AMT]
    ,[QTD].[I_FEE_PROCESS]
    ,[QTD].[I_FEE_CUSTOM]
    ,[QTD].[I_FEE_PACK]
    ,[QTD].[I_FEE_EXPENSE]
    ,[QTD].[I_FEE_DLY]
    ,[QTD].[I_FEE_MGM]
    ,ROUND(
        ISNULL([QTD].[I_RM_AMT], 0) + 
        ISNULL([QTD].[I_LOSS_AMT], 0) + 
        ISNULL([QTD].[I_FEE_PROCESS], 0) + 
        ISNULL([QTD].[I_FEE_CUSTOM], 0) + 
        ISNULL([QTD].[I_FEE_PACK], 0) + 
        ISNULL([QTD].[I_FEE_EXPENSE], 0) + 
        ISNULL([QTD].[I_FEE_DLY], 0) + 
        ISNULL([QTD].[I_FEE_MGM], 0)
    , 2) AS [TOTAL_PRICE]
    ,'0' AS [TAXAMOUNT_FC]
    ,'0' AS [TAXAMOUNT_SC]
    ,'0' AS [JOURNALTYPE]
    ,'' AS [POSTPADCOLOR]
    ,'' AS [POSTPADTEXT]

FROM [dbo].[T_PR_INVOICE_D] [IVD]
    LEFT JOIN [T_PR_INVOICE_H] [IVH]
        ON [IVH].[I_INVOICE_NO] = [IVD].[I_INVOICE_NO] 

    LEFT JOIN [MS_PRFG] [FG]
        ON [FG].[I_ITEMCODE] = [IVD].[I_ITEMCODE]

    LEFT JOIN [T_PR_SORD_H] [SD]
        ON [SD].[I_SONO] = [IVD].[I_SONO]

    LEFT JOIN [T_PR_QT_H] [QTH]
        ON [QTH].[I_QT_NO] = [SD].[I_QT_NO]
    LEFT JOIN (
        SELECT [QD].[I_QT_NO]
              ,[QD].[INTERNAL_NO]
              ,[QD].[I_ITEMCODE]
              ,[QD].[I_RM_AMT]       -- Material amount
              ,[QD].[I_LOSS_AMT]     -- Scrap amount
              ,[QD].[I_FEE_PROCESS]  -- Press Processing
              ,[QD].[I_FEE_CUSTOM]   -- Customer Clearance
              ,[QD].[I_FEE_PACK]     -- Package Material
              ,[QD].[I_FEE_EXPENSE]  -- Maintenance Expense
              ,[MP].[I_FEE_DLY]      -- Delivery Fee
              ,[QD].[I_FEE_MGM]      -- Management Expenses
        FROM [T_PR_QT_D] [QD]
            LEFT JOIN [MS_PRFG] AS [MP]
                ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE]
    ) AS [QTD]
        ON [QTD].[I_QT_NO] = [SD].[I_QT_NO]
        AND [QTD].[I_ITEMCODE] = [IVD].[I_ITEMCODE]
        
WHERE [IVH].[I_INVOICE_NO] = 'IV2602100003'
