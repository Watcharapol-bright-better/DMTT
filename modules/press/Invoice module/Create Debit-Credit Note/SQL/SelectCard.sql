SELECT 
     [I_TYPE] 
    ,[I_SHIP_ORDER_NO] 
    ,[I_INVOICE_NO] 
    ,[I_SHIP_ORDER_DATE] 
    ,[I_INVOICE_DATE] 
    ,[I_CSCODE] 
    ,[I_REMARK] 
    ,[I_SHIP_TO] 
FROM (
    
    SELECT
         '' AS [I_TYPE],
         [H].[I_SHIP_INST]        AS [I_SHIP_ORDER_NO],
         ''                       AS [I_INVOICE_NO],
         [H].[I_SHIP_INST_DATE]  AS [I_SHIP_ORDER_DATE],
         GETDATE()               AS [I_INVOICE_DATE],
         [H].[I_CSCODE],
         [CS].[I_REMARK],
         [H].[I_SHIPTO]          AS [I_SHIP_TO]
    FROM [T_PR_SHIP_INST_H] AS [H]
    LEFT JOIN [MS_CS] AS [CS]
        ON [CS].[I_CSCODE] = [H].[I_CSCODE]
    WHERE [H].[I_SHIP_INST] = /**%I_SHIP_ORDER_NO%**/''
      AND ISNULL( /**%I_SHIP_ORDER_NO%**/'' , '') <> ''
      AND ISNULL( /**%I_INVOICE_NO%**/'' , '') = ''

    UNION ALL

    SELECT
         [I_TYPE],
         [I_SHIP_ORDER_NO],
         [I_INVOICE_NO],
         [I_SHIP_ORDER_DATE],
         [I_INVOICE_DATE],
         [I_CSCODE],
         [I_REMARK],
         [I_SHIP_TO]
    FROM [T_PR_INVOICE_H]
    WHERE [I_INVOICE_NO] = /**%I_INVOICE_NO%**/''
      AND ISNULL( /**%I_INVOICE_NO%**/'' , '') <> ''

) AS [X]
