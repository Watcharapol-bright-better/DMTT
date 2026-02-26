
DELETE FROM [dbo].[WFS_T_D] WHERE [I_WF_ID] IN (
    SELECT [I_WF_ID] FROM [dbo].[WFS_T_H] WHERE [I_REF_DOC_NO] = 'CN2602240001'
)
DELETE FROM [dbo].[WFS_T_H] WHERE [I_REF_DOC_NO] = 'CN2602240001'


DECLARE @result NVARCHAR(MAX)
EXEC [dbo].[SP_WF_SUBMIT_REQUEST]
    @I_USER_ID = 'demo4',
    @I_REF_DOC_NO = 'CN2602240002',
    @I_GROUP = '1',
    @I_REMARK = N'New Request for approval',
    @O_RESULT = @result OUTPUT
SELECT @result AS [Result]


SELECT * FROM [dbo].[WFS_T_H] WHERE [I_REF_DOC_NO] = 'CN2602240002'
SELECT * FROM [dbo].[WFS_T_D] WHERE [I_WF_ID] IN (
    SELECT [I_WF_ID] FROM [dbo].[WFS_T_H] WHERE [I_REF_DOC_NO] = 'CN2602240002'
)


DECLARE @result NVARCHAR(MAX)
EXEC [dbo].[SP_WF_APPROVAL_ACTION]
    @I_USER_ID = 'demo',
    @I_REF_DOC_NO = 'CN2602240002',
    @I_KIND = '1002',
    @I_STATUS = '1',
    @I_REMARK = N'อนุมัติ',
    @O_RESULT = @result OUTPUT
SELECT @result AS [Result]


DECLARE @result NVARCHAR(MAX)
EXEC [dbo].[SP_WF_APPROVAL_ACTION]
    @I_USER_ID = 'demo',
    @I_REF_DOC_NO = 'CN2602240002',
    @I_KIND = '1002',
    @I_STATUS = '3',
    @I_REMARK = N'ปฏิเสธ เนื่องจากงบประมาณเกิน',
    @O_RESULT = @result OUTPUT
SELECT @result AS [Result]


DECLARE @result NVARCHAR(MAX)
EXEC [dbo].[SP_WF_APPROVAL_ACTION]
    @I_USER_ID = 'demo',
    @I_REF_DOC_NO = 'CN2602240002',
    @I_KIND = '1002',
    @I_STATUS = '2',
    @I_REMARK = N'ไม่อนุมัติ',
    @O_RESULT = @result OUTPUT
SELECT @result AS [Result]

