

SELECt *
FROM [T_PR_INVOICE_H]

SELECT
     '' AS [SEL_CHK]
    ,[IH].[I_INVOICE_NO]
    ,[IH].[I_INVOICE_DATE]
    ,[IH].[I_SHIP_ORDER_NO]
    ,[IH].[I_APPR_STATUS] 
    ,[IH].[I_CSCODE]
    ,[MC].[I_NAME]
    ,ISNULL([IH].[I_TYPE], 'Invoice') AS [I_TYPE]
    ,[SH].[I_PIC]
    ,[IH].[I_ATTN]
    ,[IH].[I_SHIP_TO]
   
FROM [T_PR_INVOICE_H] [IH]
    LEFT JOIN [MS_CS] AS [MC] 
        ON [MC].[I_CSCODE] = [IH].[I_CSCODE]
    LEFT JOIN [T_PR_SHIP_INST_H] [SH]
        ON [SH].[I_SHIP_INST] = [IH].[I_SHIP_ORDER_NO]


