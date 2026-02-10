SELECT
      [I_INVOICE_NO]
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
     -- เพิ่มใหม่
     ,[QUANTITY]
     ,[GROSS_WGT]
     ,[COUNT_PALLET]

FROM (
    
    SELECT
             [D].[I_INVOICE_NO]
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
            
            -- เพิ่มข้อมูลจาก Subquery SHIP_INST
            ,[SHIP_DATA].[QUANTITY]
            ,[SHIP_DATA].[GROSS_WGT]
            ,[SHIP_DATA].[COUNT_PALLET]

       FROM [T_PR_INVOICE_D] [D]
   
                INNER JOIN [T_PR_INVOICE_H] [H]
                           ON [H].[I_INVOICE_NO] = [D].[I_INVOICE_NO]
   
                LEFT JOIN [MS_CS] [CS_SHIP2]
                          ON [CS_SHIP2].[I_CSCODE] = [H].[I_SHIP_TO]
                          
                LEFT JOIN [MS_CS] [CS_BILL2]
                          ON [CS_BILL2].[I_CSCODE] = [H].[I_BILL_TO]
   
                LEFT JOIN [MS_PRFG] [MS]
                          ON [MS].[I_ITEMCODE] = [D].[I_ITEMCODE]
                
                LEFT JOIN (
                    
                    SELECT
                         [SH].[I_INVOICE_NO]
                        ,[SD].[I_ITEMCODE]
                        ,[INV].[I_QTY] AS [QUANTITY]
                        ,(([SD].[I_SHIP_QTY] * [MP].[I_PROD_WGT]) + ([SD].[I_BOX_QTY] * ISNULL([PKG].[I_WEIGHT], 1))) + ISNULL([PLT].[I_WIDTH], 32.000) AS [GROSS_WGT]
                        ,COUNT(*) OVER (PARTITION BY [SH].[I_INVOICE_NO]) AS [COUNT_PALLET]
                    
                    FROM [T_PR_SHIP_INST_D] [SD]
                    
                        INNER JOIN [T_PR_SHIP_INST_H] [SH]
                            ON [SH].[I_SHIP_INST] = [SD].[I_SHIP_INST]
                        
                        LEFT JOIN [T_PR_INVOICE_D] [INV]
                            ON [INV].[I_INVOICE_NO] = [SH].[I_INVOICE_NO]
                            AND [INV].[I_ITEMCODE] = [SD].[I_ITEMCODE]
                        
                        LEFT JOIN [MS_PR_PKG] [PKG]
                            ON [PKG].[I_PKGCD] = [INV].[I_PKGCD]
                        
                        LEFT JOIN [MS_PRFG] [MP]
                            ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE]
                        
                        LEFT JOIN [MS_PRFG] [PLT]
                            ON [PLT].[I_ITEMCODE] = [MP].[I_PKGCD]
                    WHERE [SD].[I_SHIP_INST] = /**%I_SHIP_INST%**/'SI2602040010'

                ) AS [SHIP_DATA]
                    ON [SHIP_DATA].[I_INVOICE_NO] = [H].[I_INVOICE_NO]
                    AND [SHIP_DATA].[I_ITEMCODE] = [D].[I_ITEMCODE]
   
       WHERE [D].[I_INVOICE_NO] = /**%I_INVOICE_NO%**/'IV2601280001'
    
) AS [M]