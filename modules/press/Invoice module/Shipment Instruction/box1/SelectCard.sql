SELECT
         [SI].[I_SHIP_INST]        -- Shipment Instruction No
        ,[SI].[I_SHIP_INST_DATE]   -- Shipment Instruction Date
        ,'' AS [I_SHIP_CFM]         -- Shipment Status
        ,[SI].[I_CSCODE]           -- Customer Code
        ,[CS].[I_NAME]             -- Customer Name
        ,[SI].[I_SHIP_DLY_DATE]    -- Shipment Delivery Date
        ,[SI].[I_SHIPTO]           -- Ship To
        ,[SI].[I_ENDUSER]          -- P.I.C

        ,[SI].[CREATED_DATE]
        ,[SI].[CREATED_BY]
        ,[SI].[CREATED_PRG_NM]
        ,[SI].[UPDATED_DATE]
        ,[SI].[UPDATED_BY]
        ,[SI].[UPDATED_PRG_NM]
        ,[SI].[MODIFY_COUNT]
        , '' AS [b]
FROM [T_PR_SHIP_INST_H] [SI]
    LEFT JOIN [MS_CS] [CS]
        ON [CS].[I_CSCODE] = [SI].[I_CSCODE]
        
WHERE [SI].[I_SHIP_INST] = /**%I_SHIP_INST%**/''
