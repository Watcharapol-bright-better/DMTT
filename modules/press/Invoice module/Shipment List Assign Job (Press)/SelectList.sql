
SELECT 
     '' AS [SEL_CHK]
    ,[SH].[I_SHIP_INST]              -- Shipment Instruction No
    ,[SH].[I_SHIP_CFM]         -- Picking Status
    ,[SH].[I_SHIP_DLY_DATE]          -- Delivery Date

    ,[SH].[I_CSCODE]                 -- Customer Code
    ,[CS].[I_NAME]                   -- Customer Name
    ,[SH].[I_SHIPTO]                 -- Ship To
    ,(SELECT TOP 1 [I_SONO] 
      FROM [T_PR_SHIP_INST_D] 
      WHERE [I_SHIP_INST] = [SH].[I_SHIP_INST]) AS [I_SONO] -- SO No. (for Search)
    ,[SH].[I_PIC]                -- P.I.C
    ,[SH].[I_INVOICE_NO]             -- Invoice No.
    ,[H].[I_TYPE]                    -- Invoice Type
    ,[H].[CREATED_DATE]
FROM [T_PR_SHIP_INST_H] [SH]
    LEFT JOIN [MS_CS] [CS]
        ON [CS].[I_CSCODE] = [SH].[I_CSCODE]

    LEFT JOIN [T_PR_INVOICE_H] [H]
        ON [H].[I_INVOICE_NO] = [SH].[I_INVOICE_NO]

WHERE [SH].[I_INVOICE_NO] IS NOT NULL