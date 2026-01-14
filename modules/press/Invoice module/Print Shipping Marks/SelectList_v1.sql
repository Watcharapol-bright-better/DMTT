SELECT
     ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS [PACKAGE_NO]
    ,[SD].[I_SHIP_INST]        -- Shipment Instruction No
    ,[SD].[INTERNAL_NO]        -- Internal No
    ,[SD].[I_SONO]             -- SO No
    ,[SD].[I_ITEMCODE]         -- Part No
    ,[MP].[I_DESC]             -- Part Name
    ,[SH].[I_INVOICE_NO]
    ,[SH].[I_SHIP_DLY_DATE]

    ,[SD].[I_PALLET_QTY]       -- Pallet QTY
    ,ISNULL([SD].[I_SHIP_QTY], 0) AS [I_SHIP_QTY] -- Shipment QTY
    ,[SD].[I_BOX_QTY] AS [I_PCS_BOX]          -- Box QTY
    ,CONCAT([SD].[I_LOTNO_FR], '-', [SD].[I_LOTNO_TO]) AS [LOT_NO]
    ,[WO].[I_WODATE]           -- MFG Date

FROM [T_PR_SHIP_INST_D] [SD]
    LEFT JOIN [MS_PRFG] [MP]
        ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE]

    LEFT JOIN [T_PR_SHIP_INST_H] [SH]
        ON [SH].[I_SHIP_INST] = [SD].[I_SHIP_INST]

    LEFT JOIN [T_PR_WOH] [WO]
        ON [WO].[I_SONO] = [SD].[I_SONO]

WHERE [SD].[I_SHIP_INST] = /**%I_SHIP_INST%**/'SI2601130017'
