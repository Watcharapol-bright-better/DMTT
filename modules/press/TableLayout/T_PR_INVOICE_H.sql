CREATE TABLE [dbo].[T_PR_INVOICE_H]
(
    [I_INVOICE_NO]     NVARCHAR(20)  NOT NULL,   -- Invoice No

    [I_INVOICE_DATE]   DATETIME      NULL,       -- Invoice Date
    [I_SHIP_ORDER_NO]  NVARCHAR(20)  NULL,       -- Ship Order No
    [I_SHIP_ORDER_DATE] DATETIME     NULL,       -- Ship Order Date
    [I_DO_NO]          NVARCHAR(20)  NULL,       -- DO No
    [I_DO_DATE]        DATETIME      NULL,       -- DO Date
    [I_TYPE]           NVARCHAR(1)    NULL,

    [I_CSCODE]         NVARCHAR(10)  NULL,       -- Customer
    [I_BILL_TO]        NVARCHAR(10)  NULL,       -- Bill To
    [I_SHIP_TO]        NVARCHAR(10)  NULL,       -- Ship To
    [I_INCO_TERM]      NVARCHAR(15)  NULL,       -- Inco Term
    [I_TERM]           NVARCHAR(15)  NULL,       -- Payment Term
    [I_ORG_COUNTRY]    NVARCHAR(15)  NULL,       -- Country of Origin
    [I_DEST_COUNTRY]   NVARCHAR(15)  NULL,       -- Country Destination
    [I_SHUTTER_NO]     NVARCHAR(15)  NULL,       -- Shutter No
    [I_DLY_DATE]       DATETIME      NULL,       -- Delivery Date
    [I_ATTN]           NVARCHAR(50)  NULL,
    [I_CORRESP_CODE]   NVARCHAR(50)  NULL,

    [I_CONT_SIZE20]    NVARCHAR(1)   NULL,       -- Container Size 20
    [I_CONT_SIZE40]    NVARCHAR(1)   NULL,       -- Container Size 40
    [I_WL_4]           NVARCHAR(1)   NULL,       -- Truck 4 WL
    [I_WL_6]           NVARCHAR(1)   NULL,       -- Truck 6 WL
    [I_WL_10]          NVARCHAR(1)   NULL,       -- Truck 10 WL

    [I_TOTAL_KGS]      NUMERIC(14,3) NULL,       -- Total KGS
    [I_VAT_AMT]        NUMERIC(14,3) NULL,       -- VAT Amount
    [I_TOTAL_AMT]      NUMERIC(14,3) NULL,       -- Total Amount
    [I_TRANSPORT]      NUMERIC(14,3) NULL,       -- Transport
    [I_CIF]            NUMERIC(14,3) NULL,       -- CIF Price
    [I_TOTAL_CT]       NUMERIC(14,3) NULL,       -- Total Cage
    [I_NET_WGT]        NUMERIC(14,3) NULL,       -- Net Weight
    [I_GROSS_WGT]      NUMERIC(14,3) NULL,       -- Gross Weight

    [I_REMARK]         NVARCHAR(50)  NULL,       -- Remark
    [I_SHIP_CFM]       NVARCHAR(30)  NULL,       -- Shipment Confirm Name
    [I_APPR_STATUS]    NVARCHAR(1)   NULL,       -- Approve Status
    [I_APPR_NAME]      NVARCHAR(30)  NULL,       -- Approved Name

    [CREATED_DATE]     DATETIME      NULL,
    [CREATED_BY]       NVARCHAR(10)  NULL,
    [CREATED_PRG_NM]   NVARCHAR(50)  NULL,
    [UPDATED_DATE]     DATETIME      NULL,
    [UPDATED_BY]       NVARCHAR(10)  NULL,
    [UPDATED_PRG_NM]   NVARCHAR(50)  NULL,
    [MODIFY_COUNT]     NUMERIC(10,0) NULL,

    CONSTRAINT [PK_T_PR_INVOICE_H] PRIMARY KEY CLUSTERED
    (
        [I_INVOICE_NO] ASC
    )
    WITH (
        PAD_INDEX = OFF,
        STATISTICS_NORECOMPUTE = OFF,
        IGNORE_DUP_KEY = OFF,
        ALLOW_ROW_LOCKS = ON,
        ALLOW_PAGE_LOCKS = ON,
        OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
) ON [PRIMARY]
GO
