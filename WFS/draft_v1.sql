CREATE TABLE USER_AUTHORITY (
    I_AUTH_ID NVARCHAR(20) NOT NULL,          -- รหัสสิทธิ์ (Running Number): UA001, UA002, ...
    I_USER_ID NVARCHAR(50) NOT NULL,          -- รหัสผู้ใช้: USER001, MGR001, DIR001, ...
    I_EMAIL NVARCHAR(100),                    -- อีเมลสำหรับแจ้งเตือน
    I_KIND NVARCHAR(5) NOT NULL,             -- ประเภทผู้ใช้: 1001=REQUESTER (ผู้ขออนุมัติ), 1002=APPROVER (ผู้อนุมัติ)
    I_GROUP NVARCHAR(50) NOT NULL,            -- กลุ่มแผนก (IT, HR, Sales, etc..)
    I_LEVEL NUMERIC(2,0) DEFAULT 0,           -- ระดับการอนุมัติ: 0=Requester, 1=Manager, 2=Director, 3=CEO, ...
    I_IS_REQUIRED NVARCHAR(1) DEFAULT 'Y',    -- บังคับต้องอนุมัติหรือไม่: Y=บังคับ, N=Optional (สามารถ skip ได้)
    I_IS_FINAL NVARCHAR(1) DEFAULT 'N',       -- เป็นขั้นสุดท้ายหรือไม่: Y=อนุมัติแล้วจบเลย, N=ต้องไปขั้นถัดไป
    I_PARALLEL_GROUP NVARCHAR(20),            -- กลุ่มอนุมัติพร้อมกัน: G1, G2 (ผู้ใน Group เดียวกันต้องอนุมัติทุกคน)
    I_ACTIVE_FLAG NVARCHAR(1) DEFAULT 'Y',    -- สถานะใช้งาน: Y=ใช้งาน, N=ปิดการใช้งาน
    CREATED_DATE DATETIME DEFAULT GETDATE(),
    CREATED_BY NVARCHAR(10),
    CREATED_PRG_NM NVARCHAR(50),
    UPDATED_DATE DATETIME,
    UPDATED_BY NVARCHAR(10),
    UPDATED_PRG_NM NVARCHAR(50),
    CONSTRAINT PK_USER_AUTHORITY PRIMARY KEY CLUSTERED (I_AUTH_ID ASC)
) ON [PRIMARY];
GO

CREATE INDEX IX_USER_AUTHORITY_LOOKUP ON USER_AUTHORITY(I_GROUP, I_KIND, I_LEVEL, I_ACTIVE_FLAG);
CREATE INDEX IX_USER_AUTHORITY_USER ON USER_AUTHORITY(I_USER_ID, I_ACTIVE_FLAG);
GO


CREATE TABLE WF_H (
    I_WF_ID NVARCHAR(20) NOT NULL,            -- PK: Workflow ID (WF001, WF002, ...)
    I_REF_DOC_NO NVARCHAR(50) NOT NULL,       -- อ้างอิงเอกสารต้นทาง (PR-2024-001, PO-001, ...)
    I_GROUP NVARCHAR(50) NOT NULL,            -- กลุ่ม Workflow (IT, HR, Sales, ...)
    I_USER_ID NVARCHAR(50) NOT NULL,          -- ผู้ขออนุมัติ (USER001, EMP001, ...)
    I_CURRENT_LEVEL NUMERIC(2,0) DEFAULT 1,   -- ระดับปัจจุบัน (1, 2, 3, ...)
    I_REQUIRED_LEVEL NUMERIC(2,0),            -- ระดับสูงสุดที่ต้องผ่าน (JS คำนวณ)
    I_STATUS NVARCHAR(2) DEFAULT '0',         -- 0:PENDING, 1:APPROVED, 2:REJECTED, 3:IN_PROGRESS, 9:CANCELLED
    I_PRIORITY NVARCHAR(1) DEFAULT 'N',       -- Y=เร่งด่วน, N=ปกติ
    I_REQUEST_DATE DATETIME DEFAULT GETDATE(),-- วันที่ส่งคำขอ
    I_COMPLETED_DATE DATETIME,                -- วันที่เสร็จสิ้น
    CREATED_DATE DATETIME DEFAULT GETDATE(),
    CREATED_BY NVARCHAR(10),
    CREATED_PRG_NM NVARCHAR(50),
    UPDATED_DATE DATETIME,
    UPDATED_BY NVARCHAR(10),
    UPDATED_PRG_NM NVARCHAR(50),
    CONSTRAINT PK_WF_H PRIMARY KEY CLUSTERED (I_WF_ID ASC)
) ON [PRIMARY];
GO

CREATE INDEX IX_WF_H_STATUS ON WF_H(I_STATUS, I_GROUP, I_CURRENT_LEVEL);
CREATE INDEX IX_WF_H_REF ON WF_H(I_REF_DOC_NO);
CREATE INDEX IX_WF_H_USER ON WF_H(I_USER_ID, I_REQUEST_DATE DESC);
GO


CREATE TABLE WF_D (
    I_WF_ID NVARCHAR(20) NOT NULL,            -- PK (Part 1): Workflow ID
    I_INTERNAL_NO NVARCHAR(20) NOT NULL,      -- PK (Part 2): Running number (WF001_001, WF001_002, ...)
    I_SEQ_NO NUMERIC(3,0) NOT NULL,           -- ลำดับการกระทำ (1, 2, 3, ...)
    I_USER_ID NVARCHAR(50) NOT NULL,          -- ผู้ดำเนินการ
    I_KIND NUMERIC(5,0) NOT NULL,             -- 1001:REQUEST, 1002:APPROVE, 1003:REJECT, 1004:CANCEL
    I_LEVEL NUMERIC(2,0),                     -- ระดับที่ดำเนินการ
    I_ACTION_DATE DATETIME DEFAULT GETDATE(), -- วันเวลาที่กระทำ
    I_REMARK NVARCHAR(500),                   -- หมายเหตุ
    CREATED_DATE DATETIME DEFAULT GETDATE(),
    CREATED_BY NVARCHAR(10),
    CREATED_PRG_NM NVARCHAR(50),
    UPDATED_DATE DATETIME,
    UPDATED_BY NVARCHAR(10),
    UPDATED_PRG_NM NVARCHAR(50),
    CONSTRAINT PK_WF_D PRIMARY KEY CLUSTERED (I_WF_ID ASC, I_INTERNAL_NO ASC)
) ON [PRIMARY];
GO

CREATE INDEX IX_WF_D_SEQ ON WF_D(I_WF_ID, I_SEQ_NO);
CREATE INDEX IX_WF_D_USER ON WF_D(I_USER_ID, I_ACTION_DATE DESC);
CREATE INDEX IX_WF_D_KIND ON WF_D(I_WF_ID, I_KIND);
GO


-- ////////////////////

-- Approve
EXEC SP_APPROVE_REJECT_WORKFLOW
    @I_WF_ID = 'WF001',
    @I_USER_ID = 'MGR001',
    @I_ACTION = 1002,
    @I_REMARK = 'อนุมัติ',
    @I_BY = 'MGR001';

-- Reject
EXEC SP_APPROVE_REJECT_WORKFLOW
    @I_WF_ID = 'WF001',
    @I_USER_ID = 'MGR001',
    @I_ACTION = 1003,
    @I_REMARK = 'งบประมาณเกิน',
    @I_BY = 'MGR001';


-- ////////////////////
CREATE VIEW VW_PENDING_APPROVALS AS
SELECT 
    H.I_WF_ID,
    H.I_REF_DOC_NO,
    H.I_GROUP,
    H.I_USER_ID AS REQUESTER_ID,
    H.I_CURRENT_LEVEL,
    H.I_REQUIRED_LEVEL,
    H.I_STATUS,
    H.I_PRIORITY,
    H.I_REQUEST_DATE,
    UA.I_USER_ID AS APPROVER_ID,
    UA.I_EMAIL AS APPROVER_EMAIL,
    UA.I_LEVEL AS APPROVER_LEVEL,
    UA.I_IS_FINAL,
    UA.I_PARALLEL_GROUP
FROM WF_H H
INNER JOIN USER_AUTHORITY UA 
    ON UA.I_GROUP = H.I_GROUP
    AND UA.I_LEVEL = H.I_CURRENT_LEVEL
    AND UA.I_KIND = 1002
    AND UA.I_ACTIVE_FLAG = 'Y'
WHERE H.I_STATUS IN ('0', '3');  -- PENDING, IN_PROGRESS
GO

-- ////////////////////
CREATE OR ALTER PROCEDURE SP_APPROVE_REJECT_WORKFLOW
    @I_WF_ID NVARCHAR(20),
    @I_USER_ID NVARCHAR(50),
    @I_ACTION NUMERIC(5,0),                   -- 1002:APPROVE, 1003:REJECT
    @I_REMARK NVARCHAR(500) = NULL,
    @I_BY NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @I_CURRENT_LEVEL NUMERIC(2,0);
    DECLARE @I_REQUIRED_LEVEL NUMERIC(2,0);
    DECLARE @I_NEW_STATUS NVARCHAR(2);
    DECLARE @I_SEQ_NO NUMERIC(3,0);
    DECLARE @I_INTERNAL_NO NVARCHAR(20);
    DECLARE @I_IS_FINAL NVARCHAR(1) = 'N';

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. ดึงข้อมูลปัจจุบัน
        SELECT 
            @I_CURRENT_LEVEL = I_CURRENT_LEVEL, 
            @I_REQUIRED_LEVEL = I_REQUIRED_LEVEL
        FROM WF_H 
        WHERE I_WF_ID = @I_WF_ID;

        IF @I_CURRENT_LEVEL IS NULL
        BEGIN
            THROW 50001, 'Workflow not found', 1;
        END

        -- 2. ตรวจสอบว่าเป็น Final Level หรือไม่
        SELECT @I_IS_FINAL = ISNULL(I_IS_FINAL, 'N')
        FROM USER_AUTHORITY
        WHERE I_USER_ID = @I_USER_ID 
            AND I_GROUP = (SELECT I_GROUP FROM WF_H WHERE I_WF_ID = @I_WF_ID)
            AND I_LEVEL = @I_CURRENT_LEVEL
            AND I_KIND = 1002
            AND I_ACTIVE_FLAG = 'Y';

        -- 3. คำนวณ SEQ และ INTERNAL_NO
        SELECT @I_SEQ_NO = ISNULL(MAX(I_SEQ_NO), 0) + 1
        FROM WF_D 
        WHERE I_WF_ID = @I_WF_ID;

        SET @I_INTERNAL_NO = @I_WF_ID + '_' + RIGHT('000' + CAST(@I_SEQ_NO AS VARCHAR), 3);

        -- 4. บันทึก Detail
        INSERT INTO WF_D (
            I_WF_ID, I_INTERNAL_NO, I_SEQ_NO, I_USER_ID,
            I_KIND, I_LEVEL, I_REMARK,
            CREATED_BY, CREATED_PRG_NM
        )
        VALUES (
            @I_WF_ID, @I_INTERNAL_NO, @I_SEQ_NO, @I_USER_ID,
            @I_ACTION, @I_CURRENT_LEVEL, @I_REMARK,
            @I_BY, 'SP_APPROVE_REJECT_WORKFLOW'
        );

        -- 5. คำนวณ Status ใหม่
        IF @I_ACTION = 1003
            SET @I_NEW_STATUS = '2';  -- REJECTED
        ELSE IF @I_IS_FINAL = 'Y' OR @I_CURRENT_LEVEL >= @I_REQUIRED_LEVEL
            SET @I_NEW_STATUS = '1';  -- APPROVED
        ELSE
            SET @I_NEW_STATUS = '3';  -- IN_PROGRESS

        -- 6. อัพเดท Header
        UPDATE WF_H 
        SET I_CURRENT_LEVEL = CASE 
                WHEN @I_ACTION = 1002 AND @I_NEW_STATUS = '3' 
                THEN I_CURRENT_LEVEL + 1 
                ELSE I_CURRENT_LEVEL 
            END,
            I_STATUS = @I_NEW_STATUS,
            I_COMPLETED_DATE = CASE 
                WHEN @I_NEW_STATUS IN ('1', '2') 
                THEN GETDATE() 
                ELSE NULL 
            END,
            UPDATED_BY = @I_BY,
            UPDATED_DATE = GETDATE(),
            UPDATED_PRG_NM = 'SP_APPROVE_REJECT_WORKFLOW'
        WHERE I_WF_ID = @I_WF_ID;

        COMMIT TRANSACTION;
        
        SELECT 
            'SUCCESS' AS RESULT, 
            @I_NEW_STATUS AS NEW_STATUS,
            CASE @I_NEW_STATUS
                WHEN '0' THEN 'PENDING'
                WHEN '1' THEN 'APPROVED'
                WHEN '2' THEN 'REJECTED'
                WHEN '3' THEN 'IN_PROGRESS'
                WHEN '9' THEN 'CANCELLED'
            END AS STATUS_TEXT;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 'ERROR' AS RESULT, ERROR_MESSAGE() AS ERROR_MSG;
    END CATCH
END;
GO


-- ////////////////////
CREATE OR ALTER PROCEDURE SP_CANCEL_WORKFLOW
    @I_WF_ID NVARCHAR(20),
    @I_USER_ID NVARCHAR(50),
    @I_REMARK NVARCHAR(500) = NULL,
    @I_BY NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @I_SEQ_NO NUMERIC(3,0);
    DECLARE @I_INTERNAL_NO NVARCHAR(20);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- คำนวณ SEQ
        SELECT @I_SEQ_NO = ISNULL(MAX(I_SEQ_NO), 0) + 1
        FROM WF_D WHERE I_WF_ID = @I_WF_ID;

        SET @I_INTERNAL_NO = @I_WF_ID + '_' + RIGHT('000' + CAST(@I_SEQ_NO AS VARCHAR), 3);

        -- บันทึก Detail
        INSERT INTO WF_D (
            I_WF_ID, I_INTERNAL_NO, I_SEQ_NO, I_USER_ID,
            I_KIND, I_LEVEL, I_REMARK,
            CREATED_BY, CREATED_PRG_NM
        )
        VALUES (
            @I_WF_ID, @I_INTERNAL_NO, @I_SEQ_NO, @I_USER_ID,
            1004, NULL, @I_REMARK,
            @I_BY, 'SP_CANCEL_WORKFLOW'
        );

        -- อัพเดท Header
        UPDATE WF_H
        SET I_STATUS = '9',
            I_COMPLETED_DATE = GETDATE(),
            UPDATED_BY = @I_BY,
            UPDATED_DATE = GETDATE(),
            UPDATED_PRG_NM = 'SP_CANCEL_WORKFLOW'
        WHERE I_WF_ID = @I_WF_ID;

        COMMIT TRANSACTION;
        SELECT 'SUCCESS' AS RESULT;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 'ERROR' AS RESULT, ERROR_MESSAGE() AS ERROR_MSG;
    END CATCH
END;
GO