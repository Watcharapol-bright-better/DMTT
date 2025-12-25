
CREATE OR ALTER PROCEDURE [dbo].[SP_PPLI_EXCEL_IMPORT_WASTE_CONTRACT]
    @ContractNo NVARCHAR(20),
    @LumpsumpFlag NVARCHAR(1),
    @Result NVARCHAR(1000) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @IsNewContract BIT = 0;
        DECLARE @IsUpdate NVARCHAR;

        DECLARE @DuplicateInput NVARCHAR(MAX);

        DECLARE @OverlapList NVARCHAR(MAX);
        DECLARE @ExistContractNo NVARCHAR(50);
        DECLARE @ExistStart NVARCHAR(50);
        DECLARE @ExistEnd NVARCHAR(50);

        DECLARE @NewStart NVARCHAR(50);
        DECLARE @NewEnd NVARCHAR(50);
        DECLARE @NewWPS NVARCHAR(MAX);

        -- Get new start/end date
        SELECT
            @NewStart = CONVERT(NVARCHAR(10), [T].[VALID_FROM], 120),
            @NewEnd   = CONVERT(NVARCHAR(10), [T].[VALID_UNTIL], 120)
        FROM [PPLI_T_WASTE_CONTRACT_TEMP] AS [T]
        WHERE [T].[CONTRACT_NO] = @ContractNo
          AND [T].[DETAIL_TYPE] = 1;


        -- Get new WPS list
        SELECT
            @NewWPS = ISNULL(STRING_AGG([T].[WPSCODE], ','), '')
        FROM [PPLI_T_WASTE_CONTRACT_TEMP] AS [T]
        WHERE [T].[CONTRACT_NO] = @ContractNo
          AND [T].[DETAIL_TYPE] = 2;

        IF EXISTS (
            SELECT 1
            FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
            WHERE [CONTRACT_NO] = @ContractNo
        )
        BEGIN
            -- First, check if CONTRACT_NO already exists in the main table
            IF NOT EXISTS (
                SELECT 1 FROM [dbo].[PPLI_T_WASTE_CONTRACTH]
                WHERE [CONTRACT_NO] = @ContractNo
            )
            BEGIN
                SET @IsNewContract = 1;
            END

            -- =========================================
            -- Validate that [VALID_UNTIL] > [VALID_FROM]
            -- =========================================
            IF EXISTS (
                SELECT 1
                FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
                WHERE [CONTRACT_NO] = @ContractNo
                    AND [DETAIL_TYPE] = 1
                    AND ([VALID_UNTIL] <= [VALID_FROM])
                )
            BEGIN
                SET @Result = N'{"status":false,"message":"❌ Valid Until must be greater than or equal to Valid From."}';
                ROLLBACK;
                RETURN;
            END


            -- ==========================================================
            -- Check WPSCODE duplicates
            -- ** User input in the TEMP table (prevent user from entering duplicates)
            -- ==========================================================

            -- Find duplicates WPS in TEMP
            SELECT @DuplicateInput =
                   (
                       SELECT STRING_AGG([WPSCODE], ', ')
                       FROM [PPLI_T_WASTE_CONTRACT_TEMP]
                       WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] = 2
                       GROUP BY [WPSCODE]
                       HAVING COUNT(*) > 1
                   );


            -- ######################################################
            -- [New] Waste Contract
            -- ######################################################
            IF @IsNewContract = 1
            BEGIN


                -- ==========================================================
                -- Return error if duplicates found
                -- TEMP checked first, then main table
                -- ==========================================================
                IF @DuplicateInput IS NOT NULL
                    BEGIN
                        SET @Result = N'{"status":false,"message":"❌ [NEW] Duplicate WPS codes in input: ' + @DuplicateInput + '"}';
                        ROLLBACK;
                        RETURN;
                    END


                -- =========================================
                -- Check for overlapping date ranges by [WPSCODE]
                -- =========================================
                IF EXISTS (
                    SELECT 1
                    FROM [PPLI_T_WASTE_CONTRACTH] AS [H]
                             INNER JOIN [PPLI_T_WASTE_CONTRACTD] AS [D]
                                        ON [H].[CONTRACT_NO] = [D].[CONTRACT_NO]
                             INNER JOIN [PPLI_T_WASTE_CONTRACT_TEMP] AS [T]
                                        ON [T].[WPSCODE] = [D].[WPSCODE]
                                            AND [T].[DETAIL_TYPE] = 2
                    WHERE [D].[WPSCODE] IN (
                        SELECT TRIM([value])
                        FROM STRING_SPLIT(@NewWPS, ',')
                    )
                      AND [H].[VALID_FROM] <= CONVERT(DATETIME, @NewEnd, 120)
                      AND [H].[VALID_UNTIL] >= CONVERT(DATETIME, @NewStart, 120)
                    GROUP BY
                        [H].[CONTRACT_NO],
                        [H].[VALID_FROM],
                        [H].[VALID_UNTIL]
                )
                BEGIN
                    SELECT
                        @ExistContractNo = [H].[CONTRACT_NO],
                        @ExistStart = CONVERT(NVARCHAR(10), MIN([H].[VALID_FROM]), 120),
                        @ExistEnd = CONVERT(NVARCHAR(10), MIN([H].[VALID_UNTIL]), 120),
                        @OverlapList = STRING_AGG([T].[WPSCODE], ', ')
                    FROM [PPLI_T_WASTE_CONTRACTH] AS [H]
                             INNER JOIN [PPLI_T_WASTE_CONTRACTD] AS [D]
                                        ON [H].[CONTRACT_NO] = [D].[CONTRACT_NO]
                             INNER JOIN [PPLI_T_WASTE_CONTRACT_TEMP] AS [T]
                                        ON [T].[WPSCODE] = [D].[WPSCODE]
                                            AND [T].[DETAIL_TYPE] = 2
                    WHERE [D].[WPSCODE] IN (
                        SELECT TRIM([value])
                        FROM STRING_SPLIT(@NewWPS, ',')
                    )
                      AND [H].[VALID_FROM] <= CONVERT(DATETIME, @NewEnd, 120)
                      AND [H].[VALID_UNTIL] >= CONVERT(DATETIME, @NewStart, 120)
                    GROUP BY
                        [H].[CONTRACT_NO],
                        [H].[VALID_FROM],
                        [H].[VALID_UNTIL]

                    SET @Result = N'{
                        "status": false,
                        "message": "❌ **Date Range Overlap Detected**\n' +
                                  '    • Existing Contract No : ' + @ExistContractNo + '\n' +
                                  '    • Existing Date Range  : ' + @ExistStart + ' -> ' + @ExistEnd + '\n' +
                                  '    • New Date Range       : ' + @NewStart + ' -> ' + @NewEnd + '\n' +
                                  '    • WPS Overlap List     : ' + @OverlapList + '\n' +
                                  ' Overlapping is not allowed unless fully covering the existing contract"
                                  }';
                    ROLLBACK;
                    RETURN;
                END

                -- #############################################################
                -- Passed all validations, proceed to insert
                -- #############################################################


                -- =========================================
                -- INSERT DETAIL_TYPE 2 : Contract Header
                -- =========================================
                INSERT INTO [dbo].[PPLI_T_WASTE_CONTRACTH] (
                     [CONTRACT_NO]
                    ,[CONTRACT_NM]
                    ,[VALID_FROM]
                    ,[VALID_UNTIL]
                    ,[BILL_TO_CORRESP]
                    ,[INVOICE_ISSUANCE]
                    ,[CHARGEBY]
                    ,[CURRENCY]
                    ,[CUST_CONTRACT_NO]
                    ,[CUST_CONTRACT_NM]
                    ,[CUST_PIC]
                    ,[CUST_PIC_MAIL]
                    ,[CUST_PIC_PHONE]
                    ,[DOWNPAYMENT]
                    ,[CREDIT_TERMS]
                    ,[BUSINESS_TYPE]
                    ,[CREATED_DATE]
                    ,[CREATED_BY]
                    ,[CREATED_PRG_NM]
                    ,[UPDATED_DATE]
                    ,[UPDATED_BY]
                    ,[UPDATED_PRG_NM]
                    ,[MODIFY_COUNT]
                    ,[APPROVE_STATUS]
                    ,[APPROVED_BY]
                    ,[APPROVED_DATE]
                    ,[LUMPSUM_FLG]
                    ,[TOTAL_AMOUNT]
                    ,[ACTIVEFLAG]
                    ,[BANK_ACC]
                )
                SELECT
                     [CONTRACT_NO]
                    ,[CONTRACT_NM]
                    ,[VALID_FROM]
                    ,[VALID_UNTIL]
                    ,[BILL_TO_CORRESP]
                    ,[INVOICE_ISSUANCE]
                    ,[CHARGEBY]
                    ,[CURRENCY]
                    ,[CUST_CONTRACT_NO]
                    ,[CUST_CONTRACT_NM]
                    ,[CUST_PIC]
                    ,[CUST_PIC_MAIL]
                    ,[CUST_PIC_PHONE]
                    ,[DOWNPAYMENT]
                    ,[CREDIT_TERMS]
                    ,[BUSINESS_TYPE]
                    ,[CREATED_DATE]
                    ,[CREATED_BY]
                    ,[CREATED_PRG_NM]
                    ,[UPDATED_DATE]
                    ,[UPDATED_BY]
                    ,[UPDATED_PRG_NM]
                    ,[MODIFY_COUNT]
                    ,'0'
                    ,NULL
                    ,NULL
                    ,@LumpsumpFlag
                    ,NULL
                    ,1
                    ,[BANK_ACC]
                FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
                WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] = 1; -- DETAIL_TYPE 1: Contract Header

                -- =========================================
                -- INSERT DETAIL_TYPE 2 : Contract Details
                -- =========================================
                INSERT INTO [dbo].[PPLI_T_WASTE_CONTRACTD] (
                     [CONTRACT_NO]
                    ,[INTERNAL_NO]
                    ,[ROW_NO]
                    ,[WPSCODE]
                    ,[PRICETYPE]
                    ,[UNITTYPE]
                    ,[CONTAINERTYPE]
                    ,[CONVFLG]
                    ,[QTY]
                    ,[MINIMUMQTY]
                    ,[MAXIMUMQTY]
                    ,[LOADQTY]
                    ,[UNIT_PRICE]
                    ,[CREATED_DATE]
                    ,[CREATED_BY]
                    ,[CREATED_PRG_NM]
                    ,[UPDATED_DATE]
                    ,[UPDATED_BY]
                    ,[UPDATED_PRG_NM]
                    ,[MODIFY_COUNT]
                    ,[REMARKS]
                )
                SELECT
                     [CONTRACT_NO]
                    ,[INTERNAL_NO]
                    ,[ROW_NO]
                    ,[WPSCODE]
                    ,[PRICETYPE]
                    ,[UNITTYPE]
                    ,[CONTAINERTYPE]
                    ,[CONVFLG]
                    ,[QTY]
                    ,[MINIMUMQTY]
                    ,[MAXIMUMQTY]
                    ,[LOADQTY]
                    ,[UNIT_PRICE]
                    ,[CREATED_DATE]
                    ,[CREATED_BY]
                    ,[CREATED_PRG_NM]
                    ,[UPDATED_DATE]
                    ,[UPDATED_BY]
                    ,[UPDATED_PRG_NM]
                    ,0
                    ,[REMARKS]
                FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
                WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] = 2; -- DETAIL_TYPE 2: Waste Details


                -- =========================================
                -- INSERT Contract Details
                -- * Transportation Charges
                -- * Other Charges
                -- * Oil & Gas
                -- =========================================
                IF EXISTS (
                    SELECT 1 FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
                    WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] IN (3,4,5)
                )
                BEGIN
                    INSERT INTO [dbo].[PPLI_T_WASTE_CONTRACTD2] (
                         [CONTRACT_NO]
                        ,[INTERNAL_NO]
                        ,[ROW_NO]
                        ,[CHARGETYPE]
                        ,[CONTAINERTYPE]
                        ,[GOODSCODE]
                        ,[DESCRIPTION]
                        ,[SITE_CODE]
                        ,[UNIT]
                        ,[UNIT_PRICE]
                        ,[CREATED_DATE]
                        ,[CREATED_BY]
                        ,[CREATED_PRG_NM]
                        ,[UPDATED_DATE]
                        ,[UPDATED_BY]
                        ,[UPDATED_PRG_NM]
                        ,[MODIFY_COUNT]
                    )
                    SELECT
                         [CONTRACT_NO]
                        ,[INTERNAL_NO]
                        ,[ROW_NO]
                        ,[CHARGETYPE]
                        ,[CONTAINERTYPE]
                        ,[GOODSCODE]
                        ,[DESCRIPTION]
                        ,[SITE_CODE]
                        ,[UNIT]
                        ,[UNIT_PRICE]
                        ,[CREATED_DATE]
                        ,[CREATED_BY]
                        ,[CREATED_PRG_NM]
                        ,[UPDATED_DATE]
                        ,[UPDATED_BY]
                        ,[UPDATED_PRG_NM]
                        ,0
                    FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
                    WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] IN (3,4,5)
                END


                SET @IsUpdate = '0';


            END

            -- ######################################################
            -- [Update] Waste Contract
            -- ######################################################
            ELSE
                BEGIN
                    -- =========================================
                    --  UPDATE DETAIL_TYPE 1 : Contract Header
                    -- =========================================
                    IF EXISTS (
                        SELECT DISTINCT 1
                        FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
                        WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] = 1
                    )
                    BEGIN
                        UPDATE [T]
                        SET
                             [T].[CONTRACT_NM]       = [S].[CONTRACT_NM]
                            ,[T].[VALID_FROM]        = [S].[VALID_FROM]
                            ,[T].[VALID_UNTIL]       = [S].[VALID_UNTIL]
                            ,[T].[BILL_TO_CORRESP]   = [S].[BILL_TO_CORRESP]
                            ,[T].[INVOICE_ISSUANCE]  = [S].[INVOICE_ISSUANCE]
                            ,[T].[CHARGEBY]          = [S].[CHARGEBY]
                            ,[T].[CURRENCY]          = [S].[CURRENCY]
                            ,[T].[CUST_CONTRACT_NO]  = [S].[CUST_CONTRACT_NO]
                            ,[T].[CUST_CONTRACT_NM]  = [S].[CUST_CONTRACT_NM]
                            ,[T].[CUST_PIC]          = [S].[CUST_PIC]
                            ,[T].[CUST_PIC_MAIL]     = [S].[CUST_PIC_MAIL]
                            ,[T].[CUST_PIC_PHONE]    = [S].[CUST_PIC_PHONE]
                            ,[T].[DOWNPAYMENT]       = [S].[DOWNPAYMENT]
                            ,[T].[CREDIT_TERMS]      = [S].[CREDIT_TERMS]
                            ,[T].[BUSINESS_TYPE]     = [S].[BUSINESS_TYPE]
                            ,[T].[MODIFY_COUNT]      = ISNULL([T].[MODIFY_COUNT], 0) + 1
                            ,[T].[UPDATED_DATE]      = GETDATE()
                            ,[T].[BANK_ACC]          = [S].[BANK_ACC]
                        FROM [dbo].[PPLI_T_WASTE_CONTRACTH] AS [T]
                        INNER JOIN [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] AS [S]
                            ON [T].[CONTRACT_NO] = [S].[CONTRACT_NO]
                        WHERE [T].[CONTRACT_NO] = @ContractNo AND [S].[DETAIL_TYPE] = 1;
                    END

                    -- =========================================
                    -- UPDATE DETAIL_TYPE 2 : Contract Details
                    -- =========================================
                    IF EXISTS (
                        SELECT DISTINCT 1
                        FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
                        WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] = 2
                    )
                    BEGIN
                        UPDATE [D]
                        SET
                             [D].[ROW_NO]            = [S].[ROW_NO]
                            ,[D].[WPSCODE]           = [S].[WPSCODE]
                            ,[D].[PRICETYPE]         = [S].[PRICETYPE]
                            ,[D].[UNITTYPE]          = [S].[UNITTYPE]
                            ,[D].[CONTAINERTYPE]     = [S].[CONTAINERTYPE]
                            ,[D].[CONVFLG]           = [S].[CONVFLG]
                            ,[D].[UNIT_PRICE]        = [S].[UNIT_PRICE]
                            ,[D].[QTY]               = [S].[QTY]
                            ,[D].[LOADQTY]           = [S].[LOADQTY]
                            ,[D].[MINIMUMQTY]        = [S].[MINIMUMQTY]
                            ,[D].[MAXIMUMQTY]        = [S].[MAXIMUMQTY]
                            ,[D].[REMARKS]			 = [S].[REMARKS]
                            ,[D].[MODIFY_COUNT]      = ISNULL([D].[MODIFY_COUNT], 0) + 1
                            ,[D].[UPDATED_DATE]      = GETDATE()
                        FROM [dbo].[PPLI_T_WASTE_CONTRACTD] AS [D]
                        INNER JOIN [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] AS [S]
                            ON [D].[CONTRACT_NO] = [S].[CONTRACT_NO]
                            AND [D].[INTERNAL_NO] = [S].[INTERNAL_NO]
                        WHERE [D].[CONTRACT_NO] = @ContractNo AND [S].[DETAIL_TYPE] = 2;
                    END

                    -- =========================================
                    -- UPDATE DETAIL_TYPE 3 : Transportation Charges
                    -- =========================================
                    IF EXISTS (
                        SELECT DISTINCT 1 FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
                        WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] = 3
                    )
                    BEGIN
                        UPDATE [D2]
                        SET
                             [D2].[CHARGETYPE]     = [T].[CHARGETYPE]
                            ,[D2].[CONTAINERTYPE]  = [T].[CONTAINERTYPE]
                            ,[D2].[UNIT_PRICE]     = [T].[UNIT_PRICE]
                            ,[D2].[GOODSCODE]      = [T].[GOODSCODE]
                            ,[D2].[DESCRIPTION]    = [T].[DESCRIPTION]
                            ,[D2].[SITE_CODE]      = [T].[SITE_CODE]
                            ,[D2].[UNIT]           = [T].[UNIT]
                            ,[D2].[MODIFY_COUNT]   = ISNULL([D2].[MODIFY_COUNT], 0) + 1
                            ,[D2].[UPDATED_DATE]   = GETDATE()
                        FROM [dbo].[PPLI_T_WASTE_CONTRACTD2] AS [D2]
                        INNER JOIN [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] AS [T]
                            ON [D2].[CONTRACT_NO] = [T].[CONTRACT_NO]
                            AND [D2].[INTERNAL_NO] = [T].[INTERNAL_NO]
                        WHERE [T].[DETAIL_TYPE] = 3;
                    END

                    -- =========================================
                    -- UPDATE DETAIL_TYPE 4 : Other Charges
                    -- =========================================
                    IF EXISTS (
                        SELECT DISTINCT 1 FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
                        WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] = 4
                    )
                    BEGIN
                        UPDATE [D2]
                        SET
                             [D2].[CHARGETYPE]     = [T].[CHARGETYPE]
                            ,[D2].[CONTAINERTYPE]  = [T].[CONTAINERTYPE]
                            ,[D2].[UNIT_PRICE]     = [T].[UNIT_PRICE]
                            ,[D2].[QTY]            = [T].[QTY]
                            ,[D2].[GOODSCODE]      = [T].[GOODSCODE]
                            ,[D2].[DESCRIPTION]    = [T].[DESCRIPTION]
                            ,[D2].[UNIT]           = [T].[UNIT]
                            ,[D2].[MODIFY_COUNT]   = ISNULL([D2].[MODIFY_COUNT], 0) + 1
                            ,[D2].[UPDATED_DATE]   = GETDATE()
                        FROM [dbo].[PPLI_T_WASTE_CONTRACTD2] AS [D2]
                        INNER JOIN [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] AS [T]
                            ON [D2].[CONTRACT_NO] = [T].[CONTRACT_NO]
                            AND [D2].[INTERNAL_NO] = [T].[INTERNAL_NO]
                        WHERE [T].[DETAIL_TYPE] = 4;
                    END

                    -- =========================================
                    -- UPDATE DETAIL_TYPE 5 : Oil & Gas
                    -- =========================================
                    IF EXISTS (
                        SELECT DISTINCT 1 FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP]
                        WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] = 5
                    )
                    BEGIN
                        UPDATE [D2]
                        SET
                             [D2].[CHARGETYPE]     = [T].[CHARGETYPE]
                            ,[D2].[UNIT_PRICE]     = [T].[UNIT_PRICE]
                            ,[D2].[GOODSCODE]      = [T].[GOODSCODE]
                            ,[D2].[DESCRIPTION]    = [T].[DESCRIPTION]
                            ,[D2].[UNIT]           = [T].[UNIT]
                            ,[D2].[MODIFY_COUNT]   = ISNULL([D2].[MODIFY_COUNT], 0) + 1
                            ,[D2].[UPDATED_DATE]   = GETDATE()
                        FROM [dbo].[PPLI_T_WASTE_CONTRACTD2] AS [D2]
                        INNER JOIN [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] AS [T]
                            ON [D2].[CONTRACT_NO] = [T].[CONTRACT_NO]
                            AND [D2].[INTERNAL_NO] = [T].[INTERNAL_NO]
                        WHERE [T].[DETAIL_TYPE] = 5;
                    END

                    -- #####################################################


                    -- ==========================================================
                    -- Return error if duplicates found
                    -- ==========================================================
                    IF @DuplicateInput IS NOT NULL
                        BEGIN
                            SET @Result = N'{"status":false,"message":"❌ [UPDATE] Duplicate WPS codes in input: ' + @DuplicateInput + '"}';
                            ROLLBACK;
                            RETURN;
                        END
                  

                    -- =========================================
                    -- Check for overlapping date ranges by [WPSCODE]
                    -- =========================================
                    IF EXISTS (
                        SELECT 1
                        FROM [PPLI_T_WASTE_CONTRACTH] AS [H]
                                 INNER JOIN [PPLI_T_WASTE_CONTRACTD] AS [D]
                                            ON [H].[CONTRACT_NO] = [D].[CONTRACT_NO]
                                 INNER JOIN [PPLI_T_WASTE_CONTRACT_TEMP] AS [T]
                                            ON [T].[WPSCODE] = [D].[WPSCODE]
                                                AND [T].[DETAIL_TYPE] = 2
                        WHERE [D].[WPSCODE] IN (
                            SELECT TRIM([value])
                            FROM STRING_SPLIT(@NewWPS, ',')
                        )
                          AND [H].[VALID_FROM] <= CONVERT(DATETIME, @NewEnd, 120)
                          AND [H].[VALID_UNTIL] >= CONVERT(DATETIME, @NewStart, 120)
                        GROUP BY
                            [H].[CONTRACT_NO],
                            [H].[VALID_FROM],
                            [H].[VALID_UNTIL]
                    )
                        BEGIN
                            SELECT
                                @ExistContractNo = [H].[CONTRACT_NO],
                                @ExistStart = CONVERT(NVARCHAR(10), MIN([H].[VALID_FROM]), 120),
                                @ExistEnd = CONVERT(NVARCHAR(10), MIN([H].[VALID_UNTIL]), 120),
                                @OverlapList = STRING_AGG([T].[WPSCODE], ', ')
                            FROM [PPLI_T_WASTE_CONTRACTH] AS [H]
                                     INNER JOIN [PPLI_T_WASTE_CONTRACTD] AS [D]
                                                ON [H].[CONTRACT_NO] = [D].[CONTRACT_NO]
                                     INNER JOIN [PPLI_T_WASTE_CONTRACT_TEMP] AS [T]
                                                ON [T].[WPSCODE] = [D].[WPSCODE]
                                                    AND [T].[DETAIL_TYPE] = 2
                            WHERE [D].[WPSCODE] IN (
                                SELECT TRIM([value])
                                FROM STRING_SPLIT(@NewWPS, ',')
                            )
                              AND [H].[VALID_FROM] <= CONVERT(DATETIME, @NewEnd, 120)
                              AND [H].[VALID_UNTIL] >= CONVERT(DATETIME, @NewStart, 120)
                            GROUP BY
                                [H].[CONTRACT_NO],
                                [H].[VALID_FROM],
                                [H].[VALID_UNTIL]

                            SET @Result = N'{
                                "status": false,
                                "message": "❌ **Date Range Overlap Detected**\n' +
                                          '    • Existing Contract No : ' + @ExistContractNo + '\n' +
                                          '    • Existing Date Range  : ' + @ExistStart + ' -> ' + @ExistEnd + '\n' +
                                          '    • New Date Range       : ' + @NewStart + ' -> ' + @NewEnd + '\n' +
                                          '    • WPS Overlap List     : ' + @OverlapList + '\n' +
                                          ' Overlapping is not allowed unless fully covering the existing contract"
                                      }';
                            ROLLBACK;
                            RETURN;
                        END
                    ELSE
                        BEGIN
                            -- =========================================
                            -- INSERT DETAIL_TYPE 2 : Add new WPS in contract details
                            -- =========================================
                            INSERT INTO [dbo].[PPLI_T_WASTE_CONTRACTD] (
                                [CONTRACT_NO]
                                ,[INTERNAL_NO]
                                ,[ROW_NO]
                                ,[WPSCODE]
                                ,[PRICETYPE]
                                ,[UNITTYPE]
                                ,[CONTAINERTYPE]
                                ,[CONVFLG]
                                ,[QTY]
                                ,[MINIMUMQTY]
                                ,[MAXIMUMQTY]
                                ,[LOADQTY]
                                ,[UNIT_PRICE]
                                ,[CREATED_DATE]
                                ,[CREATED_BY]
                                ,[CREATED_PRG_NM]
                                ,[UPDATED_DATE]
                                ,[UPDATED_BY]
                                ,[UPDATED_PRG_NM]
                                ,[MODIFY_COUNT]
                                ,[REMARKS]
                            )
                            SELECT
                                [T].[CONTRACT_NO]
                                 ,[T].[INTERNAL_NO]
                                 ,[T].[ROW_NO]
                                 ,[T].[WPSCODE]
                                 ,[T].[PRICETYPE]
                                 ,[T].[UNITTYPE]
                                 ,[T].[CONTAINERTYPE]
                                 ,[T].[CONVFLG]
                                 ,[T].[QTY]
                                 ,[T].[MINIMUMQTY]
                                 ,[T].[MAXIMUMQTY]
                                 ,[T].[LOADQTY]
                                 ,[T].[UNIT_PRICE]
                                 ,[T].[CREATED_DATE]
                                 ,[T].[CREATED_BY]
                                 ,[T].[CREATED_PRG_NM]
                                 ,[T].[UPDATED_DATE]
                                 ,[T].[UPDATED_BY]
                                 ,[T].[UPDATED_PRG_NM]
                                 ,0
                                 ,[T].[REMARKS]
                            FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] AS [T]
                            WHERE [T].[CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] = 2
                              AND NOT EXISTS (
                                SELECT 1
                                FROM [dbo].[PPLI_T_WASTE_CONTRACTD] AS [D]
                                WHERE [D].[CONTRACT_NO] = [T].[CONTRACT_NO]
                                  AND [D].[INTERNAL_NO] = [T].[INTERNAL_NO]
                            );

                        END


                    -- =========================================
                    -- Add new data in Waste Contract
                    -- * 'Transportation Charges'
                    -- * 'Other Charges'
                    -- * 'Oil & Gas'
                    -- =========================================
                    INSERT INTO [dbo].[PPLI_T_WASTE_CONTRACTD2] (
                             [CONTRACT_NO]
                            ,[INTERNAL_NO]
                            ,[ROW_NO]
                            ,[CHARGETYPE]
                            ,[CONTAINERTYPE]
                            ,[GOODSCODE]
                            ,[DESCRIPTION]
                            ,[SITE_CODE]
                            ,[UNIT]
                            ,[UNIT_PRICE]
                            ,[CREATED_DATE]
                            ,[CREATED_BY]
                            ,[CREATED_PRG_NM]
                            ,[UPDATED_DATE]
                            ,[UPDATED_BY]
                            ,[UPDATED_PRG_NM]
                            ,[MODIFY_COUNT]
                        )
                        SELECT
                             [CONTRACT_NO]
                            ,[INTERNAL_NO]
                            ,[ROW_NO]
                            ,[CHARGETYPE]
                            ,[CONTAINERTYPE]
                            ,[GOODSCODE]
                            ,[DESCRIPTION]
                            ,[SITE_CODE]
                            ,[UNIT]
                            ,[UNIT_PRICE]
                            ,[CREATED_DATE]
                            ,[CREATED_BY]
                            ,[CREATED_PRG_NM]
                            ,[UPDATED_DATE]
                            ,[UPDATED_BY]
                            ,[UPDATED_PRG_NM]
                            ,0
                        FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] [T]
                        WHERE [CONTRACT_NO] = @ContractNo AND [DETAIL_TYPE] IN (3,4,5)
                        AND NOT EXISTS (
                            SELECT 1
                            FROM [dbo].[PPLI_T_WASTE_CONTRACTD2] AS [D]
                            WHERE [D].[CONTRACT_NO] = [T].[CONTRACT_NO]
                                AND [D].[INTERNAL_NO] = [T].[INTERNAL_NO]
                    );


                    SET @IsUpdate = '1';
            END

            --DELETE FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] WHERE [CONTRACT_NO] = @ContractNo;

            SET @Result = '{"status":true,"is_update":"'+@IsUpdate+'","contract_no":"'+@ContractNo+'"}';
            COMMIT;
        END
        ELSE
        BEGIN
            SET @Result = '{"status":false,"message":"Contract No [' + @ContractNo + '] does not exist in temporary table."}';
            ROLLBACK;
        END

    END TRY
    BEGIN CATCH
        SET @Result = '{"status":false,"message":"' + ERROR_MESSAGE() + '"}';
        ROLLBACK;
    END CATCH
END