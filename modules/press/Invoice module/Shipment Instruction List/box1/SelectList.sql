

SELECT 
     '' AS [SEL_CHK]
    ,[SH].[I_SHIP_INST]              -- Shipment Instruction No
    ,[SH].[I_SHIP_CFM]         -- Picking Status
    ,[SH].[I_SHIP_DLY_DATE]          -- Delivery Date

    ,[SH].[I_CSCODE]                 -- Customer Code
    ,[CS].[I_NAME]                   -- Customer Name
    ,[SH].[I_SHIPTO]                 -- Ship To
    ,'' AS [I_SONO]                  -- SO No. (for Search)
    ,[SH].[I_ENDUSER]                -- P.I.C
    ,[SH].[I_INVOICE_NO]             -- Invoice No.
FROM [T_PR_SHIP_INST_H] [SH]
    LEFT JOIN [MS_CS] [CS]
        ON [CS].[I_CSCODE] = [SH].[I_CSCODE]

-- Shipment Instruction List (Press)
