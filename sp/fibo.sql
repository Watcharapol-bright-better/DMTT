CREATE PROC dbo.SP_CalcFibonacci
    @N INT,
    @Result NVARCHAR(1000) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- ===== Validate =====
    IF (@N < 0)
    BEGIN
        SET @Result = N'{"status": false, "msg": "number must not be negative"}';
        RETURN;
    END

    -- ===== Fibonacci Calculation =====
    DECLARE 
        @i INT = 0,
        @a BIGINT = 0,   -- F(0)
        @b BIGINT = 1,   -- F(1)
        @temp BIGINT;

    IF (@N = 0)
    BEGIN
        SET @Result = N'{"status": true, "data": 0}';
        RETURN;
    END

    WHILE (@i < @N - 1)
    BEGIN
        SET @temp = @a + @b;
        SET @a = @b;
        SET @b = @temp;
        SET @i = @i + 1;
    END

    -- ===== Return JSON =====
    SET @Result = N'{"status": true, "data": ' + CAST(@b AS NVARCHAR(100)) + N'}';
END
