SELECT
     [SD].[I_SHIP_LNNO]        -- Shipment Instruction Line 
    ,[SD].[I_SHIP_INST]        -- Shipment Instruction No
    ,[SD].[INTERNAL_NO]        -- Internal No
    ,[SD].[I_SONO]             -- SO No
    ,[SD].[I_ITEMCODE]         -- Part No
    ,[MP].[I_DESC]             -- Part Name

    ,[SD].[I_PALLET_QTY]       -- Pallet QTY
    ,[SD].[I_BALANCE_QTY]      -- SO Balance QTY
    ,ISNULL([SD].[I_SHIP_QTY], 0) AS [I_SHIP_QTY] -- Shipment QTY
    ,[SD].[I_BOX_QTY]          -- Box QTY

    ,[SD].[I_LOTNO_FR]         -- Lot From
    ,[SD].[I_LOTNO_TO]         -- Lot To
    ,[WO].[I_WODATE]           -- MFG Date
    ,[SD].[I_SHP_PCK_STATUS]   -- Picked Status

    ,[SD].[CREATED_DATE]
    ,[SD].[CREATED_BY]
    ,[SD].[CREATED_PRG_NM]
    ,[SD].[UPDATED_DATE]
    ,[SD].[UPDATED_BY]
    ,[SD].[UPDATED_PRG_NM]
    ,[SD].[MODIFY_COUNT]

FROM [T_PR_SHIP_INST_D] AS [SD]
    LEFT JOIN [MS_PRFG] AS [MP]
        ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE]

    LEFT JOIN [T_PR_WOH] AS [WO]
        ON [WO].[I_SONO] = [SD].[I_SONO]

WHERE [SD].[I_SHIP_INST] = /**%I_SHIP_INST%**/''