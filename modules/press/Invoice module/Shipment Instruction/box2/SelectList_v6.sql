SELECT
     [SIT].[I_SHIP_LNNO]        -- Shipment Instruction Line
    ,[SIT].[I_SHIP_INST]        -- Shipment Instruction No
    ,[SIT].[INTERNAL_NO]        -- Internal No
    ,[SIT].[I_SONO]             -- SO No
    
    ,[SIT].[I_ITEMCODE]         -- Part No
    ,[MP].[I_DESC]              -- Part Name

    ,[SIT].[I_PALLET_NO]        -- Pallet No
    ,[SIT].[I_PALLET_QTY]       -- Pallet QTY
    ,[SIT].[I_BALANCE_QTY]      -- SO Balance QTY
    ,[SIT].[I_SHIP_QTY]         -- Shipment QTY
    ,[SIT].[I_BOX_QTY]          -- Box QTY

    ,[SIT].[I_LOTNO_FR]         -- Lot From
    ,[SIT].[I_LOTNO_TO]         -- Lot To
    ,[WO].[I_WODATE]            -- MFG Date
    ,[SIT].[I_SHP_PCK_STATUS]   -- Picking Status
    ,[SIT].[I_QA_STATUS]        -- QA Status

    ,[SIT].[CREATED_DATE]
    ,[SIT].[CREATED_BY]
    ,[SIT].[CREATED_PRG_NM]
    ,[SIT].[UPDATED_DATE]
    ,[SIT].[UPDATED_BY]
    ,[SIT].[UPDATED_PRG_NM]
    ,[SIT].[MODIFY_COUNT]

FROM [T_PR_SHIP_INST_D] AS [SIT]
    LEFT JOIN [MS_PRFG] AS [MP]
        ON [MP].[I_ITEMCODE] = [SIT].[I_ITEMCODE]

    LEFT JOIN [T_PR_SORD_D] AS [SD]
        ON [SD].[I_SONO] = [SIT].[I_SONO]
        AND [SD].[I_ITEMCODE] = [SIT].[I_ITEMCODE]

    LEFT JOIN [T_PR_WOH] AS [WO]
        ON [WO].[I_SONO] = [SIT].[I_SONO]
        AND [WO].[I_ITEMCODE] = [SIT].[I_ITEMCODE]

WHERE [SIT].[I_SHIP_INST] = /**%I_SHIP_INST%**/''
