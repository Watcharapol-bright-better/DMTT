
-- Requester: Show my submitted requests (แสดงทุกสถานะ)
SELECT
     '' AS [SEL_CHK]
    ,[IH].[I_INVOICE_NO]
    ,[IH].[I_INVOICE_DATE]
    ,[IH].[I_SHIP_ORDER_NO]
    ,[IH].[I_CSCODE]
    ,[MC].[I_NAME]
    ,[IH].[I_TYPE]
    ,[SH].[I_PIC]
    ,[IH].[I_ATTN]
    ,[IH].[I_SHIP_TO]
    ,[IH].[I_INTERFACE_STATUS]
    ,/**%TLN_LOGIN_USER%**/'demo4' AS [USER_ID]
    ,'Requester' AS [USER_ROLE]
    ,[WF].[I_STATUS] AS [WF_HEADER_STATUS]
    ,[WF].[STATUS_TEXT] AS [WF_HEADER_STATUS_TEXT]
    ,[WF].[LAST_STATUS] AS [WF_CURRENT_EVENT_STATUS]
    ,CASE [WF].[LAST_STATUS]
        WHEN '0' THEN 'Pending'
        WHEN '1' THEN 'Approved'
        WHEN '2' THEN 'Unapproved'
        WHEN '3' THEN 'Rejected'
        ELSE '-'
    END AS [I_APPR_STATUS]
    ,[WF].[I_CURRENT_LEVEL]
    ,[WF].[I_REQUIRED_LEVEL]
    ,[WF].[LAST_ACTION_BY]
    ,[WF].[LAST_REMARK]
    ,[WF].[I_REQUEST_DATE]
    ,[WF].[I_COMPLETED_DATE]
    ,[IH].[CREATED_DATE]
FROM [dbo].[T_PR_INVOICE_H] [IH]
    LEFT JOIN [dbo].[MS_CS] [MC] 
        ON [MC].[I_CSCODE] = [IH].[I_CSCODE]
    LEFT JOIN [dbo].[T_PR_SHIP_INST_H] [SH]
        ON [SH].[I_SHIP_INST] = [IH].[I_SHIP_ORDER_NO]
    LEFT JOIN [dbo].[VW_WF_MY_REQUEST_LIST] [WF]
        ON [WF].[I_REF_DOC_NO] = [IH].[I_INVOICE_NO]
        AND [WF].[REQUESTER_ID] = /**%TLN_LOGIN_USER%**/'demo4'
WHERE EXISTS (
    SELECT 1 
    FROM [dbo].[USER_AUTHORITY] 
    WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/'demo4'
      AND [I_KIND] = '1001'
      AND [I_ACTIVE_FLAG] = '1'
)

UNION ALL

-- Approver: Show items for approval (ไม่แสดง Rejected)
SELECT
     '' AS [SEL_CHK]
    ,[IH].[I_INVOICE_NO]
    ,[IH].[I_INVOICE_DATE]
    ,[IH].[I_SHIP_ORDER_NO]
    ,[IH].[I_CSCODE]
    ,[MC].[I_NAME]
    ,[IH].[I_TYPE]
    ,[SH].[I_PIC]
    ,[IH].[I_ATTN]
    ,[IH].[I_SHIP_TO]
    ,[IH].[I_INTERFACE_STATUS]
    ,/**%TLN_LOGIN_USER%**/'demo4' AS [USER_ID]
    ,'Approver' AS [USER_ROLE]
    ,[WF].[I_STATUS] AS [WF_HEADER_STATUS]
    ,CASE [WF].[I_STATUS]
        WHEN '0' THEN 'Closed'
        WHEN '1' THEN 'Open'
        ELSE 'No Workflow'
    END AS [WF_HEADER_STATUS_TEXT]
    ,[WF_DETAIL].[LAST_STATUS] AS [WF_CURRENT_EVENT_STATUS]
    ,CASE [WF_DETAIL].[LAST_STATUS]
        WHEN '0' THEN 'Pending'
        WHEN '1' THEN 'Approved'
        WHEN '2' THEN 'Unapproved'
        WHEN '3' THEN 'Rejected'
        ELSE '-'
    END AS [I_APPR_STATUS]
    ,[WF].[I_CURRENT_LEVEL]
    ,[WF].[I_REQUIRED_LEVEL]
    ,[WF_DETAIL].[LAST_ACTION_BY]
    ,[WF].[REQUEST_REMARK] AS [LAST_REMARK]
    ,[WF].[I_REQUEST_DATE]
    ,NULL AS [I_COMPLETED_DATE]
    ,[IH].[CREATED_DATE]
FROM [dbo].[T_PR_INVOICE_H] [IH]
    LEFT JOIN [dbo].[MS_CS] [MC] 
        ON [MC].[I_CSCODE] = [IH].[I_CSCODE]
    LEFT JOIN [dbo].[T_PR_SHIP_INST_H] [SH]
        ON [SH].[I_SHIP_INST] = [IH].[I_SHIP_ORDER_NO]
    INNER JOIN [dbo].[VW_WF_PENDING_APPROVAL_LIST] [WF]
        ON [WF].[I_REF_DOC_NO] = [IH].[I_INVOICE_NO]
        AND [WF].[APPROVER_ID] = /**%TLN_LOGIN_USER%**/'demo4'
    LEFT JOIN (
        SELECT 
            [H].[I_WF_ID],
            (
                SELECT TOP 1 [I_STATUS]
                FROM [dbo].[WFS_T_D]
                WHERE [I_WF_ID] = [H].[I_WF_ID]
                AND [I_STATUS] IS NOT NULL
                ORDER BY [I_SEQ_NO] DESC
            ) AS [LAST_STATUS],
            (
                SELECT TOP 1 [I_ACTION_BY]
                FROM [dbo].[WFS_T_D]
                WHERE [I_WF_ID] = [H].[I_WF_ID]
                ORDER BY [I_SEQ_NO] DESC
            ) AS [LAST_ACTION_BY]
        FROM [dbo].[WFS_T_H] [H]
    ) [WF_DETAIL] ON [WF_DETAIL].[I_WF_ID] = [WF].[I_WF_ID]
WHERE EXISTS (
    SELECT 1 
    FROM [dbo].[USER_AUTHORITY] 
    WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/'demo4'
      AND [I_KIND] = '1002'
      AND [I_ACTIVE_FLAG] = '1'
)
AND ([WF_DETAIL].[LAST_STATUS] IS NULL OR [WF_DETAIL].[LAST_STATUS] <> '3')

-- ORDER BY [CREATED_DATE] DESC