SELECT
         [SH].[I_SHIP_INST]        -- Shipment Instruction No
        ,[SH].[I_SHIP_INST_DATE]   -- Shipment Instruction Date
        ,[SD].[I_SHIP_CFM]         -- Shipment Status
        ,[SH].[I_CSCODE]           -- Customer Code
        ,[CS].[I_NAME]             -- Customer Name
        ,[SH].[I_SHIP_DLY_DATE]    -- Shipment Delivery Date
        ,[SH].[I_SHIPTO]           -- Ship To
        ,[SH].[I_ENDUSER]          -- P.I.C

        ,[SH].[CREATED_DATE]
        ,[SH].[CREATED_BY]
        ,[SH].[CREATED_PRG_NM]
        ,[SH].[UPDATED_DATE]
        ,[SH].[UPDATED_BY]
        ,[SH].[UPDATED_PRG_NM]
        ,[SH].[MODIFY_COUNT]
        , '' AS [b]
FROM [T_PR_SHIP_INST_H] [SH]
    LEFT JOIN [MS_CS] [CS]
        ON [CS].[I_CSCODE] = [SH].[I_CSCODE]

WHERE [SI].[I_SHIP_INST] = /**%I_SHIP_INST%**/''
