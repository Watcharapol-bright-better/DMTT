SELECT 
       [SDH].[I_SONO]         AS [I_SONO],
       [SDH].[I_QT_NO]        AS [I_QT_NO],
       [SDH].[I_SODATE]       AS [I_SODATE],
       '00'      AS [I_COMPCLS],
       [SDH].[I_CUSTOMER_PO]  AS [I_CUSTOMER_PO],
       [MC].[I_CSCODE]       AS [I_CSCODE],
       [MC].[I_NAME]          AS [I_NAME],      -- Customer Name
       [SDH].[I_CURRENCY]     AS [I_CURRENCY],
       [SDH].[I_SHIPTO]       AS [I_SHIPTO],
       [SDH].[I_BILLTO]       AS [I_BILLTO],
       [SDH].[I_PIC],
       [SDH].[I_REM1]         AS [I_REM1],
      SDH.[I_DLYDATE],
       NULL                   AS [I_ITEMCODE],
       NULL                   AS [I_DESC],

       [SDH].[CREATED_DATE],
       [SDH].[CREATED_BY],
       [SDH].[CREATED_PRG_NM],
       [SDH].[UPDATED_DATE],
       [SDH].[UPDATED_BY],
       [SDH].[UPDATED_PRG_NM],
       [SDH].[MODIFY_COUNT]
FROM [T_PR_SORD_H] AS [SDH]
LEFT JOIN [MS_CS] AS [MC]
       ON [MC].[I_NAME] = /**%I_NAME%**/''
WHERE [SDH].[I_SONO] = /**%I_SONO%**/'' 

