
DROP TABLE [dbo].[T_PR_SORD_D];

CREATE TABLE [dbo].[T_PR_SORD_D](
    [I_SONO]            NVARCHAR(20) NOT NULL,   -- SO No.
    [INTERNAL_NO]       NVARCHAR(20) NOT NULL,   -- Internal No (Detail Key)
    [I_LNNO]            NUMERIC(3,0) NULL,        -- Line No
    [I_ITEMCODE]        NVARCHAR(25) NULL,        -- Part No
    [I_UNITPRICE]       NUMERIC(18,3) NULL,       -- Unit Price
    [I_QTY]             NUMERIC(14,6) NULL,       -- Order QTY
    [I_AMOUNT]          NUMERIC(18,3) NULL,       -- Amount
    [I_DLY_PLACE]       NVARCHAR(15) NULL,        -- Delivery Place
    [I_COMPCLS]         NVARCHAR(2) NULL,        -- SO Status
    [I_DLYDATE]         DATETIME NULL,           -- Delivery Date
    [I_CONFIRM_STATUS]  NVARCHAR(1) NULL,

    [CREATED_DATE]      DATETIME NULL,
    [CREATED_BY]        NVARCHAR(10) NULL,
    [CREATED_PRG_NM]    NVARCHAR(50) NULL,
    [UPDATED_DATE]      DATETIME NULL,
    [UPDATED_BY]        NVARCHAR(10) NULL,
    [UPDATED_PRG_NM]    NVARCHAR(50) NULL,
    [MODIFY_COUNT]      NUMERIC(10,0) NULL,

 CONSTRAINT [PK_T_PR_SORD_D] PRIMARY KEY CLUSTERED 
(
    [I_SONO] ASC,
    [INTERNAL_NO] ASC
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
