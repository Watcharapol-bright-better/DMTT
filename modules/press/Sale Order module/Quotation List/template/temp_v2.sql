SELECT
    --ROW_NUMBER() OVER (PARTITION BY [QT].[I_QT_NO] ORDER BY (SELECT NULL)) AS [ROW_NO],
    [QT].[I_QT_NO]     AS [QUOTATION_NO],       -- Quotation No.
    [QT].[I_QT_MTH]    AS [QUOTATION_MONTH],    -- Quotation Month
    [QT].[I_PO_MONTH]  AS [CUSTOMER_PO_MONTH],  -- Customer PO Month
    [QT].[I_EXG_MONTH] AS [DELIVERY_MONTH],     -- Delivery Month
    --[QT].[I_CSCODE]    AS [CUSTOMER_CODE],      -- Customer Code
    --[MC].[I_NAME]      AS [CUSTOMER_NAME],      -- Customer Name
    [QT].[I_REM1]      AS [APPROVAL_STATUS],    -- Approval Status
    IIF(
            [QT].[I_REM1] = '1', -- 1: Approved
            [QT].[UPDATED_BY],
            NULL
    )                  AS [APPROVED_BY],        -- Approved By
    [QT].[I_ITEMCODE]  AS [PART_NO],            -- Part NO
    [MP].[I_DESC]      AS [PART_NAME],          -- Part Name
    [QT].[I_TYPE]      AS [TYPE],               -- Type

    [QT].[I_COMMODITY] AS [MATRTIAL_CODE],      -- Material Code <Material size 1>
    [QT].[I_PLATING]   AS [PLATING],            -- Plating <Material size 2>

    [QT].[I_THICK]     AS [THICKNESS_MM],       -- Thickness(mm) <Material size 3>
    [QT].[I_WIDTH]     AS [WIDTH_MM],           -- Width(mm) <Material size 4>

    [QT].[I_PROD_WGT]  AS [FG_UNIT_WEIGHT_PCS], -- FG Unit Weight/Pcs
    [QT].[I_CURRENCY]  AS [CURRENCY],           -- Currency
    [QT].[I_EXG_RATE]  AS [EXCHANGE_RATE],      -- Exchange Rate
    [QT].[I_RM_AMT]    AS [MATERIAL_AMOUNT],    -- Material amount
    [QT].[I_LOSS_AMT]  AS [SCRAP_AMOUNT],       -- Scrap amount
    [QT].[I_PITCH]     AS [PITCH],              -- Pitch

    NULL               AS [MATRTIAL_COST],      -- Material cost
    NULL               AS [SCRAP_COST]          -- Scrap cost


FROM [T_PR_QT] AS [QT]
         LEFT JOIN [MS_CS] AS [MC] ON [MC].[I_CSCODE] = [QT].[I_CSCODE]
         LEFT JOIN [MS_PRFG] AS [MP] ON [MP].[I_ITEMCODE] = [QT].[I_ITEMCODE]

WHERE [QT].[I_QT_NO] = 'Q251101'




