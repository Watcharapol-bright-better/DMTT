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
-- VW_WF_LATEST_APPROVAL_STATUS: ดูสถานะล่าสุดของแต่ละ Workflow
-- ===================================================================
CREATE OR ALTER VIEW [dbo].[VW_WF_LATEST_APPROVAL_STATUS] AS
SELECT 
    [H].[I_WF_ID],
    [H].[I_REF_DOC_NO],
    [H].[I_GROUP],
    [H].[I_USER_ID] AS [REQUESTER_ID],
    [H].[I_CURRENT_LEVEL],
    [H].[I_REQUIRED_LEVEL],
    [H].[I_STATUS] AS [HEADER_STATUS],
    [H].[I_REQUEST_DATE],
    [H].[I_COMPLETED_DATE],
    
    -- ข้อมูลจาก Detail แถวล่าสุด (เฉพาะ I_KIND = '1002')
    [D].[I_WF_INTERNAL_NO] AS [LATEST_INTERNAL_NO],
    [D].[I_SEQ_NO] AS [LATEST_SEQ_NO],
    [D].[I_APPROVER_ID],
    [D].[I_LEVEL] AS [LATEST_LEVEL],
    [D].[I_STATUS] AS [LATEST_STATUS],
    CASE [D].[I_STATUS]
        WHEN '0' THEN 'Pending'
        WHEN '1' THEN 'Approved'
        WHEN '2' THEN 'Unapproved'
        WHEN '3' THEN 'Rejected'
        ELSE 'Unknown'
    END AS [LATEST_STATUS_TEXT],
    [D].[I_ACTION_BY],
    [D].[I_ACTION_DATE],
    [D].[I_REMARK] AS [LATEST_REMARK],
    [D].[CREATED_DATE] AS [LATEST_CREATED_DATE],
    
    -- ข้อมูล Approver จาก USER_AUTHORITY
    [UA].[I_EMAIL] AS [APPROVER_EMAIL],
    [UA].[I_IS_FINAL],
    
    -- ดึง Remark จาก Requester คำขอล่าสุด (I_KIND = '1001')
    (
        SELECT TOP 1 [I_REMARK] 
        FROM [dbo].[WFS_T_D] 
        WHERE [I_WF_ID] = [H].[I_WF_ID] 
        AND [I_KIND] = '1001' -- Requester
        ORDER BY [I_SEQ_NO] DESC  -- เปลี่ยนจาก ASC เป็น DESC
    ) AS [REQUEST_REMARK]
    
FROM [dbo].[WFS_T_H] [H]

-- JOIN กับ WFS_T_D แถวล่าสุดที่เป็น Approval Action (I_KIND = '1002')
INNER JOIN [dbo].[WFS_T_D] [D] 
    ON [D].[I_WF_ID] = [H].[I_WF_ID]
    AND [D].[I_KIND] = '1002'  -- เฉพาะ Approval Action
    AND [D].[CREATED_DATE] = (
        SELECT MAX([CREATED_DATE])
        FROM [dbo].[WFS_T_D]
        WHERE [I_WF_ID] = [H].[I_WF_ID]
        AND [I_KIND] = '1002'  -- เฉพาะ Approval Action
    )
    AND [D].[I_SEQ_NO] = (  -- เผื่อมี CREATED_DATE เท่ากัน ให้เอา SEQ_NO ล่าสุด
        SELECT MAX([I_SEQ_NO])
        FROM [dbo].[WFS_T_D]
        WHERE [I_WF_ID] = [H].[I_WF_ID]
        AND [I_KIND] = '1002' -- Approver
        AND [CREATED_DATE] = [D].[CREATED_DATE]
    )

-- JOIN กับ USER_AUTHORITY เพื่อดึงข้อมูล Approver
LEFT JOIN [dbo].[USER_AUTHORITY] [UA]
    ON [UA].[I_USER_ID] = [D].[I_APPROVER_ID]
    AND [UA].[I_GROUP] = [H].[I_GROUP]
    AND [UA].[I_LEVEL] = [D].[I_LEVEL]
    AND [UA].[I_KIND] = '1002' -- Approver
    AND [UA].[I_ACTIVE_FLAG] = '1'
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
        AND [I_KIND] = '1001' -- Requester
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
        WHEN '1001' THEN 'Requester'
        WHEN '1002' THEN 'Approver'
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
    DECLARE @I_WF_INTERNAL_NO_1 NVARCHAR(20);
    DECLARE @I_WF_INTERNAL_NO_2 NVARCHAR(20);
    DECLARE @I_SEQ_NO NUMERIC(3,0);
    DECLARE @IS_RESUBMIT BIT = 0;
    DECLARE @LAST_STATUS NVARCHAR(2);

    BEGIN TRY
        BEGIN TRAN;

        -- ตรวจสอบว่ามี Workflow เดิมหรือไม่
        SELECT TOP 1 
            @I_WF_ID = [I_WF_ID],
            @I_REQUIRED_LEVEL = [I_REQUIRED_LEVEL],
            @I_GROUP = [I_GROUP]
        FROM [dbo].[WFS_T_H]
        WHERE [I_REF_DOC_NO] = @I_REF_DOC_NO
        ORDER BY [CREATED_DATE] DESC;

        -- ถ้ามี Workflow อยู่แล้ว
        IF @I_WF_ID IS NOT NULL
        BEGIN
            -- เช็คสถานะล่าสุด
            SELECT TOP 1 @LAST_STATUS = [I_STATUS]
            FROM [dbo].[WFS_T_D]
            WHERE [I_WF_ID] = @I_WF_ID
            AND [I_KIND] = '1002' -- Approver
            ORDER BY [CREATED_DATE] DESC;

            -- ถ้าสถานะเป็น Unapproved (2) = อนุญาตให้ Re-submit
            IF @LAST_STATUS = '2'
            BEGIN
                SET @IS_RESUBMIT = 1;
            END
            -- ถ้าสถานะเป็น Pending (0) = ห้าม Submit ซ้ำ
            ELSE IF @LAST_STATUS = '0'
            BEGIN
                SET @O_RESULT = '{ "status": false, "message": "Workflow is still pending approval." }';
                ROLLBACK TRAN;
                RETURN;
            END
            -- ถ้าสถานะเป็น Approved (1) = ห้าม Submit ซ้ำ
            ELSE IF @LAST_STATUS IN ('1')
            BEGIN
                SET @O_RESULT = '{ "status": false, "message": "Workflow already completed. Cannot resubmit." }';
                ROLLBACK TRAN;
                RETURN;
            END
        END

        -- ถ้าไม่มี Workflow เดิม = สร้างใหม่
        IF @I_WF_ID IS NULL
        BEGIN
            -- Generate Workflow ID
            EXEC [dbo].[SP_RUN_NUMBERING_V1]
                @CodeType = N'DMTT_N_WF',
                @Format = N'WFyyyymmddxxxx',
                @GeneratedNo = @I_WF_ID OUTPUT;

            -- หา Level สูงสุดที่ต้องอนุมัติ
            SELECT @I_REQUIRED_LEVEL = MAX([I_LEVEL])
            FROM [dbo].[USER_AUTHORITY]
            WHERE [I_GROUP] = @I_GROUP
            AND [I_KIND] = '1002' -- Approver
            AND [I_ACTIVE_FLAG] = '1';

            IF ISNULL(@I_REQUIRED_LEVEL,0) = 0
            BEGIN
                SET @O_RESULT = '{ "status": false, "message": "No approver is assigned for this group." }';
                ROLLBACK TRAN;
                RETURN;
            END

            -- INSERT Header
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

            SET @I_SEQ_NO = 1;
        END
        ELSE -- Re-submit กรณี Unapproved
        BEGIN
            -- อัพเดท Header กลับมาเป็น Open
            UPDATE [dbo].[WFS_T_H]
            SET [I_STATUS] = '1',
                [I_CURRENT_LEVEL] = 1,
                [I_COMPLETED_DATE] = NULL,
                [UPDATED_BY] = @I_USER_ID,
                [UPDATED_DATE] = GETDATE(),
                [UPDATED_PRG_NM] = 'SP_WF_SUBMIT_REQUEST',
                [MODIFY_COUNT] = ISNULL([MODIFY_COUNT], 0) + 1
            WHERE [I_WF_ID] = @I_WF_ID;

            -- หา SEQ_NO ถัดไป
            SELECT @I_SEQ_NO = ISNULL(MAX([I_SEQ_NO]),0) + 1
            FROM [dbo].[WFS_T_D] 
            WHERE [I_WF_ID] = @I_WF_ID;
        END

        -- หาคนอนุมัติคนแรก (Level 1)
        SELECT TOP 1 @I_APPROVER_ID = [I_USER_ID]
        FROM [dbo].[USER_AUTHORITY]
        WHERE [I_GROUP] = @I_GROUP
        AND [I_LEVEL] = 1
        AND [I_KIND] = '1002' -- Approver
        AND [I_ACTIVE_FLAG] = '1';

        IF @I_APPROVER_ID IS NULL
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No approver found at level 1." }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- แถวที่ 1: Request Action (ผู้ขอ submit/resubmit)
        SET @I_WF_INTERNAL_NO_1 = @I_WF_ID + RIGHT('000' + CAST(@I_SEQ_NO AS VARCHAR), 3);
        
        INSERT INTO [dbo].[WFS_T_D] (
            [I_WF_ID], [I_WF_INTERNAL_NO], [I_SEQ_NO], [I_USER_ID],
            [I_APPROVER_ID], [I_KIND], [I_LEVEL], [I_STATUS],
            [I_ACTION_BY], [I_ACTION_DATE], [I_REMARK],
            [CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM]
        )
        VALUES (
            @I_WF_ID, @I_WF_INTERNAL_NO_1, @I_SEQ_NO, @I_USER_ID,
            NULL, '1001', 0, NULL,
            @I_USER_ID, GETDATE(), @I_REMARK,
            GETDATE(), @I_USER_ID, 'SP_WF_SUBMIT_REQUEST'
        );

        -- แถวที่ 2: Pending Approval สำหรับคนอนุมัติคนแรก
        SET @I_SEQ_NO = @I_SEQ_NO + 1;
        SET @I_WF_INTERNAL_NO_2 = @I_WF_ID + RIGHT('000' + CAST(@I_SEQ_NO AS VARCHAR), 3);
        
        INSERT INTO [dbo].[WFS_T_D] (
            [I_WF_ID], [I_WF_INTERNAL_NO], [I_SEQ_NO], [I_USER_ID],
            [I_APPROVER_ID], [I_KIND], [I_LEVEL], [I_STATUS],
            [I_ACTION_BY], [I_ACTION_DATE], [I_REMARK],
            [CREATED_DATE], [CREATED_BY], [CREATED_PRG_NM]
        )
        VALUES (
            @I_WF_ID, @I_WF_INTERNAL_NO_2, @I_SEQ_NO, @I_USER_ID,
            @I_APPROVER_ID, '1002', 1, '0',
            NULL, NULL, NULL,
            GETDATE(), @I_USER_ID, 'SP_WF_SUBMIT_REQUEST'
        );

        COMMIT TRAN;

        IF @IS_RESUBMIT = 1
            SET @O_RESULT = '{ "status": true, "message": "Workflow resubmitted successfully.", "wf_id": "'+@I_WF_ID+'", "approver": "'+@I_APPROVER_ID+'" }';
        ELSE
            SET @O_RESULT = '{ "status": true, "message": "Workflow request created successfully.", "wf_id": "'+@I_WF_ID+'", "approver": "'+@I_APPROVER_ID+'" }';

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
    DECLARE @LAST_REQUEST_SEQ NUMERIC(3,0);
    DECLARE @I_CURRENT_STATUS NVARCHAR(2);
    DECLARE @I_HEADER_STATUS NVARCHAR(2);

    BEGIN TRY
        BEGIN TRAN;

        IF @I_KIND <> '1002' -- Approver
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "Invalid action type. Use I_KIND = 1002" }';
            ROLLBACK TRAN;
            RETURN;
        END

        IF @I_STATUS NOT IN ('1','2','3')
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "Invalid status. Use 1=Approved, 2=Unapproved (Undo), 3=Rejected" }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- ดึงข้อมูล Workflow
        SELECT TOP 1
            @I_WF_ID = [I_WF_ID],
            @I_CURRENT_LEVEL = [I_CURRENT_LEVEL],
            @I_REQUIRED_LEVEL = [I_REQUIRED_LEVEL],
            @I_GROUP = [I_GROUP],
            @I_HEADER_STATUS = [I_STATUS]
        FROM [dbo].[WFS_T_H]
        WHERE [I_REF_DOC_NO] = @I_REF_DOC_NO
        ORDER BY [CREATED_DATE] DESC;

        IF @I_WF_ID IS NULL
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No workflow found." }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- ตรวจสอบสิทธิ์
        SELECT @I_IS_FINAL = ISNULL([I_IS_FINAL],'0')
        FROM [dbo].[USER_AUTHORITY]
        WHERE [I_USER_ID] = @I_USER_ID
        AND [I_GROUP] = @I_GROUP
        AND [I_LEVEL] = @I_CURRENT_LEVEL
        AND [I_KIND] = '1002' -- Approver
        AND [I_ACTIVE_FLAG] = '1';

        IF @I_IS_FINAL IS NULL
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No approval authority at this level." }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- หา SEQ_NO ของ Request ล่าสุด
        SELECT TOP 1 @LAST_REQUEST_SEQ = [I_SEQ_NO]
        FROM [dbo].[WFS_T_D]
        WHERE [I_WF_ID] = @I_WF_ID
        AND [I_KIND] = '1001' -- Requester
        ORDER BY [I_SEQ_NO] DESC;

        -- กรณี Status = 2 (Unapproved/Undo) - ยกเลิกการอนุมัติ
        IF @I_STATUS = '2'
        BEGIN
            -- หาแถวที่อนุมัติไปแล้ว (Status = 1)
            SELECT TOP 1 
                @I_PENDING_INTERNAL_NO = [I_WF_INTERNAL_NO],
                @I_CURRENT_STATUS = [I_STATUS]
            FROM [dbo].[WFS_T_D]
            WHERE [I_WF_ID] = @I_WF_ID
            AND [I_LEVEL] = @I_CURRENT_LEVEL
            AND [I_ACTION_BY] = @I_USER_ID
            AND [I_STATUS] = '1'
            AND [I_SEQ_NO] > @LAST_REQUEST_SEQ
            ORDER BY [I_SEQ_NO] DESC;

            IF @I_PENDING_INTERNAL_NO IS NULL
            BEGIN
                SET @O_RESULT = '{ "status": false, "message": "No approved record found to undo." }';
                ROLLBACK TRAN;
                RETURN;
            END

            -- ยกเลิกการอนุมัติ - รีเซ็ตกลับเป็น Pending
            UPDATE [dbo].[WFS_T_D]
            SET [I_STATUS] = '0',
                [I_ACTION_BY] = NULL,
                [I_ACTION_DATE] = NULL,
                [I_REMARK] = NULL,
                [UPDATED_BY] = @I_USER_ID,
                [UPDATED_DATE] = GETDATE(),
                [UPDATED_PRG_NM] = 'SP_WF_APPROVAL_ACTION',
                [MODIFY_COUNT] = ISNULL([MODIFY_COUNT], 0) + 1
            WHERE [I_WF_INTERNAL_NO] = @I_PENDING_INTERNAL_NO;

            -- อัพเดท Header กลับเป็น Open
            UPDATE [dbo].[WFS_T_H]
            SET [I_STATUS] = '1',
                [I_COMPLETED_DATE] = NULL,
                [UPDATED_BY] = @I_USER_ID,
                [UPDATED_DATE] = GETDATE(),
                [UPDATED_PRG_NM] = 'SP_WF_APPROVAL_ACTION',
                [MODIFY_COUNT] = ISNULL([MODIFY_COUNT], 0) + 1
            WHERE [I_WF_ID] = @I_WF_ID;

            COMMIT TRAN;
            SET @O_RESULT = '{ "status": true, "message": "Approval has been undone successfully." }';
            RETURN;
        END

        -- กรณี Status = 1 (Approved) หรือ 3 (Rejected)
        -- ตรวจสอบว่าเคยทำ action แล้วหรือยัง
        IF EXISTS (
            SELECT 1 
            FROM [dbo].[WFS_T_D]
            WHERE [I_WF_ID] = @I_WF_ID
            AND [I_LEVEL] = @I_CURRENT_LEVEL
            AND [I_ACTION_BY] = @I_USER_ID
            AND [I_STATUS] IN ('1','3')
            AND [I_SEQ_NO] > @LAST_REQUEST_SEQ
        )
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "You have already taken action at this level." }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- ตรวจสอบว่า Workflow ยัง Open อยู่หรือไม่
        IF @I_HEADER_STATUS <> '1'
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "Workflow is not active." }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- หา Pending record
        SELECT TOP 1 
            @I_PENDING_INTERNAL_NO = [I_WF_INTERNAL_NO]
        FROM [dbo].[WFS_T_D]
        WHERE [I_WF_ID] = @I_WF_ID
        AND [I_LEVEL] = @I_CURRENT_LEVEL
        AND [I_STATUS] = '0'
        AND [I_SEQ_NO] > @LAST_REQUEST_SEQ
        ORDER BY [I_SEQ_NO] DESC;

        IF @I_PENDING_INTERNAL_NO IS NULL
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No pending record found at this level." }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- UPDATE Pending record
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

        -- ถ้าอนุมัติ (Status = 1)
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
                AND [I_KIND] = '1002' -- Approver
                AND [I_ACTIVE_FLAG] = '1';

                IF @I_NEXT_APPROVER_ID IS NOT NULL
                BEGIN
                    SELECT @I_SEQ_NO = ISNULL(MAX([I_SEQ_NO]),0) + 1
                    FROM [dbo].[WFS_T_D] 
                    WHERE [I_WF_ID] = @I_WF_ID;

                    SET @I_WF_INTERNAL_NO = @I_WF_ID + RIGHT('000' + CAST(@I_SEQ_NO AS VARCHAR), 3);

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
        -- ถ้าปฏิเสธ (Status = 3)
        ELSE IF @I_STATUS = '3'
        BEGIN
            SET @I_NEW_HEADER_STATUS = '0';
        END

        -- UPDATE Header
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
    @I_REF_DOC_NO = 'CN2602240002',
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
    @I_REF_DOC_NO = 'CN2602240002',
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
    @I_REF_DOC_NO = 'CN2602240002',
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
    @I_REF_DOC_NO = 'CN2602240002',
    @I_KIND = '1002',
    @I_STATUS = '3',
    @I_REMARK = N'ปฏิเสธ เนื่องจากงบประมาณเกิน',
    @O_RESULT = @result OUTPUT
SELECT @result AS [Result]

-- ===================================================================
-- View Data
-- ===================================================================
-- ดูข้อมูลทั้งหมดที่รอ demo อนุมัติ
SELECT * FROM [dbo].[VW_WF_LATEST_APPROVAL_STATUS]
WHERE [I_APPROVER_ID] = 'demo'

-- กรองเฉพาะสถานะ Pending
SELECT * FROM [dbo].[VW_WF_LATEST_APPROVAL_STATUS]
WHERE [I_APPROVER_ID] = 'demo'
AND [LATEST_STATUS] = '0'

-- กรองเฉพาะสถานะ Approved
SELECT * FROM [dbo].[VW_WF_LATEST_APPROVAL_STATUS]
WHERE [I_APPROVER_ID] = 'demo'
AND [LATEST_STATUS] = '1'

-- กรองเฉพาะสถานะ Unapproved
SELECT * FROM [dbo].[VW_WF_LATEST_APPROVAL_STATUS]
WHERE [I_APPROVER_ID] = 'demo'
AND [LATEST_STATUS] = '2'

-- กรองหลายสถานะพร้อมกัน (Pending + Unapproved)
SELECT * FROM [dbo].[VW_WF_LATEST_APPROVAL_STATUS]
WHERE [I_APPROVER_ID] = 'demo'
AND [LATEST_STATUS] IN ('0', '2')

-- My requests
SELECT * FROM [dbo].[VW_WF_MY_REQUEST_LIST]
WHERE [REQUESTER_ID] = 'demo'

-- Complete history
SELECT * FROM [dbo].[VW_WF_APPROVAL_HISTORY]
WHERE [I_REF_DOC_NO] = 'QT202602'
ORDER BY [I_SEQ_NO]
