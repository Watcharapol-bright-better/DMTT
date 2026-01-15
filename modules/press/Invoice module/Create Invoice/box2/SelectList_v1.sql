SELECT
     [D].[I_INVOICE_NO] -- Invoice No
    ,[D].[INTERNAL_NO] -- Internal No.
    ,[D].[I_INVOICE_LNNO] -- Line no
    ,[D].[I_ITEMCODE] -- Part ID

    ,[MS].[I_DESC] -- Part Name
    ,[MS].[I_PKGCD] -- Packaging Type

    ,[D].[I_PALLET_QTY] -- Pallet
    ,[D].[I_QTY] -- Qty

    ,[D].[I_NET_WGT] -- Net Weight
    ,[D].[I_UNIT_PRICE] -- Unit Price
    ,[D].[I_AMOUNT] -- Total Price

    ,[H].[I_SHIP_ORDER_NO]
FROM [T_PR_INVOICE_D] [D]

INNER JOIN [T_PR_INVOICE_H] [H]
    ON [H].[I_INVOICE_NO] = [D].[I_INVOICE_NO]

LEFT JOIN [MS_PRFG] [MS]
    ON [MS].[I_ITEMCODE] = [D].[I_ITEMCODE]

WHERE [D].[INTERNAL_NO] = /**%INTERNAL_NO%**/''
