SELECT *
FROM (

    -- Level 1 : Header
    SELECT  
           1 AS [Lvl]                -- Level = Header
          ,'' AS [CHK]
          ,[SD].[I_SONO]             -- SO No.
          ,[SD].[I_LNNO]
          ,NULL AS [I_COMPCLS]       -- SO Status
          ,NULL AS [I_CUSTOMER_PO]   -- Customer PO No
          ,[SD].[I_DLYDATE]          -- Delivery Date

          ,NULL AS [I_CSCODE]        -- Customer Code
          ,NULL AS [I_NAME]          -- Customer Name
          ,NULL AS [I_SODATE]        -- SO Date 

          ,NULL AS [I_QTY]           -- SO Qty
          ,NULL AS [I_DLY_PLACE]     -- Delivery Place
          ,NULL AS [I_ENDUSER]       -- P.I.C

          ,NULL AS [I_SHIP_CFM]      -- Delivered
          ,NULL AS [I_SHP_PCK]       -- Picked
          ,NULL AS [BALANCE]         -- Balance
          ,NULL AS [I_CONFIRM_STATUS]

          ,[SD].[CREATED_DATE]
          ,[SD].[CREATED_BY]
          ,[SD].[CREATED_PRG_NM]
          ,[SD].[UPDATED_DATE]
          ,[SD].[UPDATED_BY]
          ,[SD].[UPDATED_PRG_NM]
          ,[SD].[MODIFY_COUNT]
    FROM [T_PR_SORD] [SD]
        INNER JOIN [MS_CS] AS [MC] 
            ON [MC].[I_CSCODE] = [SD].[I_CSCODE]
    WHERE [SD].[I_LNNO] = 1 

    UNION ALL

    -- Level 2 : Detail
    SELECT  
           2 AS [Lvl]                -- Level = Detail
          ,'' AS [CHK]
          ,[SD].[I_SONO]             -- SO No.
          ,[SD].[I_LNNO]
          ,[SD].[I_COMPCLS]          -- SO Status
          ,[SD].[I_CUSTOMER_PO]      -- Customer PO No
          ,[SD].[I_DLYDATE]          -- Delivery Date

          ,[SD].[I_CSCODE]           -- Customer Code
          ,[MC].[I_NAME]             -- Customer Name
          ,[SD].[I_SODATE]            -- SO Date

          ,[SD].[I_QTY]              -- SO Qty 
          ,[SD].[I_DLY_PLACE]        -- Delivery Place
          ,[SD].[I_ENDUSER]          -- P.I.C

          ,ISNULL([SI].[I_SHIP_CFM],0) AS [I_SHIP_CFM] -- Delivery Qty
          ,ISNULL([SI].[I_SHP_PCK],0)  AS [I_SHP_PCK]  -- Picked Qty

          -- BALANCE = SO Qty - Delivered - Picked
          ,CASE 
                WHEN ISNULL([SD].[I_QTY],0)
                   - ISNULL([SI].[I_SHIP_CFM],0)
                   - ISNULL([SI].[I_SHP_PCK],0) < 0
                THEN 0
                ELSE ISNULL([SD].[I_QTY],0)
                   - ISNULL([SI].[I_SHIP_CFM],0)
                   - ISNULL([SI].[I_SHP_PCK],0)
           END AS [BALANCE]
          ,[SD].[I_CONFIRM_STATUS]

          ,[SD].[CREATED_DATE]
          ,[SD].[CREATED_BY]
          ,[SD].[CREATED_PRG_NM]
          ,[SD].[UPDATED_DATE]
          ,[SD].[UPDATED_BY]
          ,[SD].[UPDATED_PRG_NM]
          ,[SD].[MODIFY_COUNT]

    FROM [T_PR_SORD] [SD]
        LEFT JOIN [MS_CS] AS [MC] 
            ON [MC].[I_CSCODE] = [SD].[I_CSCODE]
        LEFT JOIN [T_PR_SHIP_INST] AS [SI]
            ON [SI].[I_SONO] = [SD].[I_SONO]

    WHERE [SD].[I_LNNO] <> 1  
) AS A
