
-- DMTT_T_PRESS_ASSIGN_SHIP_JOB :  Assign Shipment Job (Press)


SELECT 
     /**%I_ASSIGNTO%**/'' AS [I_ASSIGNTO]
    ,[SI].[I_SHIP_INST]      -- Shipping No
    ,[SI].[INTERNAL_NO]      -- Internal No
    ,[SI].[I_ITEMCODE]       -- Part No
    ,[MS].[I_DESC]           -- Part Name
    ,[SI].[I_SHIP_QTY]       -- Qty
    ,[MS].[I_PCS_BOX]        -- Box QTY
    ,[SI].[I_LOTNO_FR]       -- Lot From
    ,[SI].[I_LOTNO_TO]       -- Lot To

    --,'' AS [I_LOCCD]
    --,'' AS [I_PLTNO]

    ,[SK].[I_LOCCD]          -- Location
    ,[SK].[I_PLTNO]          -- Pallet Tag No.
    ,[SI].[I_SHIP_LNNO]
    , /**%SHIP_LIST%**/'' AS [SHIP_LIST]

    ,[SI].[CREATED_DATE]
    ,[SI].[CREATED_BY]
    ,[SI].[CREATED_PRG_NM]
    ,[SI].[UPDATED_DATE]
    ,[SI].[UPDATED_BY]
    ,[SI].[UPDATED_PRG_NM]
    ,[SI].[MODIFY_COUNT]
FROM [T_PR_SHIP_INST_D] [SI]
    LEFT JOIN [T_PR_SHIP_INST_H] [SH]
        ON [SH].[I_SHIP_INST] = [SI].[I_SHIP_INST]
        
    LEFT JOIN [MS_CS] [CS]
        ON [CS].[I_CSCODE] = [SH].[I_CSCODE]
        
    LEFT JOIN [MS_PRFG] [MS]
        ON [SI].[I_ITEMCODE] = [MS].[I_ITEMCODE]
        
    INNER JOIN [T_PR_STOCK] [SK]
       ON [SK].[I_ITEMCODE] = [SI].[I_ITEMCODE]

WHERE [SI].[I_SHIP_INST] IN (
   SELECT 
    TRIM(
        SUBSTRING(value, CHARINDEX(':', value) + 1, LEN(value))
    ) AS [I_SHIP_INST]
    FROM STRING_SPLIT( /**%SHIP_LIST%**/'' , ',')
    WHERE value LIKE '%:%'

)

