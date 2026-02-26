CREATE TABLE [dbo].[USER_AUTHORITY](
	[I_AUTH_ID] [nvarchar](20) NOT NULL,
	[I_USER_ID] [nvarchar](50) NOT NULL,
	[I_EMAIL] [nvarchar](100) NULL, 
	[I_KIND] [nvarchar](5) NOT NULL,  -- 1001=Requester (ผู้ขออนุมัติ), 1002=Approver (ผู้อนุมัติ)
	[I_GROUP] [nvarchar](50) NOT NULL, -- กลุ่มแผนก (IT, HR, Sales, etc..)
	[I_LEVEL] [numeric](2, 0) NULL, -- ระดับการอนุมัติ: 0=Requester, 1=Manager, 2=Director, 3=CEO, ...
	[I_IS_FINAL] [nvarchar](1) NULL, -- Final Approver | เป็นขั้นสุดท้ายหรือไม่: 1=อนุมัติแล้วจบเลย, 0=ต้องไปขั้นถัดไป
	[I_ACTIVE_FLAG] [nvarchar](1) NULL, -- สถานะใช้งาน: 1=ใช้งาน, 0=ปิดการใช้งาน
	[CREATED_DATE] [datetime] NULL,
	[CREATED_BY] [nvarchar](10) NULL,
	[CREATED_PRG_NM] [nvarchar](50) NULL,
	[UPDATED_DATE] [datetime] NULL,
	[UPDATED_BY] [nvarchar](10) NULL,
	[UPDATED_PRG_NM] [nvarchar](50) NULL,
    [MODIFY_COUNT] NUMERIC(10,0) NULL,
 CONSTRAINT [PK_USER_AUTHORITY] PRIMARY KEY CLUSTERED 
(
	[I_AUTH_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- ===================================================================
-- WFS_T_H: Workflow Header
-- ===================================================================
CREATE TABLE [dbo].[WFS_T_H](
    [I_WF_ID] NVARCHAR(20) NOT NULL,                -- Workflow ID (PK, Auto-generated)
    [I_REF_DOC_NO] NVARCHAR(50) NOT NULL,           -- Reference Document Number (e.g., QT202602, PO001)
    [I_GROUP] NVARCHAR(50) NOT NULL,                -- Department/Group for approval routing
    [I_USER_ID] NVARCHAR(50) NOT NULL,              -- Requester User ID (who submitted)
    [I_CURRENT_LEVEL] NUMERIC(2, 0) NULL,           -- Current approval level (1,2,3...)
    [I_REQUIRED_LEVEL] NUMERIC(2, 0) NULL,          -- Maximum approval level required
    [I_STATUS] NVARCHAR(2) NULL,                    -- Header Status: 0=Closed, 1=Open
    [I_REQUEST_DATE] DATETIME NULL,                 -- Request submission date
    [I_COMPLETED_DATE] DATETIME NULL,               -- Workflow completion date
    [CREATED_DATE] DATETIME NULL,                   -- Record creation timestamp
    [CREATED_BY] NVARCHAR(10) NULL,                 -- User who created record
    [CREATED_PRG_NM] NVARCHAR(50) NULL,             -- Program/SP name that created record
    [UPDATED_DATE] DATETIME NULL,                   -- Last update timestamp
    [UPDATED_BY] NVARCHAR(10) NULL,                 -- User who last updated
    [UPDATED_PRG_NM] NVARCHAR(50) NULL,             -- Program/SP name that updated record
    [MODIFY_COUNT] NUMERIC(10,0) NULL,              -- Number of modifications
    CONSTRAINT [PK_WFS_T_H] PRIMARY KEY CLUSTERED ([I_WF_ID] ASC)
) ON [PRIMARY]
GO

-- ===================================================================
-- WFS_T_D: Workflow Detail (Event Log)
-- ===================================================================
CREATE TABLE [dbo].[WFS_T_D](
    [I_WF_ID] NVARCHAR(20) NOT NULL,                -- Workflow ID (FK to WFS_T_H)
    [I_WF_INTERNAL_NO] NVARCHAR(20) NOT NULL,       -- Unique event ID (WF_ID + sequence)
    [I_SEQ_NO] NUMERIC(3, 0) NOT NULL,              -- Event sequence number (1,2,3...)
    [I_USER_ID] NVARCHAR(50) NOT NULL,              -- Requester/Actor User ID
    [I_APPROVER_ID] NVARCHAR(50) NULL,              -- Assigned approver for this level
    [I_KIND] NVARCHAR(5) NOT NULL,                  -- Action type: 1001=Request, 1002=Approve
    [I_LEVEL] NUMERIC(2, 0) NULL,                   -- Approval level for this event
    [I_STATUS] NVARCHAR(2) NULL,                    -- Event Status: 0=Pending, 1=Approved, 2=Unapproved, 3=Rejected
    [I_ACTION_BY] NVARCHAR(50) NULL,                -- User who performed the action
    [I_ACTION_DATE] DATETIME NULL,                  -- Action timestamp
    [I_REMARK] NVARCHAR(1000) NULL,                 -- Comments/Reason for action
    [CREATED_DATE] DATETIME NULL,                   -- Record creation timestamp
    [CREATED_BY] NVARCHAR(10) NULL,                 -- User who created record
    [CREATED_PRG_NM] NVARCHAR(50) NULL,             -- Program/SP name that created record
    [UPDATED_DATE] DATETIME NULL,                   -- Last update timestamp
    [UPDATED_BY] NVARCHAR(10) NULL,                 -- User who last updated
    [UPDATED_PRG_NM] NVARCHAR(50) NULL,             -- Program/SP name that updated record
    [MODIFY_COUNT] NUMERIC(10,0) NULL,              -- Number of modifications
    CONSTRAINT [PK_WFS_T_D] PRIMARY KEY CLUSTERED (
        [I_WF_ID] ASC,
        [I_WF_INTERNAL_NO] ASC
    )
) ON [PRIMARY]
GO

-- ## Views Table
-- ===================================================================
-- VW_WF_PENDING_APPROVAL_LIST: Pending + Unapproved items
-- ===================================================================
CREATE OR ALTER VIEW [dbo].[VW_WF_PENDING_APPROVAL_LIST] AS
SELECT 
    [H].[I_WF_ID],
    [H].[I_REF_DOC_NO],
    [H].[I_GROUP],
    [H].[I_USER_ID] AS [REQUESTER_ID],
    [H].[I_CURRENT_LEVEL],
    [H].[I_REQUIRED_LEVEL],
    [H].[I_STATUS],
    [H].[I_REQUEST_DATE],
    [UA].[I_USER_ID] AS [APPROVER_ID],
    [UA].[I_EMAIL] AS [APPROVER_EMAIL],
    [UA].[I_LEVEL] AS [APPROVER_LEVEL],
    [UA].[I_IS_FINAL],
    (
        SELECT TOP 1 [I_REMARK] 
        FROM [dbo].[WFS_T_D] 
        WHERE [I_WF_ID] = [H].[I_WF_ID] 
        AND [I_KIND] = '1001' 
        ORDER BY [I_SEQ_NO]
    ) AS [REQUEST_REMARK],
    (
        SELECT TOP 1 [I_STATUS]
        FROM [dbo].[WFS_T_D]
        WHERE [I_WF_ID] = [H].[I_WF_ID]
        AND [I_LEVEL] = [H].[I_CURRENT_LEVEL]
        AND [I_APPROVER_ID] = [UA].[I_USER_ID]
        ORDER BY [I_SEQ_NO] DESC
    ) AS [CURRENT_LEVEL_STATUS]
FROM [dbo].[WFS_T_H] [H]
INNER JOIN [dbo].[USER_AUTHORITY] [UA] 
    ON [UA].[I_GROUP] = [H].[I_GROUP]
    AND [UA].[I_LEVEL] = [H].[I_CURRENT_LEVEL]
    AND [UA].[I_KIND] = '1002'
    AND [UA].[I_ACTIVE_FLAG] = '1'
WHERE [H].[I_STATUS] = '1'
-- AND EXISTS (
--     SELECT 1 
--     FROM [dbo].[WFS_T_D] 
--     WHERE [I_WF_ID] = [H].[I_WF_ID]
--     AND [I_LEVEL] = [H].[I_CURRENT_LEVEL]
--     AND [I_STATUS] IN ('0', '2')
-- )
GO

-- ===================================================================
-- VW_WF_MY_REQUEST_LIST: My submitted requests
-- ===================================================================
CREATE OR ALTER VIEW [dbo].[VW_WF_MY_REQUEST_LIST] AS
SELECT 
    [H].[I_WF_ID],
    [H].[I_REF_DOC_NO],
    [H].[I_GROUP],
    [H].[I_USER_ID] AS [REQUESTER_ID],
    [H].[I_CURRENT_LEVEL],
    [H].[I_REQUIRED_LEVEL],
    [H].[I_STATUS],
    CASE [H].[I_STATUS]
        WHEN '0' THEN 'Closed'
        WHEN '1' THEN 'Open'
    END AS [STATUS_TEXT],
    [H].[I_REQUEST_DATE],
    [H].[I_COMPLETED_DATE],
    (
        SELECT TOP 1 [I_REMARK] 
        FROM [dbo].[WFS_T_D] 
        WHERE [I_WF_ID] = [H].[I_WF_ID] 
        AND [I_KIND] = '1001' 
        ORDER BY [I_SEQ_NO]
    ) AS [REQUEST_REMARK],
    (
        SELECT TOP 1 [I_ACTION_BY] 
        FROM [dbo].[WFS_T_D] 
        WHERE [I_WF_ID] = [H].[I_WF_ID] 
        AND [I_STATUS] IS NOT NULL
        ORDER BY [I_SEQ_NO] DESC
    ) AS [LAST_ACTION_BY],
    (
        SELECT TOP 1 [I_STATUS] 
        FROM [dbo].[WFS_T_D] 
        WHERE [I_WF_ID] = [H].[I_WF_ID] 
        AND [I_STATUS] IS NOT NULL
        ORDER BY [I_SEQ_NO] DESC
    ) AS [LAST_STATUS],
    (
        SELECT TOP 1 [I_REMARK] 
        FROM [dbo].[WFS_T_D] 
        WHERE [I_WF_ID] = [H].[I_WF_ID] 
        ORDER BY [I_SEQ_NO] DESC
    ) AS [LAST_REMARK]
FROM [dbo].[WFS_T_H] [H]
GO

-- ===================================================================
-- VW_WF_APPROVAL_HISTORY: Complete approval history
-- ===================================================================
CREATE OR ALTER VIEW [dbo].[VW_WF_APPROVAL_HISTORY] AS
SELECT 
    [H].[I_WF_ID],
    [H].[I_REF_DOC_NO],
    [H].[I_GROUP],
    [H].[I_USER_ID] AS [REQUESTER_ID],
    [H].[I_STATUS] AS [CURRENT_STATUS],
    [D].[I_WF_INTERNAL_NO],
    [D].[I_SEQ_NO],
    [D].[I_USER_ID],
    [D].[I_APPROVER_ID],
    [D].[I_KIND],
    CASE [D].[I_KIND]
        WHEN '1001' THEN 'Request'
        WHEN '1002' THEN 'Approve'
    END AS [ACTION_TYPE],
    [D].[I_LEVEL],
    [D].[I_STATUS],
    CASE [D].[I_STATUS]
        WHEN '0' THEN 'Pending'
        WHEN '1' THEN 'Approved'
        WHEN '2' THEN 'Unapproved'
        WHEN '3' THEN 'Rejected'
    END AS [STATUS_TEXT],
    [D].[I_ACTION_BY],
    [D].[I_ACTION_DATE],
    [D].[I_REMARK]
FROM [dbo].[WFS_T_H] [H]
LEFT JOIN [dbo].[WFS_T_D] [D] ON [H].[I_WF_ID] = [D].[I_WF_ID]
GO

-- ## Stored Procedures
-- SP 1: Submit Request (สร้าง Workflow)
-- ===================================================================
-- SP_WF_SUBMIT_REQUEST: Submit new approval request
-- Status: WFS_T_H.I_STATUS = '1' (Open)
-- Detail Status: WFS_T_D.I_STATUS = '0' (Pending)
-- ===================================================================
CREATE OR ALTER PROCEDURE [dbo].[SP_WF_SUBMIT_REQUEST]
(
    @I_USER_ID NVARCHAR(50),
    @I_REF_DOC_NO NVARCHAR(50),
    @I_GROUP NVARCHAR(50),
    @I_REMARK NVARCHAR(1000) = NULL,
    @O_RESULT NVARCHAR(MAX) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @I_WF_ID NVARCHAR(20);
    DECLARE @I_REQUIRED_LEVEL NUMERIC(2,0);
    DECLARE @I_APPROVER_ID NVARCHAR(50);
    DECLARE @I_WF_INTERNAL_NO NVARCHAR(20);

    BEGIN TRY
        BEGIN TRAN;

        IF EXISTS (
            SELECT 1 FROM [dbo].[WFS_T_H]
            WHERE [I_REF_DOC_NO] = @I_REF_DOC_NO
            AND [I_STATUS] = '1'
        )
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "Workflow already exists for this document ['+@I_REF_DOC_NO+']" }';
            ROLLBACK TRAN;
            RETURN;
        END

        EXEC [dbo].[SP_RUN_NUMBERING_V1]
            @CodeType = N'DMTT_N_WF',
            @Format = N'WFyyyymmddxxxx',
            @GeneratedNo = @I_WF_ID OUTPUT;

        SELECT @I_REQUIRED_LEVEL = MAX([I_LEVEL])
        FROM [dbo].[USER_AUTHORITY]
        WHERE [I_GROUP] = @I_GROUP
        AND [I_KIND] = '1002'
        AND [I_ACTIVE_FLAG] = '1';

        IF ISNULL(@I_REQUIRED_LEVEL,0) = 0
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No approver is assigned for this group. Please set it in User Authority." }';
            ROLLBACK TRAN;
            RETURN;
        END

        SELECT TOP 1 @I_APPROVER_ID = [I_USER_ID]
        FROM [dbo].[USER_AUTHORITY]
        WHERE [I_GROUP] = @I_GROUP
        AND [I_LEVEL] = 1
        AND [I_KIND] = '1002'
        AND [I_ACTIVE_FLAG] = '1';

        INSERT INTO [dbo].[WFS_T_H] (
            [I_WF_ID], [I_REF_DOC_NO], [I_GROUP], [I_USER_ID],
            [I_CURRENT_LEVEL], [I_REQUIRED_LEVEL], [I_STATUS], 
            [I_REQUEST_DATE], [CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM]
        )
        VALUES (
            @I_WF_ID, @I_REF_DOC_NO, @I_GROUP, @I_USER_ID,
            1, @I_REQUIRED_LEVEL, '1',
            GETDATE(), GETDATE(), @I_USER_ID, 'SP_WF_SUBMIT_REQUEST'
        );

        SET @I_WF_INTERNAL_NO = @I_WF_ID + '_001';

        INSERT INTO [dbo].[WFS_T_D] (
            [I_WF_ID], [I_WF_INTERNAL_NO], [I_SEQ_NO], [I_USER_ID],
            [I_APPROVER_ID], [I_KIND], [I_LEVEL], [I_STATUS],
            [I_ACTION_BY], [I_ACTION_DATE], [I_REMARK],
            [CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM]
        )
        VALUES (
            @I_WF_ID, @I_WF_INTERNAL_NO, 1, @I_USER_ID,
            @I_APPROVER_ID, '1001', 0, '0',
            @I_USER_ID, GETDATE(), @I_REMARK,
            GETDATE(), @I_USER_ID, 'SP_WF_SUBMIT_REQUEST'
        );

        COMMIT TRAN;

        SET @O_RESULT = '{ "status": true, "message": "Workflow request created successfully.", "wf_id": "'+@I_WF_ID+'" }';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        SET @O_RESULT = '{ "status": false, "message": "[SP_WF_SUBMIT_REQUEST] | ' 
                        + REPLACE(ERROR_MESSAGE(),'"','') + '" }';
    END CATCH
END
GO

-- SP 2: Approval Action
-- ===================================================================
-- SP_WF_APPROVAL_ACTION: Process approval actions
-- New Flow:
-- 1. UPDATE existing Pending record
-- 2. INSERT next level Pending (if Approved & not final)
-- 3. Prevent duplicate actions by same user at same level
-- ===================================================================
CREATE OR ALTER PROCEDURE [dbo].[SP_WF_APPROVAL_ACTION]
(
    @I_USER_ID NVARCHAR(50),
    @I_REF_DOC_NO NVARCHAR(50),
    @I_KIND NVARCHAR(5),
    @I_STATUS NVARCHAR(2),
    @I_REMARK NVARCHAR(1000) = NULL,
    @O_RESULT NVARCHAR(MAX) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @I_WF_ID NVARCHAR(20);
    DECLARE @I_CURRENT_LEVEL NUMERIC(2,0);
    DECLARE @I_REQUIRED_LEVEL NUMERIC(2,0);
    DECLARE @I_GROUP NVARCHAR(50);
    DECLARE @I_SEQ_NO NUMERIC(3,0);
    DECLARE @I_IS_FINAL NVARCHAR(1);
    DECLARE @I_WF_INTERNAL_NO NVARCHAR(20);
    DECLARE @I_NEW_HEADER_STATUS NVARCHAR(2);
    DECLARE @I_NEXT_LEVEL NUMERIC(2,0);
    DECLARE @I_NEXT_APPROVER_ID NVARCHAR(50);
    DECLARE @I_PENDING_INTERNAL_NO NVARCHAR(20);

    BEGIN TRY
        BEGIN TRAN;

        IF @I_KIND <> '1002'
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "Invalid action type. Use I_KIND = 1002" }';
            ROLLBACK TRAN;
            RETURN;
        END

        IF @I_STATUS NOT IN ('1','2','3')
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "Invalid status. Use 1=Approved, 2=Unapproved, 3=Rejected" }';
            ROLLBACK TRAN;
            RETURN;
        END

        SELECT TOP 1
            @I_WF_ID = [I_WF_ID],
            @I_CURRENT_LEVEL = [I_CURRENT_LEVEL],
            @I_REQUIRED_LEVEL = [I_REQUIRED_LEVEL],
            @I_GROUP = [I_GROUP]
        FROM [dbo].[WFS_T_H]
        WHERE [I_REF_DOC_NO] = @I_REF_DOC_NO
        AND [I_STATUS] = '1';

        IF @I_WF_ID IS NULL
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No active workflow found." }';
            ROLLBACK TRAN;
            RETURN;
        END

        SELECT @I_IS_FINAL = ISNULL([I_IS_FINAL],'0')
        FROM [dbo].[USER_AUTHORITY]
        WHERE [I_USER_ID] = @I_USER_ID
        AND [I_GROUP] = @I_GROUP
        AND [I_LEVEL] = @I_CURRENT_LEVEL
        AND [I_KIND] = '1002'
        AND [I_ACTIVE_FLAG] = '1';

        IF @I_IS_FINAL IS NULL
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No approval authority at this level." }';
            ROLLBACK TRAN;
            RETURN;
        END

        IF EXISTS (
            SELECT 1 
            FROM [dbo].[WFS_T_D]
            WHERE [I_WF_ID] = @I_WF_ID
            AND [I_LEVEL] = @I_CURRENT_LEVEL
            AND [I_ACTION_BY] = @I_USER_ID
            AND [I_STATUS] IN ('1','2','3')
        )
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "You have already taken action at this level." }';
            ROLLBACK TRAN;
            RETURN;
        END

        SELECT TOP 1 
            @I_PENDING_INTERNAL_NO = [I_WF_INTERNAL_NO]
        FROM [dbo].[WFS_T_D]
        WHERE [I_WF_ID] = @I_WF_ID
        AND [I_LEVEL] = @I_CURRENT_LEVEL
        AND [I_STATUS] = '0'
        ORDER BY [I_SEQ_NO] DESC;

        IF @I_PENDING_INTERNAL_NO IS NULL
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No pending record found at this level." }';
            ROLLBACK TRAN;
            RETURN;
        END

        UPDATE [dbo].[WFS_T_D]
        SET [I_STATUS] = @I_STATUS,
            [I_ACTION_BY] = @I_USER_ID,
            [I_ACTION_DATE] = GETDATE(),
            [I_REMARK] = @I_REMARK,
            [UPDATED_BY] = @I_USER_ID,
            [UPDATED_DATE] = GETDATE(),
            [UPDATED_PRG_NM] = 'SP_WF_APPROVAL_ACTION',
            [MODIFY_COUNT] = ISNULL([MODIFY_COUNT], 0) + 1
        WHERE [I_WF_INTERNAL_NO] = @I_PENDING_INTERNAL_NO;

        IF @I_STATUS = '1'
        BEGIN
            IF @I_IS_FINAL = '1' OR @I_CURRENT_LEVEL >= @I_REQUIRED_LEVEL
            BEGIN
                SET @I_NEW_HEADER_STATUS = '0';
            END
            ELSE
            BEGIN
                SET @I_NEXT_LEVEL = @I_CURRENT_LEVEL + 1;
                
                SELECT TOP 1 @I_NEXT_APPROVER_ID = [I_USER_ID]
                FROM [dbo].[USER_AUTHORITY]
                WHERE [I_GROUP] = @I_GROUP
                AND [I_LEVEL] = @I_NEXT_LEVEL
                AND [I_KIND] = '1002'
                AND [I_ACTIVE_FLAG] = '1';

                IF @I_NEXT_APPROVER_ID IS NOT NULL
                BEGIN
                    SELECT @I_SEQ_NO = ISNULL(MAX([I_SEQ_NO]),0) + 1
                    FROM [dbo].[WFS_T_D] 
                    WHERE [I_WF_ID] = @I_WF_ID;

                    SET @I_WF_INTERNAL_NO = @I_WF_ID + '_' + RIGHT('000' + CAST(@I_SEQ_NO AS VARCHAR), 3);

                    INSERT INTO [dbo].[WFS_T_D] (
                        [I_WF_ID], [I_WF_INTERNAL_NO], [I_SEQ_NO],
                        [I_USER_ID], [I_APPROVER_ID], [I_KIND], [I_LEVEL], [I_STATUS],
                        [I_ACTION_BY], [I_ACTION_DATE], [I_REMARK],
                        [CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM]
                    )
                    VALUES (
                        @I_WF_ID, @I_WF_INTERNAL_NO, @I_SEQ_NO,
                        @I_USER_ID, @I_NEXT_APPROVER_ID, @I_KIND, @I_NEXT_LEVEL, '0',
                        NULL, NULL, NULL,
                        GETDATE(), @I_USER_ID, 'SP_WF_APPROVAL_ACTION'
                    );

                    SET @I_NEW_HEADER_STATUS = '1';
                END
                ELSE
                BEGIN
                    SET @I_NEW_HEADER_STATUS = '0';
                END
            END
        END
        ELSE IF @I_STATUS = '2'
        BEGIN
            IF @I_IS_FINAL = '1' OR @I_CURRENT_LEVEL >= @I_REQUIRED_LEVEL
            BEGIN
                SET @I_NEW_HEADER_STATUS = '0';
            END
            ELSE
            BEGIN
                SELECT @I_SEQ_NO = ISNULL(MAX([I_SEQ_NO]),0) + 1
                FROM [dbo].[WFS_T_D] 
                WHERE [I_WF_ID] = @I_WF_ID;

                SET @I_WF_INTERNAL_NO = @I_WF_ID + '_' + RIGHT('000' + CAST(@I_SEQ_NO AS VARCHAR), 3);

                INSERT INTO [dbo].[WFS_T_D] (
                    [I_WF_ID], [I_WF_INTERNAL_NO], [I_SEQ_NO],
                    [I_USER_ID], [I_APPROVER_ID], [I_KIND], [I_LEVEL], [I_STATUS],
                    [I_ACTION_BY], [I_ACTION_DATE], [I_REMARK],
                    [CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM]
                )
                VALUES (
                    @I_WF_ID, @I_WF_INTERNAL_NO, @I_SEQ_NO,
                    @I_USER_ID, @I_USER_ID, @I_KIND, @I_CURRENT_LEVEL, '2',
                    @I_USER_ID, GETDATE(), @I_REMARK,
                    GETDATE(), @I_USER_ID, 'SP_WF_APPROVAL_ACTION'
                );

                SET @I_NEW_HEADER_STATUS = '1';
            END
        END
        ELSE IF @I_STATUS = '3'
        BEGIN
            SET @I_NEW_HEADER_STATUS = '0';
        END

        UPDATE [dbo].[WFS_T_H]
        SET [I_CURRENT_LEVEL] = CASE 
                                    WHEN @I_STATUS = '1' AND @I_NEW_HEADER_STATUS = '1' 
                                    THEN @I_NEXT_LEVEL
                                    ELSE [I_CURRENT_LEVEL] 
                                END,
            [I_STATUS] = @I_NEW_HEADER_STATUS,
            [I_COMPLETED_DATE] = CASE 
                                    WHEN @I_NEW_HEADER_STATUS = '0' THEN GETDATE() 
                                    ELSE NULL 
                                 END,
            [UPDATED_BY] = @I_USER_ID,
            [UPDATED_DATE] = GETDATE(),
            [UPDATED_PRG_NM] = 'SP_WF_APPROVAL_ACTION',
            [MODIFY_COUNT] = ISNULL([MODIFY_COUNT], 0) + 1
        WHERE [I_WF_ID] = @I_WF_ID;

        COMMIT TRAN;

        SET @O_RESULT = '{ "status": true, "message": "Action completed successfully." }';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        SET @O_RESULT = '{ "status": false, "message": "[SP_WF_APPROVAL_ACTION] | ' 
                        + REPLACE(ERROR_MESSAGE(),'"','') + '" }';
    END CATCH
END
GO


-- ##  Usage Examples
-- ===================================================================
-- 1. Submit Request (Create Workflow)
-- ===================================================================
DECLARE @result NVARCHAR(MAX)
EXEC [dbo].[SP_WF_SUBMIT_REQUEST]
    @I_USER_ID = 'demo4',
    @I_REF_DOC_NO = 'QT202602',
    @I_GROUP = '1',
    @I_REMARK = N'Request for approval',
    @O_RESULT = @result OUTPUT
SELECT @result AS [Result]

-- ===================================================================
-- 2. Approved (Status = 1)
-- ===================================================================
DECLARE @result NVARCHAR(MAX)
EXEC [dbo].[SP_WF_APPROVAL_ACTION]
    @I_USER_ID = 'demo',
    @I_REF_DOC_NO = 'QT202602',
    @I_KIND = '1002',
    @I_STATUS = '1',
    @I_REMARK = N'อนุมัติ',
    @O_RESULT = @result OUTPUT
SELECT @result AS [Result]

-- ===================================================================
-- 3. Unapproved (Status = 2)
-- ===================================================================
DECLARE @result NVARCHAR(MAX)
EXEC [dbo].[SP_WF_APPROVAL_ACTION]
    @I_USER_ID = 'demo',
    @I_REF_DOC_NO = 'QT202602',
    @I_KIND = '1002',
    @I_STATUS = '2',
    @I_REMARK = N'ไม่อนุมัติ',
    @O_RESULT = @result OUTPUT
SELECT @result AS [Result]

-- ===================================================================
-- 4. Rejected (Status = 3)
-- ===================================================================
DECLARE @result NVARCHAR(MAX)
EXEC [dbo].[SP_WF_APPROVAL_ACTION]
    @I_USER_ID = 'demo',
    @I_REF_DOC_NO = 'QT202602',
    @I_KIND = '1002',
    @I_STATUS = '3',
    @I_REMARK = N'ปฏิเสธ เนื่องจากงบประมาณเกิน',
    @O_RESULT = @result OUTPUT
SELECT @result AS [Result]

-- ===================================================================
-- View Data
-- ===================================================================
-- Pending approvals for specific user
SELECT * FROM [dbo].[VW_WF_PENDING_APPROVAL_LIST]
WHERE [APPROVER_ID] = 'demo4'

-- My requests
SELECT * FROM [dbo].[VW_WF_MY_REQUEST_LIST]
WHERE [REQUESTER_ID] = 'demo'

-- Complete history
SELECT * FROM [dbo].[VW_WF_APPROVAL_HISTORY]
WHERE [I_REF_DOC_NO] = 'QT202602'
ORDER BY [I_SEQ_NO]
