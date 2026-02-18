SELECT
    ROW_NUMBER() OVER (PARTITION BY [MP].[I_TRADE_TYPE] ORDER BY (SELECT NULL)) AS [ROW_NO],

    [MP].[I_TRADE_TYPE] AS [TABLE_KIND],
    [MP].[I_ITEM_GROUP]             AS [FG_PRESS_ITEM_GROUP], -- FG Press Master Item Group

    [QD].[I_QT_NO]                  AS [QUOTATION_NO],        -- Quotation No.
    [QH].[I_QT_MTH]                 AS [QUOTATION_MONTH],     -- Quotation Month
    [QH].[I_PO_MONTH]               AS [CUSTOMER_PO_MONTH],   -- Customer PO Month
    [QH].[I_EXG_MONTH]              AS [DELIVERY_MONTH],      -- Delivery Month
    -- [QD].[I_CSCODE]  AS [CUSTOMER_CODE],            -- Customer Code
    -- [MC].[I_NAME]    AS [CUSTOMER_NAME],            -- Customer Name


    [QD].[I_REM1]                   AS [APPROVAL_STATUS],     -- Approval Status

    IIF(
            [QD].[I_REM1] = '1',
            [QD].[UPDATED_BY],
            NULL
    )                               AS [APPROVED_BY],         -- Approved By

    [QD].[I_ITEMCODE]               AS [PART_NO],             -- Part NO
    [MP].[I_DESC]                   AS [PART_NAME],           -- Part Name
    [QH].[I_TYPE]                   AS [TYPE],                -- Type

    CONCAT(
        [QD].[I_COMMODITY], 
        ' ', 
        [QD].[I_PLATING]
    )                               AS [MATRTIAL],            -- Material size

    [QD].[I_THICK]                  AS [THICKNESS_MM],        -- Thickness(mm) <Material size 3>
    [QD].[I_WIDTH]                  AS [WIDTH_MM],            -- Width(mm) <Material size 4>

    [QD].[I_PROD_WGT]               AS [FG_UNIT_WEIGHT_PCS],  -- FG Unit Weight/Pcs
    [QH].[I_CURRENCY]               AS [CURRENCY],            -- Currency
    [QH].[I_EXG_RATE]               AS [EXCHANGE_RATE],       -- Exchange Rate
    [QD].[I_RM_AMT]                 AS [MATERIAL_AMOUNT],     -- Material amount
    [QD].[I_LOSS_AMT]               AS [SCRAP_AMOUNT],        -- Scrap amount
    [QD].[I_PITCH]                  AS [PITCH],               -- Pitch

    [QD].[I_RM_WGT]                 AS [MATERIAL_WEIGHT],     -- Material weight
    [QD].[I_LOSS_WGT]               AS [SCRAP_WEIGHT],        -- Scrap weight

    [QD].[I_FEE_PROCESS]            AS [PRESS_PROCESSING],    -- Press Processing
    [QD].[I_FEE_CUSTOM]             AS [CUSTOMER_CLEARANCE],  -- Customer Clearance
    [QD].[I_FEE_PACK]               AS [PACKAGE_MATERIAL],    -- Package Material
    [QD].[I_FEE_EXPENSE]            AS [MAINTENANCE_EXPENSE], -- Maintenance Expense
    ISNULL([MP].[I_FEE_DLY], 1.501) AS [DELIVERY_FEE],        -- Delivery Fee
    [QD].[I_FEE_MGM]                AS [MANAGEMENT_EXPENSE],  -- Management Expenses

    422.49                          AS [MATRTIAL_COST],       -- Material cost
    -321.84                         AS [SCRAP_COST],          -- Scrap cost
    [QD].[I_SELLING_PRICE] AS [TOTAL]

FROM [T_PR_QT_D] AS [QD]

INNER JOIN [T_PR_QT_H] AS [QH]
    ON [QH].[I_QT_NO] = [QD].[I_QT_NO]

LEFT JOIN [MS_CS] AS [MC]
    ON [MC].[I_CSCODE] = [QH].[I_CSCODE]

LEFT JOIN [MS_PRFG] AS [MP]
    ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE]

WHERE [QD].[I_QT_NO] = /**%QUOTATION_NO%**/''