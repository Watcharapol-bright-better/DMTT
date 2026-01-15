SELECT
      [PAGE_NO]
     ,ROW_NUMBER() OVER(PARTITION BY [I_INVOICE_NO], [PAGE_NO] ORDER BY [INTERNAL_NO]) AS [I_INVOICE_LNNO] -- Line no 
     ,[I_INVOICE_NO]
     ,[I_CSCODE]
     ,[I_SHIP_TO]
     ,[SOLD_TO]
     ,[I_ADDR1]
     ,[POSTAL_CODE]
     ,[I_TEL]
     ,[I_FAX]
     ,[I_BRANCH]
     ,[ADDR_INFO]
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
     ,[TOTAL_AMOUNT]

FROM (
    SELECT
          CEILING(ROW_NUMBER() OVER(PARTITION BY [D].[I_INVOICE_NO] ORDER BY [D].[INTERNAL_NO]) / 30.0) AS [PAGE_NO] -- Page break
         ,[D].[INTERNAL_NO]
         ,[D].[I_INVOICE_NO]
         ,[H].[I_CSCODE]
         ,[H].[I_SHIP_TO]
         ,[CUS].[I_NAME] AS [SOLD_TO]
         ,[CUS].[I_ADDR1]
         ,[CUS].[I_POST] AS [POSTAL_CODE]
         ,[CUS].[I_TEL]
         ,[CUS].[I_FAX]
         ,[CUS].[I_BRANCH]

        ,CONCAT(
            [CUS].[I_ADDR1], ' ',
            [CUS].[I_POST], ' ',
            'Tel. ', [CUS].[I_TEL], ' ',
            'Fax. ', [CUS].[I_FAX], ' ',
            'BRANCH(', [CUS].[I_BRANCH], ')'
        ) AS [ADDR_INFO]

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
         ,SUM([D].[I_AMOUNT])            OVER (PARTITION BY [D].[I_INVOICE_NO]) AS [TOTAL_AMOUNT]

    FROM [T_PR_INVOICE_D] [D]

             INNER JOIN [T_PR_INVOICE_H] [H]
                        ON [H].[I_INVOICE_NO] = [D].[I_INVOICE_NO]

             LEFT JOIN [MS_CS] [CUS]
                       ON [CUS].[I_CSCODE] = [H].[I_SHIP_TO]

             LEFT JOIN [MS_PRFG] [MS]
                       ON [MS].[I_ITEMCODE] = [D].[I_ITEMCODE]

    WHERE [D].[I_INVOICE_NO] = /**%I_INVOICE_NO%**/'IV2601150021'
) AS [M]

ORDER BY [I_INVOICE_NO], [INTERNAL_NO]