SELECT *
FROM (

    -- Level 1 : Header
    SELECT
           1 AS [Lvl]
          ,'' AS [CHK]
          ,[H].[I_SONO]             -- SO No.
          ,'' AS [INTERNAL_NO]
          ,NULL AS [I_LNNO]
          ,NULL AS [I_COMPCLS]      -- SO Status
          ,[H].[I_CUSTOMER_PO]      -- Customer PO No
          ,NULL AS [I_DLYDATE]      -- Delivery Date

          ,[H].[I_CSCODE]           -- Customer Code
          ,[MC].[I_NAME]            -- Customer Name
          ,[H].[I_SODATE]           -- SO Date

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
          ,ISNULL([H].[I_SODATE],GETDATE()) AS [I_SODATE]

          ,[D].[I_AMOUNT]
          ,[D].[I_UNTPRI]
          ,[D].[I_QTY]
          ,[D].[I_DLY_PLACE]
          ,ISNULL([H].[I_PIC],'') AS [I_PIC]

          ,ISNULL(NULL,0) AS [I_DELIVERED] -- Delivered
          ,ISNULL([D].[I_QTY],0)  AS [I_SHIP_QTY] -- Picked

          ,CASE
                WHEN ISNULL([D].[I_QTY],0)
                   - ISNULL(NULL,0)
                   - ISNULL([D].[I_QTY],0) < 0
                THEN 0
                ELSE ISNULL([D].[I_QTY],0)
                   - ISNULL(NULL,0)
                   - ISNULL([D].[I_QTY],0)
           END AS [BALANCE]
          ,ISNULL( [D].[I_CONFIRM_STATUS] , 0) AS [I_CONFIRM_STATUS]
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

        LEFT JOIN (
            SELECT
                 [SHIP_D].[I_SHIP_INST]
                ,[SHIP_D].[I_SONO]
                ,[SHIP_D].[I_ITEMCODE]
                ,[SHIP_H].[I_SHIP_CFM] -- Shipment Status | '0': Pending, '1': Picking, '2': Completed, '3': Confirmed
            FROM [T_PR_SHIP_INST_D] [SHIP_D]
                LEFT JOIN [T_PR_SHIP_INST_H] [SHIP_H]
                    ON [SHIP_H].[I_SHIP_INST] = [SHIP_D].[I_SHIP_INST]

    ) [SHIP_INST]
        ON [SHIP_INST].[I_SONO] = [D].[I_SONO]
        AND [SHIP_INST].[I_ITEMCODE] = [D].[I_ITEMCODE]
) AS A

ORDER BY [I_SONO] ASC, [Lvl] ASC, [INTERNAL_NO] ASC, [CREATED_DATE] DESC
