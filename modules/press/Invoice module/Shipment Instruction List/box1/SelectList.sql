
SELECT 
	'' AS [SEL_CHK]
	,[SI].[I_SHIP_INST] -- Shipment Instruction No
    ,[SI].[I_SHP_PKG_STATUS] -- Picking Status
	,[SI].[I_SHIP_DLY_DATE] -- Delivery Date

	,[SI].[I_CSCODE] -- Customer Code
	,[CS].[I_NAME] -- Customer Name
	,[SI].[I_SHIPTO] -- Ship To
    ,[SI].[I_SONO] -- SO No.
	,[SI].[I_ENDUSER] -- P.I.C
    ,[SI].[I_INVOICE_NO] -- Invoice No.

FROM [T_PR_SHIP_INST] [SI]
LEFT JOIN [MS_CS] [CS]
        ON [CS].[I_CSCODE] = [SI].[I_CSCODE]
WHERE [I_SHIP_LNNO] = 1 

-- Shipment Instruction List (Press)
