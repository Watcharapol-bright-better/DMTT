SELECT *
FROM (

    -- Level 1 : Header
    SELECT  
           1 AS [Lvl] 
          ,'' AS [CHK]
          ,[H].[I_SONO]             -- SO No.
          ,'' AS [INTERNAL_NO]
          ,NULL AS [I_LNNO]
          ,NULL AS [I_COMPCLS]          -- SO Status
          ,[H].[I_CUSTOMER_PO]      -- Customer PO No
          ,NULL AS [I_DLYDATE]          -- Delivery Date

          ,[H].[I_CSCODE]           -- Customer Code
          ,[MC].[I_NAME]            -- Customer Name
          ,[H].[I_SODATE]           -- SO Date 

          ,NULL AS [I_ITEMCODE]
          ,NULL AS [I_DESC]
          ,NULL AS [I_AMOUNT]       -- Amount
          ,NULL AS [I_UNTPRI]       -- Unit Price
          ,NULL AS [I_QTY]          -- SO Qty
          ,NULL AS [I_DLY_PLACE]    -- Delivery Place
          ,[H].[I_PIC] AS [I_PIC]   -- P.I.C

          ,NULL AS [I_DELIVERED]    -- Delivered
          ,NULL AS [I_SHIP_QTY]     -- Picked
          ,NULL AS [BALANCE]        -- Balance
          ,ISNULL( NULL , 0) AS [I_CONFIRM_STATUS]

          ,[H].[CREATED_DATE]
          ,[H].[CREATED_BY]
          ,[H].[CREATED_PRG_NM]
          ,[H].[UPDATED_DATE]
          ,[H].[UPDATED_BY]
          ,[H].[UPDATED_PRG_NM]
          ,[H].[MODIFY_COUNT]
    FROM [T_PR_SORD_H] [H]
        LEFT JOIN [MS_CS] AS [MC] 
            ON [MC].[I_CSCODE] = [H].[I_CSCODE]

    UNION ALL

    -- Level 2 : Detail
    SELECT  
           2 AS [Lvl]
          ,'' AS [CHK]
          ,[D].[I_SONO]
          ,[D].[INTERNAL_NO]
          ,[D].[I_LNNO]
          ,ISNULL([D].[I_COMPCLS],'') AS [I_COMPCLS]
          ,ISNULL([H].[I_CUSTOMER_PO],'') AS [I_CUSTOMER_PO]
          ,[D].[I_DLYDATE]

          ,ISNULL([H].[I_CSCODE],'') AS [I_CSCODE]
          ,ISNULL([MC].[I_NAME],'') AS [I_NAME]
          ,[H].[I_SODATE]
      
          ,[D].[I_ITEMCODE]
          ,[FG].[I_DESC]
          ,[D].[I_AMOUNT]
          ,[D].[I_UNTPRI]
          ,[D].[I_QTY]
          ,[D].[I_DLY_PLACE]
          ,ISNULL([H].[I_PIC],'') AS [I_PIC]

          ,ISNULL(SUM([SHIP_1].[I_SHIP_QTY]),0) AS [I_DELIVERED] -- Delivered (Confirmed)
          ,ISNULL(SUM([SHIP_2].[I_SHIP_QTY]),0) AS [I_SHIP_QTY]  -- Picked (Not Confirmed)

          ,CASE 
                WHEN ISNULL([D].[I_QTY],0)
                   - ISNULL(SUM([SHIP_1].[I_SHIP_QTY]),0)
                   - ISNULL(SUM([SHIP_2].[I_SHIP_QTY]),0) < 0
                THEN 0
                ELSE ISNULL([D].[I_QTY],0)
                   - ISNULL(SUM([SHIP_1].[I_SHIP_QTY]),0)
                   - ISNULL(SUM([SHIP_2].[I_SHIP_QTY]),0)
           END AS [BALANCE]
          ,ISNULL([D].[I_CONFIRM_STATUS], 0) AS [I_CONFIRM_STATUS]
          ,[D].[CREATED_DATE]
          ,[D].[CREATED_BY]
          ,[D].[CREATED_PRG_NM]
          ,[D].[UPDATED_DATE]
          ,[D].[UPDATED_BY]
          ,[D].[UPDATED_PRG_NM]
          ,[D].[MODIFY_COUNT]

    FROM [T_PR_SORD_D] [D]
    LEFT JOIN [T_PR_SORD_H] [H] 
        ON [H].[I_SONO] = [D].[I_SONO]

    LEFT JOIN [MS_CS] [MC] 
        ON [MC].[I_CSCODE] = [H].[I_CSCODE]

    LEFT JOIN [MS_PRFG] [FG] 
        ON [FG].[I_ITEMCODE] = [D].[I_ITEMCODE]

    -- JOIN สำหรับ Delivered (Status = Confirmed)
    LEFT JOIN (
        SELECT 
             [SHIPD].[I_SONO]
            ,[SHIPD].[I_ITEMCODE]
            ,[SHIPD].[I_SHIP_QTY]
            ,[SHIPH].[I_SHIP_CFM]
        FROM [T_PR_SHIP_INST_D] [SHIPD]
        LEFT JOIN [T_PR_SHIP_INST_H] [SHIPH]
            ON [SHIPH].[I_SHIP_INST] = [SHIPD].[I_SHIP_INST]
        WHERE [SHIPH].[I_SHIP_CFM] IN ('3') -- Confirmed
    ) [SHIP_1] 
        ON [SHIP_1].[I_SONO] = [D].[I_SONO]
        AND [SHIP_1].[I_ITEMCODE] = [D].[I_ITEMCODE]

    -- JOIN สำหรับ Picked (Status = Not Confirmed)
    LEFT JOIN (
        SELECT 
             [SHIPD].[I_SONO]
            ,[SHIPD].[I_ITEMCODE]
            ,[SHIPD].[I_SHIP_QTY]
            ,[SHIPH].[I_SHIP_CFM]
        FROM [T_PR_SHIP_INST_D] [SHIPD]
        LEFT JOIN [T_PR_SHIP_INST_H] [SHIPH]
            ON [SHIPH].[I_SHIP_INST] = [SHIPD].[I_SHIP_INST]
        WHERE [SHIPH].[I_SHIP_CFM] IN ('0', '1', '2') -- Not Confirmed
    ) [SHIP_2]
        ON [SHIP_2].[I_SONO] = [D].[I_SONO]
        AND [SHIP_2].[I_ITEMCODE] = [D].[I_ITEMCODE]

    GROUP BY 
         [D].[I_SONO], [D].[INTERNAL_NO], [D].[I_LNNO], [D].[I_COMPCLS]
        ,[H].[I_CUSTOMER_PO], [D].[I_DLYDATE], [H].[I_CSCODE], [MC].[I_NAME]
        ,[H].[I_SODATE], [D].[I_ITEMCODE], [FG].[I_DESC], [D].[I_AMOUNT]
        ,[D].[I_UNTPRI], [D].[I_QTY], [D].[I_DLY_PLACE], [H].[I_PIC]
        ,[D].[I_CONFIRM_STATUS]
        ,[D].[CREATED_DATE], [D].[CREATED_BY], [D].[CREATED_PRG_NM]
        ,[D].[UPDATED_DATE], [D].[UPDATED_BY], [D].[UPDATED_PRG_NM]
        ,[D].[MODIFY_COUNT]

) AS A

-- WHERE I_SONO = 'SOP26010053'
-- ORDER BY [I_SONO], [Lvl], [I_LNNO]