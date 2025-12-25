CREATE OR ALTER PROCEDURE [dbo].[SP_RUN_NUMBERING_V1]
    @CodeType NVARCHAR(100),
    @Format NVARCHAR(100),
    @GeneratedNo NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF OBJECT_ID('dbo.BB_NUMBERING_CONFIG', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.BB_NUMBERING_CONFIG (
            CODE_TYPE NVARCHAR(100) NOT NULL PRIMARY KEY,
            FORMAT NVARCHAR(100) NOT NULL,
            LAST_SEQ INT NOT NULL,
            LAST_BREAK_KEY NVARCHAR(100) NOT NULL
        );
    END

    DECLARE @now DATETIME = GETDATE();
    DECLARE @breakKey NVARCHAR(50) = '';
    DECLARE @seq INT = 0;
    DECLARE @digitLen INT = 0;
    DECLARE @formatId NVARCHAR(100);
    DECLARE @seqStr NVARCHAR(20);
    DECLARE @currBreakKey NVARCHAR(100) = '';
    DECLARE @breakPattern NVARCHAR(20) = '';

    /* ===============================
       Load config
    =============================== */
    SELECT
        @formatId = FORMAT,
        @seq = LAST_SEQ,
        @currBreakKey = LAST_BREAK_KEY
    FROM dbo.BB_NUMBERING_CONFIG
    WHERE CODE_TYPE = @CodeType;

    /* ===============================
       New CodeType
    =============================== */
    IF @formatId IS NULL
    BEGIN
        INSERT INTO dbo.BB_NUMBERING_CONFIG
        (CODE_TYPE, FORMAT, LAST_SEQ, LAST_BREAK_KEY)
        VALUES (@CodeType, @Format, 0, '');

        SET @formatId = @Format;
        SET @seq = 0;
        SET @currBreakKey = '';
    END
    ELSE
    BEGIN
        /* ===============================
           FORMAT CHANGED
        =============================== */
        IF @formatId <> @Format
        BEGIN
            UPDATE dbo.BB_NUMBERING_CONFIG
            SET FORMAT = @Format,
                LAST_SEQ = 0,
                LAST_BREAK_KEY = ''
            WHERE CODE_TYPE = @CodeType;

            SET @formatId = @Format;
            SET @seq = 0;
            SET @currBreakKey = '';
        END
    END

    /* ===============================
       digit length (x)
    =============================== */
    SET @digitLen = LEN(@formatId) - LEN(REPLACE(@formatId, 'x', ''));

    /* ===============================
       detect break pattern (UNCHANGED)
    =============================== */
    IF CHARINDEX(':hhmmss', @formatId) > 0 SET @breakPattern = ':hhmmss';
    ELSE IF CHARINDEX(':hhmm', @formatId) > 0 SET @breakPattern = ':hhmm';
    ELSE IF CHARINDEX(':hh', @formatId) > 0 SET @breakPattern = ':hh';
    ELSE IF CHARINDEX(':mm', @formatId) > 0 SET @breakPattern = ':mm';
    ELSE IF CHARINDEX(':ss', @formatId) > 0 SET @breakPattern = ':ss';
    ELSE IF CHARINDEX('yyyymmdd', @formatId) > 0 SET @breakPattern = 'yyyymmdd';
    ELSE IF CHARINDEX('yyyymm', @formatId) > 0 SET @breakPattern = 'yyyymm';
    ELSE IF CHARINDEX('yymmdd', @formatId) > 0 SET @breakPattern = 'yymmdd';
    ELSE IF CHARINDEX('yymm', @formatId) > 0 SET @breakPattern = 'yymm';
    ELSE IF CHARINDEX('yyyy', @formatId) > 0 SET @breakPattern = 'yyyy';
    ELSE IF CHARINDEX('yy', @formatId) > 0 SET @breakPattern = 'yy';
    ELSE IF CHARINDEX('mm', @formatId) > 0 SET @breakPattern = 'mm';
    ELSE IF CHARINDEX('dd', @formatId) > 0 SET @breakPattern = 'dd';

    /* ===============================
       build break key
    =============================== */
    IF @breakPattern = ':hhmmss' SET @breakKey = ':' + FORMAT(@now, 'HHmmss');
    ELSE IF @breakPattern = ':hhmm' SET @breakKey = ':' + FORMAT(@now, 'HHmm');
    ELSE IF @breakPattern = ':hh' SET @breakKey = ':' + FORMAT(@now, 'HH');
    ELSE IF @breakPattern = ':mm' SET @breakKey = ':' + FORMAT(@now, 'mm');
    ELSE IF @breakPattern = ':ss' SET @breakKey = ':' + FORMAT(@now, 'ss');
    ELSE IF @breakPattern = 'yyyymmdd' SET @breakKey = FORMAT(@now, 'yyyyMMdd');
    ELSE IF @breakPattern = 'yyyymm' SET @breakKey = FORMAT(@now, 'yyyyMM');
    ELSE IF @breakPattern = 'yymmdd' SET @breakKey = FORMAT(@now, 'yyMMdd');
    ELSE IF @breakPattern = 'yymm' SET @breakKey = FORMAT(@now, 'yyMM');
    ELSE IF @breakPattern = 'yyyy' SET @breakKey = FORMAT(@now, 'yyyy');
    ELSE IF @breakPattern = 'yy' SET @breakKey = FORMAT(@now, 'yy');
    ELSE IF @breakPattern = 'mm' SET @breakKey = FORMAT(@now, 'MM');
    ELSE IF @breakPattern = 'dd' SET @breakKey = FORMAT(@now, 'dd');

    /* ===============================
       sequence control
    =============================== */
    IF ISNULL(@breakKey, '') <> ISNULL(@currBreakKey, '')
        SET @seq = 1;
    ELSE
        SET @seq = @seq + 1;

    UPDATE dbo.BB_NUMBERING_CONFIG
    SET LAST_SEQ = @seq,
        LAST_BREAK_KEY = @breakKey
    WHERE CODE_TYPE = @CodeType;

    /* ===============================
       build result
    =============================== */
    SET @seqStr = RIGHT(REPLICATE('0', @digitLen) + CAST(@seq AS NVARCHAR), @digitLen);
    SET @GeneratedNo = @formatId;

    IF @breakPattern <> ''
        SET @GeneratedNo = REPLACE(@GeneratedNo, @breakPattern,
            REPLACE(@breakKey, ':', ''));

    IF @digitLen > 0
        SET @GeneratedNo = REPLACE(@GeneratedNo,
            REPLICATE('x', @digitLen), @seqStr);

    SET @GeneratedNo = REPLACE(@GeneratedNo, ':', '');
END
