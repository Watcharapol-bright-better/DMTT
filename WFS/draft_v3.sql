
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

CREATE TABLE [dbo].[WFS_T_H](
	[I_WF_ID] [nvarchar](20) NOT NULL,
	[I_REF_DOC_NO] [nvarchar](50) NOT NULL,
	[I_GROUP] [nvarchar](50) NOT NULL,
	[I_USER_ID] [nvarchar](50) NOT NULL, -- User ID ผู้ส่งคำขอ (Requester)
	[I_CURRENT_LEVEL] [numeric](2, 0) NULL,
	[I_REQUIRED_LEVEL] [numeric](2, 0) NULL,
	[I_STATUS] [nvarchar](2) NULL, -- 0: Closs, 1: Open
	[I_REQUEST_DATE] [datetime] NULL,
	[I_COMPLETED_DATE] [datetime] NULL,
	[CREATED_DATE] [datetime] NULL,
	[CREATED_BY] [nvarchar](10) NULL,
	[CREATED_PRG_NM] [nvarchar](50) NULL,
	[UPDATED_DATE] [datetime] NULL,
	[UPDATED_BY] [nvarchar](10) NULL,
	[UPDATED_PRG_NM] [nvarchar](50) NULL,
    [MODIFY_COUNT] NUMERIC(10,0) NULL,
 CONSTRAINT [PK_WFS_T_H] PRIMARY KEY CLUSTERED 
(
	[I_WF_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[WFS_T_D](
	[I_WF_ID] [nvarchar](20) NOT NULL,
	[I_WF_INTERNAL_NO] [nvarchar](20) NOT NULL,
	[I_SEQ_NO] [numeric](3, 0) NOT NULL,
	[I_USER_ID] [nvarchar](50) NOT NULL, -- User ID ผู้ส่งคำขอ (Requester)
    [I_APPROVER_ID] [nvarchar](50) NOT NULL,
	[I_KIND] [nvarchar](5) NOT NULL,
	[I_LEVEL] [numeric](2, 0) NULL, 
    [I_STATUS] [nvarchar](2) NULL, --  0: Pending, 1: Approved, 2: Unapproved, 3: Rejected
	[I_ACTION_BY] [nvarchar](20) NULL,
    [I_ACTION_DATE] [datetime] NULL,
	[I_REMARK] [nvarchar](1000) NULL,
	[CREATED_DATE] [datetime] NULL,
	[CREATED_BY] [nvarchar](10) NULL,
	[CREATED_PRG_NM] [nvarchar](50) NULL,
	[UPDATED_DATE] [datetime] NULL,
	[UPDATED_BY] [nvarchar](10) NULL,
	[UPDATED_PRG_NM] [nvarchar](50) NULL,
    [MODIFY_COUNT] NUMERIC(10,0) NULL,
 CONSTRAINT [PK_WFS_T_D] PRIMARY KEY CLUSTERED 
(
	[I_WF_ID] ASC,
	[I_WF_INTERNAL_NO] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


-- ### Views 
-- 1. VW_MY_PENDING_APPROVALS - รายการที่ต้องอนุมัติ
-- ดูรายการที่ต้องอนุมัติของ MGR001
-- SELECT * FROM VW_MY_PENDING_APPROVALS 
-- WHERE Approver_ID = N'MGR001'
-- ORDER BY I_PRIORITY DESC, I_REQUEST_DATE ASC;
CREATE OR ALTER VIEW VW_MY_PENDING_APPROVALS AS
SELECT 
    I_WF_ID,
    I_REF_DOC_NO,
    I_GROUP,
    Requester_ID,
    I_CURRENT_LEVEL,
    I_REQUIRED_LEVEL,
    I_STATUS,
    STATUS_TEXT,
    I_PRIORITY,
    I_REQUEST_DATE,
    Approver_ID,
    Approver_EMAIL,
    Approver_LEVEL,
    I_IS_FINAL,
    REQUEST_REMARK
FROM (
    SELECT 
        H.I_WF_ID,
        H.I_REF_DOC_NO,
        H.I_GROUP,
        H.I_USER_ID AS Requester_ID,
        H.I_CURRENT_LEVEL,
        H.I_REQUIRED_LEVEL,
        H.I_STATUS,
        CASE H.I_STATUS
            WHEN '0' THEN 'PENDING'
            WHEN '3' THEN 'IN_PROGRESS'
        END AS STATUS_TEXT,
        H.I_PRIORITY,
        H.I_REQUEST_DATE,
        UA.I_USER_ID AS Approver_ID,
        UA.I_EMAIL AS Approver_EMAIL,
        UA.I_LEVEL AS Approver_LEVEL,
        UA.I_IS_FINAL,
        (SELECT TOP 1 I_REMARK FROM WFS_T_D WHERE I_WF_ID = H.I_WF_ID AND I_KIND = '1001' ORDER BY I_SEQ_NO) AS REQUEST_REMARK,
        ROW_NUMBER() OVER(
            PARTITION BY H.I_WF_ID, UA.I_USER_ID 
            ORDER BY UA.I_AUTH_ID
        ) AS RN
    FROM WFS_T_H H
    LEFT JOIN USER_AUTHORITY UA 
        ON UA.I_GROUP = H.I_GROUP
        AND UA.I_LEVEL = H.I_CURRENT_LEVEL
        AND UA.I_KIND = '1002'
        AND UA.I_ACTIVE_FLAG = '1'
    WHERE H.I_STATUS IN ('0', '3') -- PENDING, IN_PROGRESS
) X
WHERE RN = 1
GO 

-- 2. VW_MY_REQUESTS - รายการที่ฉันส่งคำขอ
-- ดูรายการที่ USER001 ส่งคำขอ
-- SELECT * FROM VW_MY_REQUESTS 
-- WHERE Requester_ID = 'USER001'
-- ORDER BY I_REQUEST_DATE DESC;
CREATE OR ALTER VIEW VW_MY_REQUESTS AS
SELECT 
    H.I_WF_ID,
    H.I_REF_DOC_NO,
    H.I_GROUP,
    H.I_USER_ID AS Requester_ID,
    H.I_CURRENT_LEVEL,
    H.I_REQUIRED_LEVEL,
    H.I_STATUS,
    CASE H.I_STATUS
        WHEN '0' THEN 'Pending' 
        WHEN '1' THEN 'Approved' 
        WHEN '2' THEN 'Rejected' 
        WHEN '3' THEN 'In Progress' 
        WHEN '9' THEN 'Cancelled' 
    END AS IS_STATUS,
    H.I_PRIORITY,
    H.I_REQUEST_DATE,
    H.I_COMPLETED_DATE,
    -- ข้อมูลจาก REQUEST
    (SELECT TOP 1 I_REMARK FROM WFS_T_D WHERE I_WF_ID = H.I_WF_ID AND I_KIND = '1001' ORDER BY I_SEQ_NO) AS REQUEST_REMARK,
    -- ข้อมูลการดำเนินการล่าสุด
    (SELECT TOP 1 I_USER_ID FROM WFS_T_D WHERE I_WF_ID = H.I_WF_ID ORDER BY I_SEQ_NO DESC) AS LAST_ACTION_BY,
    (SELECT TOP 1 I_REMARK FROM WFS_T_D WHERE I_WF_ID = H.I_WF_ID ORDER BY I_SEQ_NO DESC) AS LAST_REMARK
FROM WFS_T_H H;
GO

-- 3. VW_WORKFLOW_HISTORY - ประวัติการอนุมัติ
-- ดูประวัติของเอกสาร QT202602
-- SELECT * FROM VW_WORKFLOW_HISTORY 
-- WHERE I_REF_DOC_NO = 'QT202602'
-- ORDER BY I_SEQ_NO;
CREATE OR ALTER VIEW VW_WORKFLOW_HISTORY AS
SELECT 
    H.I_WF_ID,
    H.I_REF_DOC_NO,
    H.I_GROUP,
    H.I_USER_ID AS Requester_ID,
    H.I_STATUS AS CURRENT_STATUS,
    D.I_INTERNAL_NO,
    D.I_SEQ_NO,
    D.I_USER_ID,
    D.I_KIND,
    CASE D.I_KIND
        WHEN '1000' THEN 'CANCEL' 
        WHEN '1001' THEN 'REQUEST'
        WHEN '1002' THEN 'APPROVE'
        WHEN '1003' THEN 'REJECT'
    END AS ACTION_TYPE,
    D.I_LEVEL,
    D.I_ACTION_DATE,
    D.I_REMARK
FROM WFS_T_H H
INNER JOIN WFS_T_D D ON H.I_WF_ID = D.I_WF_ID;
GO


-- 1. SP_WF_REQUEST - ส่งคำขออนุมัติ (I_KIND = '1001')
-- DECLARE @data NVARCHAR(MAX)
-- EXEC SP_WF_REQUEST
--     @I_USER_ID = 'USER001',
--     @I_REF_DOC_NO = 'QT202602',
--     @I_GROUP = 'IT',
--     @I_PRIORITY = 'N',
--     @I_REMARK = N'ขออนุมัติซื้อ Laptop',
--     @O_RESULT = @data OUTPUT
-- SELECT @data AS [Result]
CREATE OR ALTER PROCEDURE SP_WF_REQUEST
(
    @I_USER_ID NVARCHAR(50),
    @I_REF_DOC_NO NVARCHAR(50),
    @I_GROUP NVARCHAR(50),
    @I_PRIORITY NVARCHAR(1) = 'N',
    @I_REMARK NVARCHAR(500) = NULL,
    @O_RESULT NVARCHAR(MAX) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @I_WF_ID NVARCHAR(20);
    DECLARE @I_REQUIRED_LEVEL NUMERIC(2,0);

    BEGIN TRY
        BEGIN TRAN;

        -- Check existing active workflow
        IF EXISTS (
            SELECT 1 FROM WFS_T_H
            WHERE I_REF_DOC_NO = @I_REF_DOC_NO
              AND I_STATUS IN ('0','3')
        )
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "Workflow already exists for this ['+@I_REF_DOC_NO+']" }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- Generate WF_ID
        EXEC SP_RUN_NUMBERING_V1
            @CodeType = N'DMTT_N_WF',
            @Format = N'WFyyyymmddxxxx',
            @GeneratedNo = @I_WF_ID OUTPUT;

        -- Get max approval level
        SELECT @I_REQUIRED_LEVEL = MAX(I_LEVEL)
        FROM USER_AUTHORITY
        WHERE I_GROUP = @I_GROUP
          AND I_KIND = '1002'
          AND I_ACTIVE_FLAG = '1';

        IF ISNULL(@I_REQUIRED_LEVEL,0) = 0
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No approver is assigned for this group. Please set it in User Authority." }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- Insert header
        INSERT INTO WFS_T_H
        (
            I_WF_ID, I_REF_DOC_NO, I_GROUP, I_USER_ID,
            I_CURRENT_LEVEL, I_REQUIRED_LEVEL, I_STATUS, I_PRIORITY,
            CREATED_BY, CREATED_PRG_NM
        )
        VALUES
        (
            @I_WF_ID, @I_REF_DOC_NO, @I_GROUP, @I_USER_ID,
            1, @I_REQUIRED_LEVEL, '0', @I_PRIORITY,
            @I_USER_ID, 'SP_WF_REQUEST'
        );

        -- Insert request detail
        INSERT INTO WFS_T_D
        (
            I_WF_ID, I_INTERNAL_NO, I_SEQ_NO, I_USER_ID,
            I_KIND, I_LEVEL, I_REMARK,
            CREATED_BY, CREATED_PRG_NM
        )
        VALUES
        (
            @I_WF_ID, @I_WF_ID + '_001', 1, @I_USER_ID,
            '1001', 0, @I_REMARK,
            @I_USER_ID, 'SP_WF_REQUEST'
        );

        COMMIT TRAN;

        SET @O_RESULT = '{ "status": true, "message": "Workflow request created successfully." }';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        SET @O_RESULT = '{ "status": false, "message": "[SP_WF_REQUEST] | ' 
                        + REPLACE(ERROR_MESSAGE(),'"','') + '" }';
    END CATCH
END
GO



-- 2. SP_WF_CANCEL - ยกเลิกคำขอ (I_KIND = '1000')
-- EXEC SP_WF_CANCEL
--     @I_USER_ID = 'USER001',
--     @I_REF_DOC_NO = 'QT202602',
--     @I_REMARK = 'ขอยกเลิก เนื่องจากข้อมูลผิดพลาด';
CREATE OR ALTER PROCEDURE SP_WF_CANCEL
(
    @I_USER_ID NVARCHAR(50),
    @I_REF_DOC_NO NVARCHAR(50),
    @I_REMARK NVARCHAR(500) = NULL,
    @O_RESULT NVARCHAR(MAX) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @I_WF_ID NVARCHAR(20);
    DECLARE @I_Requester_ID NVARCHAR(50);
    DECLARE @I_SEQ_NO INT;

    BEGIN TRY
        BEGIN TRAN;

        -- Get active workflow
        SELECT TOP 1
            @I_WF_ID = I_WF_ID,
            @I_Requester_ID = I_USER_ID
        FROM WFS_T_H
        WHERE I_REF_DOC_NO = @I_REF_DOC_NO
          AND I_STATUS IN ('0','3')
        ORDER BY I_REQUEST_DATE DESC;

        IF @I_WF_ID IS NULL
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No active workflow found." }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- Only requester can cancel
        IF @I_Requester_ID <> @I_USER_ID
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "Only requester can cancel this workflow." }';
            ROLLBACK TRAN;
            RETURN;
        END

        SELECT @I_SEQ_NO = ISNULL(MAX(I_SEQ_NO),0)+1
        FROM WFS_T_D WHERE I_WF_ID = @I_WF_ID;

        INSERT INTO WFS_T_D
        (
            I_WF_ID, I_INTERNAL_NO, I_SEQ_NO, I_USER_ID,
            I_KIND, I_REMARK,
            CREATED_BY, CREATED_PRG_NM
        )
        VALUES
        (
            @I_WF_ID,
            @I_WF_ID + '_' + RIGHT('000'+CAST(@I_SEQ_NO AS VARCHAR),3),
            @I_SEQ_NO,
            @I_USER_ID,
            '1000',
            @I_REMARK,
            @I_USER_ID,
            'SP_WF_CANCEL'
        );

        UPDATE WFS_T_H
        SET I_STATUS = '9',
            I_COMPLETED_DATE = GETDATE(),
            UPDATED_BY = @I_USER_ID,
            UPDATED_DATE = GETDATE(),
            UPDATED_PRG_NM = 'SP_WF_CANCEL'
        WHERE I_WF_ID = @I_WF_ID;

        COMMIT TRAN;

        SET @O_RESULT = '{ "status": true, "message": "Workflow cancelled successfully." }';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        SET @O_RESULT = '{ "status": false, "message": "[SP_WF_CANCEL] | ' 
                        + REPLACE(ERROR_MESSAGE(),'"','') + '" }';
    END CATCH
END
GO




-- 3. SP_WF_APPROVAL_ACTION - อนุมัติ/ปฏิเสธ (I_KIND = '1002', '1003')
-- อนุมัติ
-- EXEC SP_WF_APPROVAL_ACTION
    -- @I_USER_ID = 'MGR001',
    -- @I_REF_DOC_NO = 'QT202602',
    -- @I_KIND = '1002',
    -- @I_REMARK = 'อนุมัติ';

-- ปฏิเสธ
-- EXEC SP_WF_APPROVAL_ACTION
--     @I_USER_ID = 'MGR001',
--     @I_REF_DOC_NO = 'QT202602',
--     @I_KIND = '1003',
--     @I_REMARK = N'งบประมาณเกิน';
CREATE OR ALTER PROCEDURE SP_WF_APPROVAL_ACTION
(
    @I_USER_ID NVARCHAR(50),
    @I_REF_DOC_NO NVARCHAR(50),
    @I_KIND NUMERIC(5,0), -- '1002'=APPROVE, '1003'=REJECT
    @I_REMARK NVARCHAR(500) = NULL,
    @O_RESULT NVARCHAR(MAX) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @I_WF_ID NVARCHAR(20);
    DECLARE @I_CURRENT_LEVEL INT;
    DECLARE @I_REQUIRED_LEVEL INT;
    DECLARE @I_GROUP NVARCHAR(50);
    DECLARE @I_SEQ_NO INT;
    DECLARE @I_IS_FINAL NVARCHAR(1)='N';
    DECLARE @I_NEW_STATUS NVARCHAR(2);

    BEGIN TRY
        BEGIN TRAN;

        IF @I_KIND NOT IN ('1002','1003')
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "Invalid action type." }';
            ROLLBACK TRAN;
            RETURN;
        END

        SELECT TOP 1
            @I_WF_ID = I_WF_ID,
            @I_CURRENT_LEVEL = I_CURRENT_LEVEL,
            @I_REQUIRED_LEVEL = I_REQUIRED_LEVEL,
            @I_GROUP = I_GROUP
        FROM WFS_T_H
        WHERE I_REF_DOC_NO = @I_REF_DOC_NO
          AND I_STATUS IN ('0','3');

        IF @I_WF_ID IS NULL
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No active workflow found." }';
            ROLLBACK TRAN;
            RETURN;
        END

        -- Validate authority
        SELECT @I_IS_FINAL = ISNULL(I_IS_FINAL,'N')
        FROM USER_AUTHORITY
        WHERE I_USER_ID = @I_USER_ID
          AND I_GROUP = @I_GROUP
          AND I_LEVEL = @I_CURRENT_LEVEL
          AND I_KIND = '1002'
          AND I_ACTIVE_FLAG='1';

        IF @I_IS_FINAL IS NULL
        BEGIN
            SET @O_RESULT = '{ "status": false, "message": "No approval authority at this level." }';
            ROLLBACK TRAN;
            RETURN;
        END

        SELECT @I_SEQ_NO = ISNULL(MAX(I_SEQ_NO),0)+1
        FROM WFS_T_D WHERE I_WF_ID=@I_WF_ID;

        INSERT INTO WFS_T_D
        (
            I_WF_ID, I_INTERNAL_NO, I_SEQ_NO,
            I_USER_ID, I_KIND, I_LEVEL, I_REMARK,
            CREATED_BY, CREATED_PRG_NM
        )
        VALUES
        (
            @I_WF_ID,
            @I_WF_ID + '_' + RIGHT('000'+CAST(@I_SEQ_NO AS VARCHAR),3),
            @I_SEQ_NO,
            @I_USER_ID,
            @I_KIND,
            @I_CURRENT_LEVEL,
            N''+@I_REMARK,
            @I_USER_ID,
            'SP_WF_APPROVAL_ACTION'
        );

        IF @I_KIND = '1003'
            SET @I_NEW_STATUS = '2';
        ELSE IF @I_IS_FINAL='Y' OR @I_CURRENT_LEVEL>=@I_REQUIRED_LEVEL
            SET @I_NEW_STATUS = '1';
        ELSE
            SET @I_NEW_STATUS = '3';

        UPDATE WFS_T_H
        SET I_CURRENT_LEVEL = CASE 
                                WHEN @I_NEW_STATUS='3' THEN I_CURRENT_LEVEL+1 
                                ELSE I_CURRENT_LEVEL 
                              END,
            I_STATUS=@I_NEW_STATUS,
            I_COMPLETED_DATE=CASE 
                                WHEN @I_NEW_STATUS IN ('1','2') THEN GETDATE() 
                                ELSE NULL 
                             END,
            UPDATED_BY=@I_USER_ID,
            UPDATED_DATE=GETDATE(),
            UPDATED_PRG_NM='SP_WF_APPROVAL_ACTION'
        WHERE I_WF_ID=@I_WF_ID;

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
