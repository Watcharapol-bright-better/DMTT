SELECT
     [SI].[I_SHIP_LNNO]
    ,[SI].[I_SHIP_INST]
    ,[SI].[INTERNAL_NO]
    ,[SI].[I_SONO]
    ,[SI].[I_ITEMCODE]
    ,[MP].[I_DESC]

    ,[SD].[I_QTY]                               -- SO Balance QTY
    ,ISNULL([SI].[I_SHIP_QTY], 1) AS [I_SHIP_QTY]

    ,[MP].[I_PCS_BOX]
    ,[SI].[I_LOTNO_FR]
    ,[SI].[I_LOTNO_TO]

    ,[WO].[I_WODATE]                            -- MFG Date
    ,[SK].[I_PLTNO]
    ,[SI].[I_SHP_PCK_STATUS]
    ,[SI].[I_QA_STATUS]
    
    ,[SI].[CREATED_DATE]
    ,[SI].[CREATED_BY]
    ,[SI].[CREATED_PRG_NM]
    ,[SI].[UPDATED_DATE]
    ,[SI].[UPDATED_BY]
    ,[SI].[UPDATED_PRG_NM]
    ,[SI].[MODIFY_COUNT]
FROM [T_PR_SHIP_INST_D] [SI]

LEFT JOIN [MS_PRFG] [MP]
    ON [MP].[I_ITEMCODE] = [SI].[I_ITEMCODE]

INNER JOIN [T_PR_STOCK] [SK]
    ON [SK].[I_ITEMCODE] = [SI].[I_ITEMCODE]

OUTER APPLY (
    SELECT SUM([D].[I_QTY]) AS [I_QTY]
    FROM [T_PR_SORD_D] [D]
    WHERE [D].[I_SONO] = [SI].[I_SONO]
) [SD]

OUTER APPLY (
    SELECT TOP 1 [W].[I_WODATE]
    FROM [T_PR_WOH] [W]
    WHERE [W].[I_SONO] = [SI].[I_SONO]
    ORDER BY [W].[I_WODATE] DESC
) [WO]

WHERE [SI].[I_SHIP_INST] = /**%I_SHIP_INST%**/''

-- ORDER BY [SI].[I_SHIP_LNNO]