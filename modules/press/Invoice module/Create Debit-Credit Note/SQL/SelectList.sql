SELECT
     [I_INVOICE_NO]
    ,[INTERNAL_NO]
    ,[I_INVOICE_LNNO]
    ,[I_ITEMCODE]
    ,[I_DESC]
    ,[I_PKGCD]
    ,[I_PALLET_QTY]
    ,[I_QTY]
    ,[I_NET_WGT]
    ,[I_UNIT_PRICE]
    ,[I_AMOUNT]
FROM (

    SELECT DISTINCT
         ''                              AS [I_INVOICE_NO],
         ''                              AS [INTERNAL_NO],
         NULL                            AS [I_INVOICE_LNNO],
         [D].[I_ITEMCODE]                AS [I_ITEMCODE],
         [CS].[I_DESC]                   AS [I_DESC],
         [CS].[I_PKGCD]                  AS [I_PKGCD],
         [D].[I_PALLET_QTY]              AS [I_PALLET_QTY],
         [D].[I_SHIP_QTY]                AS [I_QTY],
         ([D].[I_SHIP_QTY] * [CS].[I_PROD_WGT]) AS [I_NET_WGT],
         [SOD].[I_UNTPRI]                AS [I_UNIT_PRICE],
         ISNULL([SOD].[I_AMOUNT], 0)     AS [I_AMOUNT]
    FROM [T_PR_SHIP_INST_D] AS [D]
    INNER JOIN [MS_PRFG] AS [CS]
        ON [CS].[I_ITEMCODE] = [D].[I_ITEMCODE]
    INNER JOIN [T_PR_STOCK] AS [SK]
        ON [SK].[I_ITEMCODE] = [D].[I_ITEMCODE]
    INNER JOIN [T_PR_SORD_D] AS [SOD]
        ON [SOD].[I_ITEMCODE] = [D].[I_ITEMCODE]
       AND [D].[I_SONO] = [SOD].[I_SONO]
    WHERE [D].[I_SHIP_INST] = /**%I_SHIP_ORDER_NO%**/''
      AND ISNULL( /**%I_SHIP_ORDER_NO%**/'' , '') <> ''
      AND ISNULL( /**%I_INVOICE_NO%**/'' , '') = ''

    UNION ALL

    SELECT
         [ID].[I_INVOICE_NO]     AS [I_INVOICE_NO],
         [ID].[INTERNAL_NO]      AS [INTERNAL_NO],
         [ID].[I_INVOICE_LNNO]   AS [I_INVOICE_LNNO],
         [ID].[I_ITEMCODE]       AS [I_ITEMCODE],
         [CS].[I_DESC]           AS [I_DESC],
         [ID].[I_PKGCD]          AS [I_PKGCD],
         [ID].[I_PALLET_QTY]     AS [I_PALLET_QTY],
         [ID].[I_QTY]            AS [I_QTY],
         [ID].[I_NET_WGT]        AS [I_NET_WGT],
         [ID].[I_UNIT_PRICE]     AS [I_UNIT_PRICE],
         [ID].[I_AMOUNT]         AS [I_AMOUNT]
    FROM [T_PR_INVOICE_D] AS [ID]
    INNER JOIN [MS_PRFG] AS [CS]
        ON [CS].[I_ITEMCODE] = [ID].[I_ITEMCODE]
    WHERE [ID].[I_INVOICE_NO] = /**%I_INVOICE_NO%**/''
      AND ISNULL( /**%I_INVOICE_NO%**/'' , '') <> ''
      
) AS [X]
