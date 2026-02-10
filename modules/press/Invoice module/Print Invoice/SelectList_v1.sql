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
            ,[H].[I_SHIP_ORDER_DATE] -- Delivery Date
            -- SHIP TO
            ,[CS_SHIP2].[I_NAME] AS [SHIP_TO_NAME]
            ,[CS_SHIP2].[I_PAY_TERM] AS [SHIP_TO_PAY_TERM]
            ,[CS_SHIP2].[I_VENDOR_CD] AS [SHIP_TO_VENDOR_CD]
            ,[MS].[I_DLY_PLACE] AS [SHIP_TO_DLY_PLACE]
      
            ,CONCAT(
                ISNULL([CS_SHIP2].[I_ADDR1], ''),
                CASE 
                    WHEN [CS_SHIP2].[I_POST] IS NOT NULL 
                    THEN ' ' + [CS_SHIP2].[I_POST] 
                    ELSE '' 
                END,
                CASE 
                    WHEN [CS_SHIP2].[I_TEL] IS NOT NULL 
                    THEN ' Tel. ' + [CS_SHIP2].[I_TEL] 
                    ELSE '' 
                END,
                CASE 
                    WHEN [CS_SHIP2].[I_FAX] IS NOT NULL 
                    THEN ' Fax. ' + [CS_SHIP2].[I_FAX] 
                    ELSE '' 
                END,
                CASE 
                    WHEN [CS_SHIP2].[I_TAXID] IS NOT NULL 
                    THEN ' TAX Payer I.D. No. ' + [CS_SHIP2].[I_TAXID]  + '    '
                    ELSE '' 
                END,
                CASE 
                    WHEN [CS_SHIP2].[I_BRANCH] IS NOT NULL 
                    THEN ' BRANCH(' + [CS_SHIP2].[I_BRANCH] + ')' 
                    ELSE '' 
                END
            ) AS [SHIP2_ADDR_INFO]
   
   
            -- BILL TO
            ,[CS_BILL2].[I_NAME] AS [BILL_TO_NAME]
            ,[CS_BILL2].[I_TAX_DUTY] AS [BILL_TO_TAX_DUTY]
      
            ,CONCAT(
                ISNULL([CS_BILL2].[I_ADDR1], ''),
                CASE 
                    WHEN [CS_BILL2].[I_POST] IS NOT NULL 
                    THEN ' ' + [CS_BILL2].[I_POST] 
                    ELSE '' 
                END,
                CASE 
                    WHEN [CS_BILL2].[I_TEL] IS NOT NULL 
                    THEN ' Tel. ' + [CS_BILL2].[I_TEL] 
                    ELSE '' 
                END,
                CASE 
                    WHEN [CS_BILL2].[I_FAX] IS NOT NULL 
                    THEN ' Fax. ' + [CS_BILL2].[I_FAX] 
                    ELSE '' 
                END,
                CASE 
                    WHEN [CS_BILL2].[I_TAXID] IS NOT NULL 
                    THEN ' TAX Payer I.D. No. ' + [CS_BILL2].[I_TAXID] + '    '
                    ELSE '' 
                END,
                CASE 
                    WHEN [CS_BILL2].[I_BRANCH] IS NOT NULL 
                    THEN ' BRANCH(' + [CS_BILL2].[I_BRANCH] + ')' 
                    ELSE '' 
                END
            ) AS [BILL_TO_ADDR_INFO]
   
   
            -- Item
            ,[D].[I_ITEMCODE]
            ,[MS].[I_DESC]
            ,[MS].[I_PKGCD]
            ,[D].[I_PALLET_QTY] AS [PALLET]
            ,[D].[I_QTY] AS [BOX_QTY]
            ,[MS].[I_PCS_BOX] AS [PCS_QTY]
            ,[D].[I_NET_WGT]
            ,[D].[I_UNIT_PRICE]
            ,[D].[I_AMOUNT]
   
            ,CONCAT(SUM([D].[I_PALLET_QTY]) OVER (PARTITION BY [D].[I_INVOICE_NO]), ' PALLET') AS [TOTAL_PALLET]
            ,CONCAT(SUM([D].[I_QTY])        OVER (PARTITION BY [D].[I_INVOICE_NO]), ' BOX') AS [TOTAL_BOX_QTY]
            ,CONCAT(SUM([MS].[I_PCS_BOX])   OVER (PARTITION BY [D].[I_INVOICE_NO]), ' PSC') AS [TOTAL_PCS_QTY]
            ,CONCAT(SUM([D].[I_NET_WGT])    OVER (PARTITION BY [D].[I_INVOICE_NO]), ' KGS') AS [TOTAL_NET_WGT]

   
       FROM [T_PR_INVOICE_D] [D]
   
                INNER JOIN [T_PR_INVOICE_H] [H]
                           ON [H].[I_INVOICE_NO] = [D].[I_INVOICE_NO]
   
                LEFT JOIN [MS_CS] [CS_SHIP2]
                          ON [CS_SHIP2].[I_CSCODE] = [H].[I_SHIP_TO]
                          
                LEFT JOIN [MS_CS] [CS_BILL2]
                          ON [CS_BILL2].[I_CSCODE] = [H].[I_BILL_TO]
   
                LEFT JOIN [MS_PRFG] [MS]
                          ON [MS].[I_CSCODE] = [H].[I_SHIP_TO]
   
       WHERE [D].[I_INVOICE_NO] = /**%I_INVOICE_NO%**/'CN2601280001'
    
) AS [M]

--ORDER BY [I_INVOICE_NO], [INTERNAL_NO]