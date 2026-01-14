SELECT
     [SD].[I_SHIP_INST]        -- Shipment Instruction No
    ,[SD].[I_SHIP_INST] AS [QRCODE]
    ,[SD].[I_SONO]             -- Order No
    ,[SOH].[I_CSCODE]          -- Customer Code
    ,[CS].[I_NAME]             -- Customer Name

    ,[SD].[I_ITEMCODE]         -- Part No
    ,[MP].[I_DESC]             -- Part Name

    ,(
        ([MP].[I_PCS_BOX]/[MP].[I_BOX_PALLET]) -- 1 Pallet สามารถบรรจุได้กี่ชิ้น
        / [SD].[I_SHIP_QTY] -- จะส่งทั้งหมดกี่ชิ้น
     ) AS [I_PALLET_QTY]  -- Pallet QTY
    ,[SD].[I_BOX_QTY] AS [PACKAGE]          -- Box QTY
    ,([SD].[I_SHIP_QTY] * [MP].[I_PROD_WGT]) + ([SD].[I_BOX_QTY] * ISNULL([PKG].[I_WEIGHT], 1)) AS [NET_WGT] -- Net Weight

    ,ISNULL([PLT].[I_WIDTH], 32.000) AS [PALLET_WEIGHT] -- Pallet Weight
    ,(([SD].[I_SHIP_QTY] * [MP].[I_PROD_WGT]) + ([SD].[I_BOX_QTY] * ISNULL([PKG].[I_WEIGHT], 1))) + ISNULL([PLT].[I_WIDTH], 32.000) AS [GROSS_WGT] -- Gross Weight

    ,[WO].[I_WODATE] AS [MFG_DATE]           -- MFG Date
    ,CONCAT([SD].[I_LOTNO_FR], '-', [SD].[I_LOTNO_TO]) AS [LOT_NO]

    ,[INV].[I_QTY] AS [QUANTITY]
    ,[SOD].[I_DLY_PLACE]       -- Delivery Place
    ,[SH].[I_INVOICE_NO]
    ,[SH].[I_SHIP_DLY_DATE] AS [DELIVERY_DATE]

FROM [T_PR_SHIP_INST_D] [SD]

    LEFT JOIN [T_PR_SHIP_INST_H] [SH]
        ON [SH].[I_SHIP_INST] = [SD].[I_SHIP_INST]

    LEFT JOIN [T_PR_INVOICE_D] [INV]
        ON [INV].[I_INVOICE_NO] = [SH].[I_INVOICE_NO]
        AND [INV].[I_ITEMCODE] = [SD].[I_ITEMCODE]

    LEFT JOIN [MS_PR_PKG] [PKG]
        ON [PKG].[I_PKGCD] = [INV].[I_PKGCD]

    LEFT JOIN [T_PR_SORD_H] [SOH]
        ON [SOH].[I_SONO] = [SD].[I_SONO]

    LEFT JOIN [T_PR_SORD_D] [SOD]
        ON [SOD].[I_SONO] = [SOH].[I_SONO]
        AND [SOD].[I_ITEMCODE] = [SD].[I_ITEMCODE]

    LEFT JOIN [MS_CS] [CS]
        ON [CS].[I_CSCODE] = [SOH].[I_CSCODE]

    LEFT JOIN [MS_PRFG] [MP]
        ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE]

    LEFT JOIN [MS_PRFG] [PLT]
        ON [PLT].[I_ITEMCODE] = [MP].[I_PKGCD]

    LEFT JOIN [T_PR_WOH] [WO]
        ON [WO].[I_SONO] = [SD].[I_SONO]

WHERE [SD].[I_SHIP_INST] = /**%I_SHIP_INST%**/'SI2601130017'
