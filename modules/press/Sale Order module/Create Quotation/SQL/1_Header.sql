-- Header
SELECT
      [QH].[I_QT_NO]
     ,[QH].[I_QT_MTH]
     ,[QH].[I_METAL_PRICE]
     ,[QH].[I_CSCODE]
     ,[MC].[I_NAME]
     ,[QH].[I_PO_MONTH]
     ,[QH].[I_EXG_MONTH]
     ,''                                                    AS [I_EXG_RATE_TYPE]

     , IIF([QH].[I_CURRENCY] = 'THB', 1, [QH].[I_EXG_RATE]) AS [I_EXG_RATE]

     ,[QH].[I_CURRENCY]
     ,[QH].[I_PIC]
     ,[QH].[I_TYPE]
     ,''                                                    AS [B]

     ,[QH].[I_QT_STATUS]
     ,[QH].[CREATED_DATE]
     ,[QH].[CREATED_BY]
     ,[QH].[CREATED_PRG_NM]
     ,[QH].[UPDATED_DATE]
     ,[QH].[UPDATED_BY]
     ,[QH].[UPDATED_PRG_NM]
     ,[QH].[MODIFY_COUNT]

FROM [T_PR_QT_H] AS [QH]

         INNER JOIN [MS_CS] AS [MC]
                    ON [MC].[I_CSCODE] = [QH].[I_CSCODE]

         INNER JOIN [MS_EXG] AS [MX]
                    ON [MX].[I_CURRENCY] = [MC].[I_CURRENCY]

         LEFT JOIN [T_PR_QT_D] AS [QD]
                   ON [QD].[I_QT_NO] = [QH].[I_QT_NO]

         LEFT JOIN [MS_PRFG] AS [MP]
                   ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE]

WHERE [QH].[I_QT_NO] = /**%I_QT_NO%**/''