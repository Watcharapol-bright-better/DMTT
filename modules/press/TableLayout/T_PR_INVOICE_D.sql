CREATE TABLE [dbo].[T_PR_INVOICE_D]
(
    [I_INVOICE_NO]    NVARCHAR(20)  NOT NULL,   -- Invoice No
    [INTERNAL_NO]     NVARCHAR(20)  NOT NULL,   -- Internal No

    [I_INVOICE_LNNO]  NUMERIC(3, 0)  NULL,      -- Invoice Line No
    [I_SONO]          NVARCHAR(25)   NULL,      -- Sale Order No
    [I_CUSTOMER_PO]   NVARCHAR(25)   NULL,      -- Customer PO
    [I_ITEMCODE]      NVARCHAR(25)   NULL,      -- Item Code
    [I_COMMON_NAME]   NVARCHAR(60)   NULL,      -- Common Name for Internal
    [I_COMMON_INV]    NVARCHAR(60)   NULL,      -- Common Name for Invoice
    [I_INV_DESC]      NVARCHAR(60)   NULL,      -- Description for Invoice
    [I_SIZE]          NVARCHAR(60)   NULL,      -- Size
    [I_TRADE_FLG]     NVARCHAR(1)    NULL,      -- Trading Flag

    [I_QTY]           NUMERIC(8, 0)  NULL,      -- Quantity
    [I_NET_WGT]       NUMERIC(14, 3) NULL,      -- Net Weight
    [I_UNIT_PRICE]    NUMERIC(14, 3) NULL,      -- Unit Price
    [I_AMOUNT]        NUMERIC(14, 3) NULL,      -- Amount
    [I_CURRENCY]      NVARCHAR(5)    NULL,      -- Currency

    [CREATED_DATE]    DATETIME       NULL,
    [CREATED_BY]      NVARCHAR(10)   NULL,
    [CREATED_PRG_NM]  NVARCHAR(50)   NULL,
    [UPDATED_DATE]    DATETIME       NULL,
    [UPDATED_BY]      NVARCHAR(10)   NULL,
    [UPDATED_PRG_NM]  NVARCHAR(50)   NULL,
    [MODIFY_COUNT]    NUMERIC(10, 0) NULL,

    CONSTRAINT [PK_T_PR_INVOICE_D] PRIMARY KEY CLUSTERED
    (
        [I_INVOICE_NO] ASC,
        [INTERNAL_NO]  ASC
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
