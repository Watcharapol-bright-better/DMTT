
-- SELECT * FROM [MS_PRFG]

--- //////////////

SELECT *
FROM (
    SELECT
         NULL AS [I_SHIP_LNNO]
        ,NULL AS [I_SHIP_INST]
        ,NULL AS [INTERNAL_NO]
        ,[SD].[I_DLYDATE]
        ,[SD].[I_SONO]
        ,[SD].[I_ITEMCODE]
        ,[MP].[I_DESC]

        --,[STK].[STK_BALANCE_QTY] -- in ลบ out (QTY)
        --,[MP].[I_PCS_BOX]
        --,[SD].[I_QTY]
        --,[MP].[I_BOX_PALLET]

        ,([MP].[I_PCS_BOX] / [MP].[I_BOX_PALLET]) AS [I_PALLET_QTY]
        ,ISNULL([STK].[STK_BALANCE_QTY], 
                        [SD].[I_QTY] - ISNULL([SHIPD].[I_SHIP_QTY], 0)
                ) AS [I_BALANCE_QTY] -- I_BALANCE_QTY
        ,ISNULL([SD].[I_QTY], [STK].[STK_BALANCE_QTY]) AS [I_SHIP_QTY]
        ,[STK].[I_BOX_QTY]
        ,[STK].[MIN_LOTNO] AS [I_LOTNO_FR]
        ,[STK].[MAX_LOTNO] AS [I_LOTNO_TO]

        ,[WO].[I_WODATE]
        ,'0' AS [I_SHP_PCK_STATUS]
        ,'0' AS [I_QA_STATUS]
        ,NULL AS [CREATED_DATE]
        ,NULL AS [CREATED_BY]
        ,NULL AS [CREATED_PRG_NM]
        ,NULL AS [UPDATED_DATE]
        ,NULL AS [UPDATED_BY]
        ,NULL AS [UPDATED_PRG_NM]
        ,NULL AS [MODIFY_COUNT]
    FROM [T_PR_SORD_D] AS [SD]

        INNER JOIN [MS_PRFG] AS [MP]
            ON [MP].[I_ITEMCODE] = [SD].[I_ITEMCODE]

        LEFT JOIN [T_PR_WOH] AS [WO]
            ON [WO].[I_SONO] = [SD].[I_SONO]

        LEFT JOIN [T_PR_SHIP_INST_D] [SHIPD]
            ON [SHIPD].[I_ITEMCODE] = [SD].[I_ITEMCODE]

        LEFT JOIN (
            SELECT
                 [I_ITEMCODE]
                ,MIN([I_LOTNO]) AS [MIN_LOTNO]
                ,MAX([I_LOTNO]) AS [MAX_LOTNO]
                ,COUNT([I_LOTNO]) AS [I_BOX_QTY]
                ,SUM([I_INQTY]) - SUM([I_OUTQTY]) AS [STK_BALANCE_QTY] -- QTY
            FROM [T_PR_STOCK]
            WHERE [I_ASSET] = '01'  -- 01: FG
                AND [I_STATUS] = '11' -- 11: GOOD
            GROUP BY [I_ITEMCODE]
        ) AS [STK]
            ON [STK].[I_ITEMCODE] = [SD].[I_ITEMCODE]

    WHERE [SD].[I_DLYDATE] = '2026-01-29'
) AS [MAIN]
WHERE [I_BALANCE_QTY] > 0

