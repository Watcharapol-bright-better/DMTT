    SELECT  
           [D].[I_SONO]
          ,[D].[INTERNAL_NO]
          ,[D].[I_LNNO]
          ,ISNULL([D].[I_COMPCLS],'') AS [I_COMPCLS]
          ,ISNULL([H].[I_CUSTOMER_PO],'') AS [I_CUSTOMER_PO]
          ,[D].[I_DLYDATE]
          ,ISNULL([H].[I_CSCODE],'') AS [I_CSCODE]
          ,ISNULL([MC].[I_NAME],'') AS [I_NAME]
          ,ISNULL([H].[I_SODATE],GETDATE()) AS [I_SODATE]
          ,[D].[I_ITEMCODE]
          ,[FG].[I_DESC]
          ,[D].[I_AMOUNT]
          ,[D].[I_UNTPRI]
          ,[D].[I_QTY]
          ,[D].[I_DLY_PLACE]
          ,ISNULL([H].[I_PIC],'') AS [I_PIC]
          ,ISNULL([SHIP_1].[I_SHIP_QTY], 0) AS [I_DELIVERED]
          ,ISNULL([SHIP_2].[I_SHIP_QTY], 0) AS [I_PICKED]
          ,IIF(
                ISNULL([D].[I_QTY], 0) - ISNULL([SHIP_1].[I_SHIP_QTY], 0) - ISNULL([SHIP_2].[I_SHIP_QTY], 0) < 0,
                0,
                ISNULL([D].[I_QTY], 0) - ISNULL([SHIP_1].[I_SHIP_QTY], 0) - ISNULL([SHIP_2].[I_SHIP_QTY], 0)
           ) AS [BALANCE]
          
          ,ISNULL([D].[I_CONFIRM_STATUS], 0) AS [I_CONFIRM_STATUS]
          ,[D].[CREATED_DATE]
          ,[D].[CREATED_BY]
          ,[D].[CREATED_PRG_NM]
          ,[D].[UPDATED_DATE]
          ,[D].[UPDATED_BY]
          ,[D].[UPDATED_PRG_NM]
          ,[D].[MODIFY_COUNT]

    FROM [T_PR_SORD_D] [D]
    LEFT JOIN [T_PR_SORD_H] [H] ON [H].[I_SONO] = [D].[I_SONO]
    LEFT JOIN [MS_CS] [MC] ON [MC].[I_CSCODE] = [H].[I_CSCODE]
    LEFT JOIN [MS_PRFG] [FG] ON [FG].[I_ITEMCODE] = [D].[I_ITEMCODE]
    
    LEFT JOIN (
        SELECT 
             [SHIPD].[I_SONO]
            ,[SHIPD].[I_ITEMCODE]
            ,SUM([SHIPD].[I_SHIP_QTY]) AS [I_SHIP_QTY]
        FROM [T_PR_SHIP_INST_D] [SHIPD]
        LEFT JOIN [T_PR_SHIP_INST_H] [SHIPH]
            ON [SHIPH].[I_SHIP_INST] = [SHIPD].[I_SHIP_INST]
        WHERE [SHIPH].[I_SHIP_CFM] IN ('3') 
        GROUP BY [SHIPD].[I_SONO], [SHIPD].[I_ITEMCODE]
    ) [SHIP_1] 
        ON [SHIP_1].[I_SONO] = [D].[I_SONO]
        AND [SHIP_1].[I_ITEMCODE] = [D].[I_ITEMCODE]

    LEFT JOIN (
        SELECT 
             [SHIPD].[I_SONO]
            ,[SHIPD].[I_ITEMCODE]
            ,SUM([SHIPD].[I_SHIP_QTY]) AS [I_SHIP_QTY]
        FROM [T_PR_SHIP_INST_D] [SHIPD]
        LEFT JOIN [T_PR_SHIP_INST_H] [SHIPH]
            ON [SHIPH].[I_SHIP_INST] = [SHIPD].[I_SHIP_INST]
        WHERE [SHIPH].[I_SHIP_CFM] IN ('0', '1', '2') 
        GROUP BY [SHIPD].[I_SONO], [SHIPD].[I_ITEMCODE]
    ) [SHIP_2]
        ON [SHIP_2].[I_SONO] = [D].[I_SONO]
        AND [SHIP_2].[I_ITEMCODE] = [D].[I_ITEMCODE]
    WHERE [D].[I_SONO] = 'SOP26020040' 
    AND [D].[INTERNAL_NO] = '20260220000003'