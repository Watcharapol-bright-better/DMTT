SELECT 
     [IH].[I_SHIP_ORDER_NO]           AS [I_SHIP_ORDER_NO]
    ,[IH].[I_INVOICE_NO]

    ,[H].[I_SHIP_INST_DATE]           AS [I_SHIP_ORDER_DATE]
    ,[IH].[I_INVOICE_DATE]

    ,[H].[I_CSCODE]
    ,[CS].[I_REMARK]                  AS [I_ATTN]
    ,[H].[I_SHIPTO]                   AS [I_SHIP_TO]

    ,[IH].[CREATED_DATE]
    ,[IH].[CREATED_BY]
    ,[IH].[CREATED_PRG_NM]
    ,[IH].[UPDATED_DATE]
    ,[IH].[UPDATED_BY]
    ,[IH].[UPDATED_PRG_NM]
    ,[IH].[MODIFY_COUNT]
FROM [T_PR_INVOICE_H] [IH]

LEFT JOIN [T_PR_SHIP_INST_H] [H]
    ON [H].[I_SHIP_INST] = [IH].[I_SHIP_ORDER_NO]

LEFT JOIN [MS_CS] [CS]
    ON [CS].[I_CSCODE] = [H].[I_CSCODE]

WHERE [IH].[I_INVOICE_NO] = /**%I_INVOICE_NO%**/''