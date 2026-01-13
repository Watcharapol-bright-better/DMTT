SELECT
     [SIT].[I_SHIP_LNNO]        -- Shipment Instruction Line
    ,[SIT].[I_SHIP_INST]        -- Shipment Instruction No
    ,[SIT].[INTERNAL_NO]        -- Internal No
    ,[SIT].[I_SONO]             -- SO No
    ,[SIT].[I_ITEMCODE]         -- Part No
    ,[MP].[I_DESC]             -- Part Name

    ,[SIT].[I_PALLET_QTY]       -- Pallet QTY
    ,ISNULL([ST].[BAL_QTY],  [SD].[I_QTY]) AS [I_BALANCE_QTY] -- SO Balance QTY
    ,ISNULL([SIT].[I_SHIP_QTY], 0) AS [I_SHIP_QTY] -- Shipment QTY
    ,[SIT].[I_BOX_QTY]          -- Box QTY

    ,[SIT].[I_LOTNO_FR]         -- Lot From
    ,[SIT].[I_LOTNO_TO]         -- Lot To
    ,[WO].[I_WODATE]           -- MFG Date
    ,[SIT].[I_SHP_PCK_STATUS]   -- Picking Status

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

    INNER JOIN [T_PR_SORD_D] AS [SD]
        ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE]

    LEFT JOIN [T_PR_WOH] AS [WO]
        ON [WO].[I_SONO] = [SIT].[I_SONO]

    LEFT JOIN (
        SELECT
            [I_ITEMCODE],
            MIN([I_LOTNO]) AS [MIN_LOTNO],
            MAX([I_LOTNO]) AS [MAX_LOTNO],
            SUM([I_INQTY]) - SUM([I_OUTQTY]) AS [BAL_QTY]
        FROM [T_PR_STOCK]
        GROUP BY [I_ITEMCODE]
    ) AS [ST]
        ON [ST].[I_ITEMCODE] = [SD].[I_ITEMCODE]

WHERE [SIT].[I_SHIP_INST] = /**%I_SHIP_INST%**/''
