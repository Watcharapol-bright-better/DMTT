SELECT *
FROM (
    -- Requester
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
        ,/**%TLN_LOGIN_USER%**/'' AS [USER_ID]
        ,'Requester' AS [USER_ROLE]
        ,[WF].[HEADER_STATUS] AS [WF_HEADER_STATUS]
        ,CASE [WF].[HEADER_STATUS]
            WHEN '0' THEN 'Closed'
            WHEN '1' THEN 'Open'
            ELSE 'No Workflow'
        END AS [WF_HEADER_STATUS_TEXT]
        ,[WF].[LATEST_STATUS] AS [WF_CURRENT_EVENT_STATUS]
        ,[WF].[LATEST_STATUS_TEXT] AS [I_APPR_STATUS]
        ,[WF].[I_CURRENT_LEVEL]
        ,[WF].[I_REQUIRED_LEVEL]
        ,[WF].[I_ACTION_BY] AS [LAST_ACTION_BY]
        ,[WF].[LATEST_REMARK] AS [LAST_REMARK]
        ,[WF].[I_REQUEST_DATE]
        ,[WF].[I_COMPLETED_DATE]
        ,[IH].[CREATED_DATE]
    FROM [dbo].[T_PR_INVOICE_H] [IH]
        LEFT JOIN [dbo].[MS_CS] [MC] 
            ON [MC].[I_CSCODE] = [IH].[I_CSCODE]
        LEFT JOIN [dbo].[T_PR_SHIP_INST_H] [SH]
            ON [SH].[I_SHIP_INST] = [IH].[I_SHIP_ORDER_NO]
        LEFT JOIN [dbo].[VW_WF_LATEST_APPROVAL_STATUS] [WF]
            ON [WF].[I_REF_DOC_NO] = [IH].[I_INVOICE_NO]
            AND [WF].[REQUESTER_ID] = /**%TLN_LOGIN_USER%**/''
    WHERE EXISTS (
        SELECT 1 
        FROM [dbo].[USER_AUTHORITY] 
        WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/''
        AND [I_KIND] = '1001'
        AND [I_ACTIVE_FLAG] = '1'
    )

    UNION ALL

    -- Approver: แสดงเฉพาะ Pending, Approved, Unapproved
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
        ,/**%TLN_LOGIN_USER%**/'' AS [USER_ID]
        ,'Approver' AS [USER_ROLE]
        ,[WF].[HEADER_STATUS] AS [WF_HEADER_STATUS]
        ,CASE [WF].[HEADER_STATUS]
            WHEN '0' THEN 'Closed'
            WHEN '1' THEN 'Open'
            ELSE 'No Workflow'
        END AS [WF_HEADER_STATUS_TEXT]
        ,[WF].[LATEST_STATUS] AS [WF_CURRENT_EVENT_STATUS]
        ,[WF].[LATEST_STATUS_TEXT] AS [I_APPR_STATUS]
        ,[WF].[I_CURRENT_LEVEL]
        ,[WF].[I_REQUIRED_LEVEL]
        ,[WF].[I_ACTION_BY] AS [LAST_ACTION_BY]
        ,[WF].[REQUEST_REMARK] AS [LAST_REMARK]
        ,[WF].[I_REQUEST_DATE]
        ,[WF].[I_COMPLETED_DATE]
        ,[IH].[CREATED_DATE]
    FROM [dbo].[T_PR_INVOICE_H] [IH]
        LEFT JOIN [dbo].[MS_CS] [MC] 
            ON [MC].[I_CSCODE] = [IH].[I_CSCODE]
        LEFT JOIN [dbo].[T_PR_SHIP_INST_H] [SH]
            ON [SH].[I_SHIP_INST] = [IH].[I_SHIP_ORDER_NO]
        INNER JOIN [dbo].[VW_WF_LATEST_APPROVAL_STATUS] [WF]
            ON [WF].[I_REF_DOC_NO] = [IH].[I_INVOICE_NO]
            AND [WF].[I_APPROVER_ID] = /**%TLN_LOGIN_USER%**/''
            AND [WF].[LATEST_STATUS] IN ('0', '1', '2')  -- Pending, Approved, Unapproved
    WHERE EXISTS (
        SELECT 1 
        FROM [dbo].[USER_AUTHORITY] 
        WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/''
        AND [I_KIND] = '1002'
        AND [I_ACTIVE_FLAG] = '1'
    )
) AS [MAIN]

-- ORDER BY [MAIN].[CREATED_DATE] DESC