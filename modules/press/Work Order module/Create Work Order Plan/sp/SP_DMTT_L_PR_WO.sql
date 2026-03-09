CREATE OR ALTER PROCEDURE [dbo].[SP_DMTT_L_PR_WO]
    @I_WO NVARCHAR(50),
    @O_RESULT NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validation
    IF (@I_WO IS NULL OR LTRIM(RTRIM(@I_WO)) = '')
    BEGIN
        SET @O_RESULT = N'{"status": false, "msg": "WO running number is required"}';
        RETURN;
    END

    -- ใช้เวลาเดียวกันทุกตารางเพื่อให้ Group ข้อมูลได้ง่าย
    DECLARE @LogDate DATETIME = GETDATE();

    BEGIN TRANSACTION
    BEGIN TRY

        -- 1. ตาราง Header: L_PR_WOH
        IF EXISTS (SELECT 1 FROM [dbo].[T_PR_WOH] WHERE [I_WO] = @I_WO)
        BEGIN
            INSERT INTO [dbo].[L_PR_WOH]
                       ([LOGDATE], [I_WO], [I_SONO], [I_WODATE], [I_CUSTOMER], [I_WO_TYPE], [I_PLAN_START]
                       ,[I_PLAN_FINISHED], [I_PR_MACHINE], [I_ITEMCODE], [I_WO_QTY], [I_WR_QTY], [I_REQ_COIL], [I_PRIORITY]
                       ,[I_REMARK], [I_PRT_FLG], [I_SHT_FLG], [I_REFER_WO], [I_COMPLETE_FLG], [I_REM1], [I_REM2]
                       ,[CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM], [UPDATED_DATE], [UPDATED_BY], [UPDATED_PRG_NM]
                       ,[MODIFY_COUNT], [I_DLY_DATE], [I_PRT_DATE], [I_STATUS])
            SELECT
                        @LogDate, [I_WO], [I_SONO], [I_WODATE], [I_CUSTOMER], [I_WO_TYPE], [I_PLAN_START]
                       ,[I_PLAN_FINISHED], [I_PR_MACHINE], [I_ITEMCODE], [I_WO_QTY], [I_WR_QTY], [I_REQ_COIL], [I_PRIORITY]
                       ,[I_REMARK], [I_PRT_FLG], [I_SHT_FLG], [I_REFER_WO], [I_COMPLETE_FLG], [I_REM1], [I_REM2]
                       ,[CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM], [UPDATED_DATE], [UPDATED_BY], [UPDATED_PRG_NM]
                       ,[MODIFY_COUNT], [I_DLY_DATE], [I_PRT_DATE], [I_STATUS]
            FROM [dbo].[T_PR_WOH] WHERE [I_WO] = @I_WO;
        END

        -- 2. ตาราง Material: L_PR_WOUSEMAT
        IF EXISTS (SELECT 1 FROM [dbo].[T_PR_WOUSEMAT] WHERE [I_WO] = @I_WO)
        BEGIN
            INSERT INTO [dbo].[L_PR_WOUSEMAT]
                       ([LOGDATE], [I_WO], [I_LNNO], [I_COILNO], [I_CUTNO], [I_HOOPNO], [I_COIL_BK]
                       ,[I_LOCATION], [I_WEIGHT], [I_AVAIL_QTY], [I_BACK_WGT], [I_ACPNO], [I_WO_COILNO]
                       ,[I_WO_CUTNO], [I_WO_HOOPNO], [I_COIL_BK_WO], [I_PICK_FLG], [I_REM1], [I_REM2]
                       ,[CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM], [UPDATED_DATE], [UPDATED_BY]
                       ,[UPDATED_PRG_NM], [MODIFY_COUNT])
            SELECT
                        @LogDate, [I_WO], [I_LNNO], [I_COILNO], [I_CUTNO], [I_HOOPNO], [I_COIL_BK]
                       ,[I_LOCATION], [I_WEIGHT], [I_AVAIL_QTY], [I_BACK_WGT], [I_ACPNO], [I_WO_COILNO]
                       ,[I_WO_CUTNO], [I_WO_HOOPNO], [I_COIL_BK_WO], [I_PICK_FLG], [I_REM1], [I_REM2]
                       ,[CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM], [UPDATED_DATE], [UPDATED_BY]
                       ,[UPDATED_PRG_NM], [MODIFY_COUNT]
            FROM [dbo].[T_PR_WOUSEMAT] WHERE [I_WO] = @I_WO;
        END

        -- 3. ตาราง Process: L_PR_WOPRCS
        IF EXISTS (SELECT 1 FROM [dbo].[T_PR_WOPRCS] WHERE [I_WO] = @I_WO)
        BEGIN
            INSERT INTO [dbo].[L_PR_WOPRCS]
                       ([LOGDATE], [I_WO], [I_SEQ], [I_PRCSCD], [I_PLN_STR_DATE], [I_PLN_END_DATE]
                       ,[I_FIN_FLG], [I_REM1], [I_REM2], [CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM]
                       ,[UPDATED_DATE], [UPDATED_BY], [UPDATED_PRG_NM], [MODIFY_COUNT], [I_FIN_DATE]
                       ,[I_STATUS], [I_DATE_START], [I_DATE_FINISHED])
            SELECT
                        @LogDate, [I_WO], [I_SEQ], [I_PRCSCD], [I_PLN_STR_DATE], [I_PLN_END_DATE]
                       ,[I_FIN_FLG], [I_REM1], [I_REM2], [CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM]
                       ,[UPDATED_DATE], [UPDATED_BY], [UPDATED_PRG_NM], [MODIFY_COUNT], [I_FIN_DATE]
                       ,[I_STATUS], [I_DATE_START], [I_DATE_FINISHED]
            FROM [dbo].[T_PR_WOPRCS] WHERE [I_WO] = @I_WO;
        END

        -- 4. ตาราง Detail: L_PR_WR_DTL
        IF EXISTS (SELECT 1 FROM [dbo].[T_PR_WR_DTL] WHERE [I_WO] = @I_WO)
        BEGIN
            INSERT INTO [dbo].[L_PR_WR_DTL] (
                        [LOGDATE], [I_WO], [I_COIL_SEQ], [I_COILNO], [I_CUT_NO]
                       ,[I_HOOPNO], [I_COIL_BK], [I_ITEMCODE], [I_ORG_WGT], [I_DATE_START]
                       ,[I_DATE_FINISHED], [I_PROD_QTY], [I_WGT_SETUP], [I_QTY_NG], [I_WGT_NG]
                       ,[I_NG_LOCATION], [I_QTY_SAMPLING], [I_WGT_SAMPLING], [I_WGT_SCRAP], [I_SCRAP_LOCATION]
                       ,[I_WGT_SCRAPMAT], [I_SCRAP_MAT_LOCATION], [I_COIL_BACK_WGT], [I_LABEL_ISSUE]
                       ,[I_SAMPLE_ISSUE], [I_LOT_PREVIOUS], [I_LOT_NEW_FR], [I_LOT_NEW_TO], [I_LOT_FRAC]
                       ,[I_WORKER], [I_REM1], [I_REM2], [CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM]
                       ,[UPDATED_DATE], [UPDATED_BY], [UPDATED_PRG_NM], [MODIFY_COUNT], [I_COIL_SCANNED_STATUS]
                       ,[I_NC_CHECK_STATUS], [I_PCS_SETUP], [I_PROD_WGT], [I_NG_SPE_PCS], [I_NG_SPE_WGT]
                       ,[I_SAMPLING_LOCATION], [I_NG_SPE_LOCATION])
            SELECT
                        @LogDate, [I_WO], [I_COIL_SEQ], [I_COILNO], [I_CUT_NO]
                       ,[I_HOOPNO], [I_COIL_BK], [I_ITEMCODE], [I_ORG_WGT], [I_DATE_START]
                       ,[I_DATE_FINISHED], [I_PROD_QTY], [I_WGT_SETUP], [I_QTY_NG], [I_WGT_NG]
                       ,[I_NG_LOCATION], [I_QTY_SAMPLING], [I_WGT_SAMPLING], [I_WGT_SCRAP], [I_SCRAP_LOCATION]
                       ,[I_WGT_SCRAPMAT], [I_SCRAP_MAT_LOCATION], [I_COIL_BACK_WGT], [I_LABEL_ISSUE]
                       ,[I_SAMPLE_ISSUE], [I_LOT_PREVIOUS], [I_LOT_NEW_FR], [I_LOT_NEW_TO], [I_LOT_FRAC]
                       ,[I_WORKER], [I_REM1], [I_REM2], [CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM]
                       ,[UPDATED_DATE], [UPDATED_BY], [UPDATED_PRG_NM], [MODIFY_COUNT], [I_COIL_SCANNED_STATUS]
                       ,[I_NC_CHECK_STATUS], [I_PCS_SETUP], [I_PROD_WGT], [I_NG_SPE_PCS], [I_NG_SPE_WGT]
                       ,[I_SAMPLING_LOCATION], [I_NG_SPE_LOCATION]
            FROM [dbo].[T_PR_WR_DTL] WHERE [I_WO] = @I_WO;
        END

        -- ===== Success =====
        COMMIT TRANSACTION;
        SET @O_RESULT = N'{"status": true, "msg": ""}';

    END TRY
    BEGIN CATCH
        -- ===== Error =====
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @O_RESULT = N'{"status": false, "msg": "' + REPLACE(ERROR_MESSAGE(), '"', '\"') + N'"}';
    END CATCH
END
