DROP TABLE [dbo].[T_PR_SORD_H];

CREATE TABLE [dbo].[T_PR_SORD_H](
    [I_SONO]            NVARCHAR(20) NOT NULL,   -- SO No.
    [I_QT_NO]           NVARCHAR(20) NULL,       -- Quotation No.
    [I_SODATE]          DATETIME NULL,           -- SO Date
    [I_COMPCLS]         NVARCHAR(2) NULL,        -- SO Status
    [I_CUSTOMER_PO]     NVARCHAR(25) NULL,       -- Customer PO No
    [I_CSCODE]          NVARCHAR(10) NULL,       -- Customer Code
    [I_CURRENCY]        NVARCHAR(5) NULL,        -- Currency
    [I_SHIPTO]          NVARCHAR(250) NULL,      -- Ship To
    [I_BILLTO]          NVARCHAR(250) NULL,      -- Bill To
    [I_PIC]             NVARCHAR(50) NULL,        -- P.I.C
    [I_ENDUSER]         NVARCHAR(10) NULL,
    [I_REM1]            NVARCHAR(500) NULL,       -- Remark
    [I_DLYDATE]         DATETIME NULL,           -- Delivery Date

    [CREATED_DATE]      DATETIME NULL,
    [CREATED_BY]        NVARCHAR(10) NULL,
    [CREATED_PRG_NM]    NVARCHAR(50) NULL,
    [UPDATED_DATE]      DATETIME NULL,
    [UPDATED_BY]        NVARCHAR(10) NULL,
    [UPDATED_PRG_NM]    NVARCHAR(50) NULL,
    [MODIFY_COUNT]      NUMERIC(10,0) NULL,

 CONSTRAINT [PK_T_PR_SORD_H] PRIMARY KEY CLUSTERED 
(
    [I_SONO] ASC
)WITH (
    PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON,
    OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
) ON [PRIMARY]
) ON [PRIMARY]
GO
