-- tab 2 : Sales Record
SELECT
	 [INH].[I_INVOICE_DATE]
	,[INH].[I_INVOICE_NO]
	,[IND].[I_ITEMCODE] -- Part ID
	,[INH].[I_CSCODE]
	,[MP].[I_COMMODITY]
	,[MP].[I_TEMPER] -- Temper
	,[MP].[I_DESC] -- Part Name
	--,[INH].[I_TYPE]

	,[IND].[I_UNIT_PRICE]
	,[IND].[I_QTY]

FROM [T_PR_INVOICE_H] [INH]
	LEFT JOIN [T_PR_INVOICE_D] [IND]
		ON [IND].[I_INVOICE_NO] = [INH].[I_INVOICE_NO]
		
		