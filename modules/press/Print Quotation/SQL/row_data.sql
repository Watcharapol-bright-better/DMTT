SELECT
    ROW_NUMBER() OVER (PARTITION BY [QT].[I_QT_NO] ORDER BY (SELECT NULL)) AS [ROW_NO],

    [QT].[I_QT_NO]                  AS [QUOTATION_NO],        -- Quotation No.
    [QT].[I_QT_MTH]                 AS [QUOTATION_MONTH],     -- Quotation Month
    [QT].[I_PO_MONTH]               AS [CUSTOMER_PO_MONTH],   -- Customer PO Month
    [QT].[I_EXG_MONTH]              AS [DELIVERY_MONTH],      -- Delivery Month
    -- [QT].[I_CSCODE]  AS [CUSTOMER_CODE],            -- Customer Code
    -- [MC].[I_NAME]    AS [CUSTOMER_NAME],            -- Customer Name
    [MP].[I_TRADE_TYPE] AS [TABLE_KIND],

    [QT].[I_REM1]                   AS [APPROVAL_STATUS],     -- Approval Status

    IIF(
            [QT].[I_REM1] = '1',
            [QT].[UPDATED_BY],
            NULL
    )                               AS [APPROVED_BY],         -- Approved By

    [QT].[I_ITEMCODE]               AS [PART_NO],             -- Part NO
    [MP].[I_DESC]                   AS [PART_NAME],           -- Part Name
    [QT].[I_TYPE]                   AS [TYPE],                -- Type
    [MP].[I_ITEM_GROUP]             AS [FG_PRESS_ITEM_GROUP], -- FG Press Master Item Group

    CONCAT(
        [QT].[I_COMMODITY], 
        ' ', 
        [QT].[I_PLATING]
    )                               AS [MATRTIAL],            -- Material size

    [QT].[I_THICK]                  AS [THICKNESS_MM],        -- Thickness(mm) <Material size 3>
    [QT].[I_WIDTH]                  AS [WIDTH_MM],            -- Width(mm) <Material size 4>

    [QT].[I_PROD_WGT]               AS [FG_UNIT_WEIGHT_PCS],  -- FG Unit Weight/Pcs
    [QT].[I_CURRENCY]               AS [CURRENCY],            -- Currency
    [QT].[I_EXG_RATE]               AS [EXCHANGE_RATE],       -- Exchange Rate
    [QT].[I_RM_AMT]                 AS [MATERIAL_AMOUNT],     -- Material amount
    [QT].[I_LOSS_AMT]               AS [SCRAP_AMOUNT],        -- Scrap amount
    [QT].[I_PITCH]                  AS [PITCH],               -- Pitch

    [QT].[I_RM_WGT]                 AS [MATERIAL_WEIGHT],     -- Material weight
    [QT].[I_LOSS_WGT]               AS [SCRAP_WEIGHT],        -- Scrap weight

    [QT].[I_FEE_PROCESS]            AS [PRESS_PROCESSING],    -- Press Processing
    [QT].[I_FEE_CUSTOM]             AS [CUSTOMER_CLEARANCE],  -- Customer Clearance
    [QT].[I_FEE_PACK]               AS [PACKAGE_MATERIAL],    -- Package Material
    [QT].[I_FEE_EXPENSE]            AS [MAINTENANCE_EXPENSE], -- Maintenance Expense
    ISNULL([MP].[I_FEE_DLY], 1.501) AS [DELIVERY_FEE],        -- Delivery Fee
    [QT].[I_FEE_MGM]                AS [MANAGEMENT_EXPENSE],  -- Management Expenses

    422.49                          AS [MATRTIAL_COST],       -- Material cost
    -321.84                         AS [SCRAP_COST],          -- Scrap cost
    [QT].[I_SELLING_PRICE] AS [TOTAL]

FROM [T_PR_QT] AS [QT]
         LEFT JOIN [MS_CS] AS [MC] ON [MC].[I_CSCODE] = [QT].[I_CSCODE]
         LEFT JOIN [MS_PRFG] AS [MP] ON [MP].[I_ITEMCODE] = [QT].[I_ITEMCODE]


WHERE [QT].[I_QT_NO] = 'Q251101'
