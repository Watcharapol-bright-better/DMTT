SELECT  TOP 1
        [SD].[I_SONO] -- SO No.
       ,[SD].[I_QT_NO] -- Quotation No.
       ,[SD].[I_LNNO] -- Line No.
       ,[SD].[I_SODATE] -- SO Date
       ,[SD].[I_COMPCLS] -- SO Status
       ,[SD].[I_CUSTOMER_PO] -- Customer PO No
       ,[SD].[I_CSCODE] -- Customer Code
       ,[MC].[I_NAME]  --  Customer Name
       ,[SD].[I_CURRENCY] -- Currency
       ,[SD].[I_SHIPTO] -- Ship To
       ,[SD].[I_BILLTO] -- Bill To
       ,[SD].[I_ENDUSER] -- P.I.C
       ,[SD].[I_REM1] -- Attached Customer PO
       ,[SD].[I_DLYDATE]
       ,[SD].[DETAIL_TYPE]
       ,[SD].[INTERNAL_NO]

       ,[SD].[CREATED_DATE]
       ,[SD].[CREATED_BY]
       ,[SD].[CREATED_PRG_NM]
       ,[SD].[UPDATED_DATE]
       ,[SD].[UPDATED_BY]
       ,[SD].[UPDATED_PRG_NM]
       ,[SD].[MODIFY_COUNT]
FROM [T_PR_SORD] [SD]
    LEFT JOIN [T_PR_QT] [TQ] 
           ON [SD].[I_QT_NO] = [TQ].[I_QT_NO]
    LEFT JOIN [MS_CS] [MS] 
           ON [MS].[I_CSCODE] = [SD].[I_CSCODE]
    LEFT JOIN [MS_CS] [MC]
        ON [MC].[I_CSCODE] = [TQ].[I_CSCODE]

WHERE [SD].[I_SONO] = /**%I_SONO%**/'' AND  [SD].[DETAIL_TYPE] = '0'
