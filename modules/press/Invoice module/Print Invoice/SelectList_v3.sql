SELECT
     [PAGE_NO]
    ,ROW_NUMBER() OVER(PARTITION BY [I_INVOICE_NO], [PAGE_NO] ORDER BY [INTERNAL_NO]) AS [I_INVOICE_LNNO] -- Line no 
    ,[I_INVOICE_NO]
    ,[I_INVOICE_DATE]
    ,[I_CSCODE]
    ,[I_SHIP_TO]
    ,[I_BILL_TO]
    ,[I_SHIP_ORDER_DATE]
    -- SHIP TO
    ,[SHIP_TO_NAME]
    ,[SHIP_TO_PAY_TERM]
    ,[SHIP_TO_VENDOR_CD]
    ,[SHIP_TO_DLY_PLACE]
    ,[SHIP2_ADDR_INFO]
    -- BILL TO
    ,[BILL_TO_NAME]
    ,[BILL_TO_TAX_DUTY]
    ,[BILL_TO_ADDR_INFO]
    -- Item
    ,[I_ITEMCODE]
    ,[I_DESC]
    ,[I_PKGCD]
    ,[PALLET]
    ,[BOX_QTY]
    ,[PCS_QTY]
    ,[I_NET_WGT]
    ,[I_UNIT_PRICE]
    ,[I_AMOUNT]
    ,[TOTAL_PALLET]
    ,[TOTAL_BOX_QTY]
    ,[TOTAL_PCS_QTY]
    ,[TOTAL_NET_WGT]
FROM (
    SELECT
         CEILING(ROW_NUMBER() OVER(PARTITION BY [D].[I_INVOICE_NO] ORDER BY [D].[INTERNAL_NO]) / 21.0) AS [PAGE_NO]
        ,[D].[INTERNAL_NO]
        ,[D].[I_INVOICE_NO]
        ,[H].[I_INVOICE_DATE]
        ,[H].[I_CSCODE]
        ,[H].[I_SHIP_TO]
        ,[H].[I_BILL_TO]
        ,[H].[I_SHIP_ORDER_DATE]
        
        -- SHIP TO 
        ,[SHIP_CS].[I_NAME] AS [SHIP_TO_NAME]
        ,[SHIP_CS].[I_PAY_TERM] AS [SHIP_TO_PAY_TERM]
        ,[SHIP_CS].[I_VENDOR_CD] AS [SHIP_TO_VENDOR_CD]
        ,[SHIP_CS].[SHIP2_ADDR_INFO]
        
        -- BILL TO 
        ,[BILL_CS].[I_NAME] AS [BILL_TO_NAME]
        ,[BILL_CS].[I_TAX_DUTY] AS [BILL_TO_TAX_DUTY]
        ,[BILL_CS].[BILL_TO_ADDR_INFO]
        
        -- Item 
        ,[D].[I_ITEMCODE]
        ,[ITEM_MS].[I_DESC]
        ,[ITEM_MS].[I_PKGCD]
        ,[ITEM_MS].[I_DLY_PLACE] AS [SHIP_TO_DLY_PLACE]
        ,[ITEM_MS].[I_PCS_BOX] AS [PCS_QTY]
        
        ,[D].[I_PALLET_QTY] AS [PALLET]
        ,[D].[I_QTY] AS [BOX_QTY]
        ,[D].[I_NET_WGT]
        ,[D].[I_UNIT_PRICE]
        ,[D].[I_AMOUNT]
        
        -- Summary 
        ,[SUMMARY].[TOTAL_PALLET]
        ,[SUMMARY].[TOTAL_BOX_QTY]
        ,[SUMMARY].[TOTAL_PCS_QTY]
        ,[SUMMARY].[TOTAL_NET_WGT]
        
    FROM [T_PR_INVOICE_D] [D]
    
    INNER JOIN [T_PR_INVOICE_H] [H]
        ON [H].[I_INVOICE_NO] = [D].[I_INVOICE_NO]
    
    LEFT JOIN (
        SELECT 
             [I_CSCODE]
            ,[I_NAME]
            ,[I_PAY_TERM]
            ,[I_VENDOR_CD]
            ,CONCAT(
                ISNULL([I_ADDR1], ''),
                CASE WHEN [I_POST] IS NOT NULL THEN ' ' + [I_POST] ELSE '' END,
                CASE WHEN [I_TEL] IS NOT NULL THEN ' Tel. ' + [I_TEL] ELSE '' END,
                CASE WHEN [I_FAX] IS NOT NULL THEN ' Fax. ' + [I_FAX] ELSE '' END,
                CASE WHEN [I_TAXID] IS NOT NULL THEN ' TAX Payer I.D. No. ' + [I_TAXID] + '    ' ELSE '' END,
                CASE WHEN [I_BRANCH] IS NOT NULL THEN ' BRANCH(' + [I_BRANCH] + ')' ELSE '' END
            ) AS [SHIP2_ADDR_INFO]
        FROM [MS_CS]
    ) [SHIP_CS] ON [SHIP_CS].[I_CSCODE] = [H].[I_SHIP_TO]
    
    LEFT JOIN (
        SELECT 
             [I_CSCODE]
            ,[I_NAME]
            ,[I_TAX_DUTY]
            ,CONCAT(
                ISNULL([I_ADDR1], ''),
                CASE WHEN [I_POST] IS NOT NULL THEN ' ' + [I_POST] ELSE '' END,
                CASE WHEN [I_TEL] IS NOT NULL THEN ' Tel. ' + [I_TEL] ELSE '' END,
                CASE WHEN [I_FAX] IS NOT NULL THEN ' Fax. ' + [I_FAX] ELSE '' END,
                CASE WHEN [I_TAXID] IS NOT NULL THEN ' TAX Payer I.D. No. ' + [I_TAXID] + '    ' ELSE '' END,
                CASE WHEN [I_BRANCH] IS NOT NULL THEN ' BRANCH(' + [I_BRANCH] + ')' ELSE '' END
            ) AS [BILL_TO_ADDR_INFO]
        FROM [MS_CS]
    ) [BILL_CS] ON [BILL_CS].[I_CSCODE] = [H].[I_BILL_TO]
    
    LEFT JOIN (
        SELECT DISTINCT
             [I_CSCODE]
            ,[I_ITEMCODE]
            ,[I_DESC]
            ,[I_PKGCD]
            ,[I_DLY_PLACE]
            ,[I_PCS_BOX]
        FROM [MS_PRFG]
    ) [ITEM_MS] 
        ON [ITEM_MS].[I_CSCODE] = [H].[I_SHIP_TO]
        AND [ITEM_MS].[I_ITEMCODE] = [D].[I_ITEMCODE]
    
    -- Subquery: Summary Total
    LEFT JOIN (
        SELECT 
             [I_INVOICE_NO]
            ,CONCAT(SUM([I_PALLET_QTY]), ' PALLET') AS [TOTAL_PALLET]
            ,CONCAT(SUM([I_QTY]), ' BOX') AS [TOTAL_BOX_QTY]
            ,CONCAT(SUM([I_PCS_BOX]), ' PSC') AS [TOTAL_PCS_QTY]
            ,CONCAT(SUM([I_NET_WGT]), ' KGS') AS [TOTAL_NET_WGT]
        FROM [T_PR_INVOICE_D] [D2]
        LEFT JOIN [MS_PRFG] [MS2] 
            ON [MS2].[I_ITEMCODE] = [D2].[I_ITEMCODE]
            AND [MS2].[I_CSCODE] = (
                SELECT [I_SHIP_TO] FROM [T_PR_INVOICE_H] WHERE [I_INVOICE_NO] = [D2].[I_INVOICE_NO]
            )
        WHERE [D2].[I_INVOICE_NO] = /**%I_INVOICE_NO%**/'IV2602230001'
        GROUP BY [I_INVOICE_NO]
    ) [SUMMARY] ON [SUMMARY].[I_INVOICE_NO] = [D].[I_INVOICE_NO]
    
    WHERE [D].[I_INVOICE_NO] = /**%I_INVOICE_NO%**/'IV2602230001'

) AS [M]
ORDER BY [I_INVOICE_NO], [INTERNAL_NO];