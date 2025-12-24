SELECT DISTINCT 
     --[D].[I_SHIP_INST]
     [D].[INTERNAL_NO] AS [INST_INNO]
    ,'' AS [I_INVOICE_NO]
    ,'' AS [INTERNAL_NO]
    ,NULL AS [I_INVOICE_LNNO]
    ,[D].[I_ITEMCODE]
    ,[CS].[I_DESC]
    ,[CS].[I_PKGCD] -- Packaging Type
    --,[SK].[I_PLTNO] -- Pallet No.
    ,1 AS [I_PALLET_QTY]
    ,[D].[I_SHIP_QTY] AS [I_QTY]
    
    ,([D].[I_SHIP_QTY] * [CS].[I_PROD_WGT]) AS [I_NET_WGT] -- 'I_PROD_WGT * (Qty from invoice)
    --,NULL AS [I_UNTPRI]
    --,NULL AS [I_AMOUNT]
    ,[SOD].[I_UNTPRI] AS [I_UNIT_PRICE] -- Unit Price
    ,ISNULL( [SOD].[I_AMOUNT], 0 ) AS [I_AMOUNT] -- Total Price
    , /**%I_SHIP_ORDER_NO%**/'' AS [I_SHIP_ORDER_NO]
FROM [T_PR_SHIP_INST_D] [D]
INNER JOIN [MS_PRFG] [CS]
	ON [CS].[I_ITEMCODE] = [D].[I_ITEMCODE]

INNER JOIN [T_PR_STOCK] [SK]
	ON [SK].[I_ITEMCODE] = [D].[I_ITEMCODE]

INNER JOIN [T_PR_SORD_D] [SOD]
    ON [SOD].[I_ITEMCODE] = [D].[I_ITEMCODE] 
        AND [D].[I_SONO] = [SOD].[I_SONO] 


WHERE [D].[I_SHIP_INST] = /**%I_SHIP_ORDER_NO%**/'SI202512230019'
