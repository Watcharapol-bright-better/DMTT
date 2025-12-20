
SELECT 
     ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + 1 AS [I_SHIP_LNNO] -- Shipment Instruction Line
    ,[SI].[I_SHIP_INST] -- Shipment Instruction No
    ,[SD].[I_SONO] -- SO No.
    ,[SD].[I_ITEMCODE] -- Part NO
    ,[MP].[I_DESC]  -- Part Name
    ,[SD].[I_QTY]  -- SO Balance QTY
    ,ISNULL([SI].[I_SHIP_QTY], 1) AS [I_SHIP_QTY] -- Shipment QTY
    ,[MP].[I_PCS_BOX] -- Box QTY
    ,[SI].[I_LOTNO_FR] -- Lot From
    ,[SI].[I_LOTNO_TO] -- Lot To
    ,[WO].[I_WODATE] -- MFG Date
    
    ,[SI].[CREATED_DATE]
    ,[SI].[CREATED_BY]
    ,[SI].[CREATED_PRG_NM]
    ,[SI].[UPDATED_DATE]
    ,[SI].[UPDATED_BY]
    ,[SI].[UPDATED_PRG_NM]
    ,[SI].[MODIFY_COUNT]
FROM [T_PR_SORD] AS [SD] 
    INNER JOIN [MS_PRFG] [MP] 
        ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE] 
    LEFT JOIN [T_PR_SHIP_INST] [SI]
       ON [SI].[I_SONO] = [SD].[I_SONO]  AND [SD].[I_LNNO] = [SI].[I_SHIP_LNNO]
    LEFT JOIN [T_PR_WOH] [WO]
	    ON [WO].[I_SONO] = [SD].[I_SONO]
	
WHERE
(
    /**%I_SHIP_INST%**/'' IS NULL
    OR NOT EXISTS (
        SELECT 1
        FROM T_PR_SHIP_INST
        WHERE I_SHIP_INST = /**%I_SHIP_INST%**/''
    )
    OR SI.I_SHIP_INST = /**%I_SHIP_INST%**/''
)
