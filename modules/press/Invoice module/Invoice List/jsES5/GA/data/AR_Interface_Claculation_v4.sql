-- ส่วนที่ 1: Account 40100050 (Sale Material Income) - Terminal
SELECT 
     [VOUCHERNO]
    ,[INVOICENO]     
    ,[I_SONO]
    ,[I_QT_NO]
    ,[RATETYPE]
    ,[INPDATE]
    ,[HEADER_DEPTCODE]
    ,[I_TYPE]
    ,[DEPTCODE]
    ,[ACCODE]
    ,[HEADER_TAXABLECODE]
    ,[TAXTYPE]
    ,[CORRESPTYPE]
    ,SUM([ITEM_AMOUNT]) AS [INPAMOUNT_FC]
    ,SUM([ITEM_AMOUNT]) AS [INPAMOUNT_SC]
    ,SUM([ITEM_AMOUNT]) AS [TAXABLEAMOUNT_FC]
    ,SUM([ITEM_AMOUNT]) AS [TAXABLEAMOUNT_SC]
    ,[TAXAMOUNT_FC]
    ,[TAXAMOUNT_SC]
    ,[JOURNALTYPE]
    ,[POSTPADCOLOR]
    ,[POSTPADTEXT]
FROM (
    SELECT 
         [IVD].[I_INVOICE_NO] AS [VOUCHERNO]
        ,[IVD].[I_INVOICE_NO] AS [INVOICENO]     
        ,[IVD].[I_SONO]
        ,[SD].[I_QT_NO]
        ,[QTH].[I_EXG_RATE_TYPE] AS [RATETYPE]
        ,[IVH].[I_INVOICE_DATE] AS [INPDATE]
        ,[IVD].[I_ITEMCODE]
        ,'AD' AS [HEADER_DEPTCODE]
        ,[FG].[I_TYPE]
        ,[FG].[I_ITEM_GROUP]
        ,'102012' AS [DEPTCODE]  -- Terminal
        ,'40100050' AS [ACCODE]  -- Sale Material Income
        ,'S999' AS [HEADER_TAXABLECODE] 
        ,'1' AS [TAXTYPE]
        ,'1' AS [CORRESPTYPE]
        ,[IVD].[I_QTY]
        ,[IVD].[I_UNIT_PRICE]
        ,[IVD].[I_AMOUNT]
        -- Material + Scrap Amount
        ,ROUND(
            (ISNULL([QTD].[I_RM_AMT], 0) + ISNULL([QTD].[I_LOSS_AMT], 0)), 2
        ) * [IVD].[I_QTY] AS [ITEM_AMOUNT]
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
                  ,[QD].[I_RM_AMT]
                  ,[QD].[I_LOSS_AMT]
                  ,[QD].[I_FEE_PROCESS]
                  ,[QD].[I_FEE_CUSTOM]
                  ,[QD].[I_FEE_PACK]
                  ,[QD].[I_FEE_EXPENSE]
                  ,[MP].[I_FEE_DLY]
                  ,[QD].[I_FEE_MGM]
            FROM [T_PR_QT_D] [QD]
                LEFT JOIN [MS_PRFG] AS [MP]
                    ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE]
        ) AS [QTD]
            ON [QTD].[I_QT_NO] = [SD].[I_QT_NO]
            AND [QTD].[I_ITEMCODE] = [IVD].[I_ITEMCODE]
            
    WHERE [IVH].[I_INVOICE_NO] = 'IV2602180018'
      AND [FG].[I_TYPE] = 1  -- Terminal only
) AS [MAIN]
GROUP BY 
     [VOUCHERNO], [INVOICENO], [I_SONO], [I_QT_NO], [RATETYPE], [INPDATE]
    ,[HEADER_DEPTCODE], [DEPTCODE], [ACCODE], [HEADER_TAXABLECODE]
    ,[TAXTYPE], [CORRESPTYPE], [TAXAMOUNT_FC], [TAXAMOUNT_SC]
    ,[JOURNALTYPE], [POSTPADCOLOR], [POSTPADTEXT], [I_TYPE]

UNION ALL

-- ส่วนที่ 2: Account 40100055 (Process Income) - Terminal
SELECT 
     [VOUCHERNO]
    ,[INVOICENO]     
    ,[I_SONO]
    ,[I_QT_NO]
    ,[RATETYPE]
    ,[INPDATE]
    ,[HEADER_DEPTCODE]
    ,[I_TYPE]
    ,[DEPTCODE]
    ,[ACCODE]
    ,[HEADER_TAXABLECODE]
    ,[TAXTYPE]
    ,[CORRESPTYPE]
    ,SUM([ITEM_AMOUNT]) AS [INPAMOUNT_FC]
    ,SUM([ITEM_AMOUNT]) AS [INPAMOUNT_SC]
    ,SUM([ITEM_AMOUNT]) AS [TAXABLEAMOUNT_FC]
    ,SUM([ITEM_AMOUNT]) AS [TAXABLEAMOUNT_SC]
    ,[TAXAMOUNT_FC]
    ,[TAXAMOUNT_SC]
    ,[JOURNALTYPE]
    ,[POSTPADCOLOR]
    ,[POSTPADTEXT]
FROM (
    SELECT 
         [IVD].[I_INVOICE_NO] AS [VOUCHERNO]
        ,[IVD].[I_INVOICE_NO] AS [INVOICENO]     
        ,[IVD].[I_SONO]
        ,[SD].[I_QT_NO]
        ,[QTH].[I_EXG_RATE_TYPE] AS [RATETYPE]
        ,[IVH].[I_INVOICE_DATE] AS [INPDATE]
        ,[IVD].[I_ITEMCODE]
        ,'AD' AS [HEADER_DEPTCODE]
        ,[FG].[I_TYPE]
        ,[FG].[I_ITEM_GROUP]
        ,'102012' AS [DEPTCODE]  -- Terminal
        ,'40100055' AS [ACCODE]  -- Process Income
        ,'S999' AS [HEADER_TAXABLECODE] 
        ,'1' AS [TAXTYPE]
        ,'1' AS [CORRESPTYPE]
        ,[IVD].[I_QTY]
        -- Processing Fees
        ,ROUND(
            (ISNULL([QTD].[I_FEE_PROCESS], 0) + 
             ISNULL([QTD].[I_FEE_CUSTOM], 0) + 
             ISNULL([QTD].[I_FEE_PACK], 0) + 
             ISNULL([QTD].[I_FEE_EXPENSE], 0) + 
             ISNULL([QTD].[I_FEE_DLY], 0) + 
             ISNULL([QTD].[I_FEE_MGM], 0)), 2
        ) * [IVD].[I_QTY] AS [ITEM_AMOUNT]
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
                  ,[QD].[I_RM_AMT]
                  ,[QD].[I_LOSS_AMT]
                  ,[QD].[I_FEE_PROCESS]
                  ,[QD].[I_FEE_CUSTOM]
                  ,[QD].[I_FEE_PACK]
                  ,[QD].[I_FEE_EXPENSE]
                  ,[MP].[I_FEE_DLY]
                  ,[QD].[I_FEE_MGM]
            FROM [T_PR_QT_D] [QD]
                LEFT JOIN [MS_PRFG] AS [MP]
                    ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE]
        ) AS [QTD]
            ON [QTD].[I_QT_NO] = [SD].[I_QT_NO]
            AND [QTD].[I_ITEMCODE] = [IVD].[I_ITEMCODE]
            
    WHERE [IVH].[I_INVOICE_NO] = 'IV2602180018'
      AND [FG].[I_TYPE] = 1  -- Terminal only
) AS [MAIN]
GROUP BY 
     [VOUCHERNO], [INVOICENO], [I_SONO], [I_QT_NO], [RATETYPE], [INPDATE]
    ,[HEADER_DEPTCODE], [DEPTCODE], [ACCODE], [HEADER_TAXABLECODE]
    ,[TAXTYPE], [CORRESPTYPE], [TAXAMOUNT_FC], [TAXAMOUNT_SC]
    ,[JOURNALTYPE], [POSTPADCOLOR], [POSTPADTEXT], [I_TYPE]

UNION ALL

-- ส่วนที่ 3: Account 40100050 (Sale Material Income) - Other
SELECT 
     [VOUCHERNO]
    ,[INVOICENO]     
    ,[I_SONO]
    ,[I_QT_NO]
    ,[RATETYPE]
    ,[INPDATE]
    ,[HEADER_DEPTCODE]
    ,[I_TYPE]
    ,[DEPTCODE]
    ,[ACCODE]
    ,[HEADER_TAXABLECODE]
    ,[TAXTYPE]
    ,[CORRESPTYPE]
    ,SUM([ITEM_AMOUNT]) AS [INPAMOUNT_FC]
    ,SUM([ITEM_AMOUNT]) AS [INPAMOUNT_SC]
    ,SUM([ITEM_AMOUNT]) AS [TAXABLEAMOUNT_FC]
    ,SUM([ITEM_AMOUNT]) AS [TAXABLEAMOUNT_SC]
    ,[TAXAMOUNT_FC]
    ,[TAXAMOUNT_SC]
    ,[JOURNALTYPE]
    ,[POSTPADCOLOR]
    ,[POSTPADTEXT]
FROM (
    SELECT 
         [IVD].[I_INVOICE_NO] AS [VOUCHERNO]
        ,[IVD].[I_INVOICE_NO] AS [INVOICENO]     
        ,[IVD].[I_SONO]
        ,[SD].[I_QT_NO]
        ,[QTH].[I_EXG_RATE_TYPE] AS [RATETYPE]
        ,[IVH].[I_INVOICE_DATE] AS [INPDATE]
        ,[IVD].[I_ITEMCODE]
        ,'AD' AS [HEADER_DEPTCODE]
        ,[FG].[I_TYPE]
        ,[FG].[I_ITEM_GROUP]
        ,'102011' AS [DEPTCODE]  -- Other
        ,'40100050' AS [ACCODE]  -- Sale Material Income
        ,'S999' AS [HEADER_TAXABLECODE] 
        ,'1' AS [TAXTYPE]
        ,'1' AS [CORRESPTYPE]
        ,[IVD].[I_QTY]
        -- Material + Scrap Amount
        ,ROUND(
            (ISNULL([QTD].[I_RM_AMT], 0) + ISNULL([QTD].[I_LOSS_AMT], 0)), 2
        ) * [IVD].[I_QTY] AS [ITEM_AMOUNT]
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
                  ,[QD].[I_RM_AMT]
                  ,[QD].[I_LOSS_AMT]
                  ,[QD].[I_FEE_PROCESS]
                  ,[QD].[I_FEE_CUSTOM]
                  ,[QD].[I_FEE_PACK]
                  ,[QD].[I_FEE_EXPENSE]
                  ,[MP].[I_FEE_DLY]
                  ,[QD].[I_FEE_MGM]
            FROM [T_PR_QT_D] [QD]
                LEFT JOIN [MS_PRFG] AS [MP]
                    ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE]
        ) AS [QTD]
            ON [QTD].[I_QT_NO] = [SD].[I_QT_NO]
            AND [QTD].[I_ITEMCODE] = [IVD].[I_ITEMCODE]
            
    WHERE [IVH].[I_INVOICE_NO] = 'IV2602180018'
      AND ([FG].[I_TYPE] <> 1 OR [FG].[I_TYPE] IS NULL)  -- Other (Not Terminal)
) AS [MAIN]
GROUP BY 
     [VOUCHERNO], [INVOICENO], [I_SONO], [I_QT_NO], [RATETYPE], [INPDATE]
    ,[HEADER_DEPTCODE], [DEPTCODE], [ACCODE], [HEADER_TAXABLECODE]
    ,[TAXTYPE], [CORRESPTYPE], [TAXAMOUNT_FC], [TAXAMOUNT_SC]
    ,[JOURNALTYPE], [POSTPADCOLOR], [POSTPADTEXT], [I_TYPE]

UNION ALL

-- ส่วนที่ 4: Account 40100055 (Process Income) - Other
SELECT 
     [VOUCHERNO]
    ,[INVOICENO]     
    ,[I_SONO]
    ,[I_QT_NO]
    ,[RATETYPE]
    ,[INPDATE]
    ,[HEADER_DEPTCODE]
    ,[I_TYPE]
    ,[DEPTCODE]
    ,[ACCODE]
    ,[HEADER_TAXABLECODE]
    ,[TAXTYPE]
    ,[CORRESPTYPE]
    ,SUM([ITEM_AMOUNT]) AS [INPAMOUNT_FC]
    ,SUM([ITEM_AMOUNT]) AS [INPAMOUNT_SC]
    ,SUM([ITEM_AMOUNT]) AS [TAXABLEAMOUNT_FC]
    ,SUM([ITEM_AMOUNT]) AS [TAXABLEAMOUNT_SC]
    ,[TAXAMOUNT_FC]
    ,[TAXAMOUNT_SC]
    ,[JOURNALTYPE]
    ,[POSTPADCOLOR]
    ,[POSTPADTEXT]
FROM (
    SELECT 
         [IVD].[I_INVOICE_NO] AS [VOUCHERNO]
        ,[IVD].[I_INVOICE_NO] AS [INVOICENO]     
        ,[IVD].[I_SONO]
        ,[SD].[I_QT_NO]
        ,[QTH].[I_EXG_RATE_TYPE] AS [RATETYPE]
        ,[IVH].[I_INVOICE_DATE] AS [INPDATE]
        ,[IVD].[I_ITEMCODE]
        ,'AD' AS [HEADER_DEPTCODE]
        ,[FG].[I_TYPE]
        ,[FG].[I_ITEM_GROUP]
        ,'102011' AS [DEPTCODE]  -- Other
        ,'40100055' AS [ACCODE]  -- Process Income
        ,'S999' AS [HEADER_TAXABLECODE] 
        ,'1' AS [TAXTYPE]
        ,'1' AS [CORRESPTYPE]
        ,[IVD].[I_QTY]
        -- Processing Fees
        ,ROUND(
            (ISNULL([QTD].[I_FEE_PROCESS], 0) + 
             ISNULL([QTD].[I_FEE_CUSTOM], 0) + 
             ISNULL([QTD].[I_FEE_PACK], 0) + 
             ISNULL([QTD].[I_FEE_EXPENSE], 0) + 
             ISNULL([QTD].[I_FEE_DLY], 0) + 
             ISNULL([QTD].[I_FEE_MGM], 0)), 2
        ) * [IVD].[I_QTY] AS [ITEM_AMOUNT]
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
                  ,[QD].[I_RM_AMT]
                  ,[QD].[I_LOSS_AMT]
                  ,[QD].[I_FEE_PROCESS]
                  ,[QD].[I_FEE_CUSTOM]
                  ,[QD].[I_FEE_PACK]
                  ,[QD].[I_FEE_EXPENSE]
                  ,[MP].[I_FEE_DLY]
                  ,[QD].[I_FEE_MGM]
            FROM [T_PR_QT_D] [QD]
                LEFT JOIN [MS_PRFG] AS [MP]
                    ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE]
        ) AS [QTD]
            ON [QTD].[I_QT_NO] = [SD].[I_QT_NO]
            AND [QTD].[I_ITEMCODE] = [IVD].[I_ITEMCODE]
            
    WHERE [IVH].[I_INVOICE_NO] = 'IV2602180018'
      AND ([FG].[I_TYPE] <> 1)  -- Other (Not Terminal)
) AS [MAIN]
GROUP BY 
     [VOUCHERNO], [INVOICENO], [I_SONO], [I_QT_NO], [RATETYPE], [INPDATE]
    ,[HEADER_DEPTCODE], [DEPTCODE], [ACCODE], [HEADER_TAXABLECODE]
    ,[TAXTYPE], [CORRESPTYPE], [TAXAMOUNT_FC], [TAXAMOUNT_SC]
    ,[JOURNALTYPE], [POSTPADCOLOR], [POSTPADTEXT], [I_TYPE]
ORDER BY [ACCODE], [DEPTCODE]