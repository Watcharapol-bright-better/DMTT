CREATE TABLE [dbo].[MS_EXG] (
    [I_CURRENCY]       NVARCHAR(5)    NOT NULL,   -- Currency Code (PK)
    [I_EXG_RATE_TYPE]  NVARCHAR(1)    NULL,
    [I_EXG_RATE]       NUMERIC(14,8)  NULL,

    [I_VALIDFR]        DATETIME       NOT NULL,

    [I_RATE_TTS]       NUMERIC(14,8)  NULL,  -- Rate Sale (TTS)
    [I_RATE_TTB]       NUMERIC(14,8)  NULL,  -- Rate Buy  (TTB)
    [I_RATE_TTM]       NUMERIC(14,8)  NULL,  -- Rate Avg  (TTM)
    
    [I_RATE_TYPE]      NVARCHAR(2)    NULL,
    [I_RATE]           NUMERIC(14, 8) NULL,

    [CREATED_DATE]     DATETIME       NULL,
    [CREATED_BY]       NVARCHAR(10)   NULL,
    [CREATED_PRG_NM]   NVARCHAR(50)   NULL,
    [UPDATED_DATE]     DATETIME       NULL,
    [UPDATED_BY]       NVARCHAR(10)   NULL,
    [UPDATED_PRG_NM]   NVARCHAR(50)   NULL,
    [MODIFY_COUNT]     NUMERIC(10,0)  NULL,

    CONSTRAINT [PK_MS_EXG] PRIMARY KEY ([I_CURRENCY], [I_VALIDFR])
);
