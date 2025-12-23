
-- DMTT_T_PRESS_ASSIGN_SHIP_JOB :  Assign Shipment Job (Press)


SELECT 
     [SI].[I_ASSIGNTO]
	,[SI].[I_SHIP_INST] -- Shipping No
    ,[SI].[I_ITEMCODE] -- Part No
	,[MS].[I_DESC]  -- Part Name
	,[SI].[I_SHIP_QTY] -- Qty
	,[MS].[I_PCS_BOX] -- Box QTY
	,[SI].[I_LOTNO_FR] -- Lot From
    ,[SI].[I_LOTNO_TO] -- Lot To
	,[SK].[I_LOCCD]
    ,[SK].[I_PLTNO]
    ,[SI].[I_SHIP_LNNO]
    , /**%SELECTED%**/'' AS [SELECTED]
FROM [T_PR_SHIP_INST] [SI]
        LEFT JOIN [MS_CS] [CS]
                ON [CS].[I_CSCODE] = [SI].[I_CSCODE]
        LEFT JOIN [MS_PRFG] [MS]
                ON  [SI].[I_ITEMCODE] = [MS].[I_ITEMCODE]
        LEFT JOIN [T_PR_STOCK] [SK]
            ON [SK].[I_ITEMCODE] = [SI].[I_CSCODE]
                
WHERE [SI].[DETAIL_TYPE] = '1' 
    AND [SI].[I_SHIP_INST] IN (
     SELECT TRIM(value)
     FROM STRING_SPLIT( /**%SELECTED%**/'' , ',')
    )

