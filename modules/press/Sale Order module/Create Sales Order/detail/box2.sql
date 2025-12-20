SELECT 
     [SD].[I_SONO]   -- SO No.
    ,[SD].[I_LNNO]
    ,[SD].[I_ITEMCODE]           -- Part NO
    ,[MP].[I_DESC]               -- Part Name
    ,[SD].[I_UNTPRI]      -- Unit Price
    ,1 AS [I_QTY]             -- Order QTY (pcs)
    ,[SD].[I_AMOUNT]          -- Amount
    ,[SD].[I_DLY_PLACE]           -- Delivery Place
    ,[SD].[DETAIL_TYPE] -- Content Type
    ,[SD].[INTERNAL_NO]

    ,[SD].[CREATED_DATE]
    ,[SD].[CREATED_BY]
    ,[SD].[CREATED_PRG_NM]
    ,[SD].[UPDATED_DATE]
    ,[SD].[UPDATED_BY]
    ,[SD].[UPDATED_PRG_NM]
    ,[SD].[MODIFY_COUNT]
FROM [T_PR_SORD] AS [SD] 
    INNER JOIN [MS_PRFG] [MP] 
        ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE] 

WHERE [SD].[I_SONO] = /**%I_SONO%**/'' AND [SD].[DETAIL_TYPE] = '1'