

-- REQUESTER
SELECT
     '' AS [SEL_CHK]
    ,[IH].[I_INVOICE_NO]
    ,[IH].[I_INVOICE_DATE]
    ,[IH].[I_SHIP_ORDER_NO]
    ,[IH].[I_APPR_STATUS] 
    ,[IH].[I_CSCODE]
    ,[MC].[I_NAME]
    ,[IH].[I_TYPE]
    ,[SH].[I_PIC]
    ,[IH].[I_ATTN]
    ,[IH].[I_SHIP_TO]
    ,[IH].[I_INTERFACE_STATUS]
    ,/**%TLN_LOGIN_USER%**/'' AS [USER_ID]
    ,'REQUESTER' AS [USER_ROLE]
    ,[WF].[I_STATUS]
    ,[IH].[CREATED_DATE]
FROM [T_PR_INVOICE_H] [IH]
    LEFT JOIN [MS_CS] AS [MC] 
        ON [MC].[I_CSCODE] = [IH].[I_CSCODE]
    LEFT JOIN [T_PR_SHIP_INST_H] [SH]
        ON [SH].[I_SHIP_INST] = [IH].[I_SHIP_ORDER_NO]
    LEFT JOIN [VW_MY_REQUESTS] [WF]
        ON [WF].[I_REF_DOC_NO] = [IH].[I_INVOICE_NO]
        AND [WF].[REQUESTER_ID] = /**%TLN_LOGIN_USER%**/''
WHERE EXISTS (
    SELECT 1 
    FROM [USER_AUTHORITY] 
    WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/''
      AND [I_KIND] = '1001'  -- REQUESTER
      AND [I_ACTIVE_FLAG] = '1'
)
AND ([WF].[I_STATUS] IS NULL OR [WF].[I_STATUS] != '2')

UNION ALL

-- APPROVER
SELECT
     '' AS [SEL_CHK]
    ,[IH].[I_INVOICE_NO]
    ,[IH].[I_INVOICE_DATE]
    ,[IH].[I_SHIP_ORDER_NO]
    ,[IH].[I_APPR_STATUS] 
    ,[IH].[I_CSCODE]
    ,[MC].[I_NAME]
    ,[IH].[I_TYPE]
    ,[SH].[I_PIC]
    ,[IH].[I_ATTN]
    ,[IH].[I_SHIP_TO]
    ,[IH].[I_INTERFACE_STATUS]
    ,/**%TLN_LOGIN_USER%**/'' AS [USER_ID]
    ,'APPROVER' AS [USER_ROLE]
    ,[WF].[I_STATUS]
    ,[IH].[CREATED_DATE]
FROM [T_PR_INVOICE_H] [IH]
    LEFT JOIN [MS_CS] AS [MC] 
        ON [MC].[I_CSCODE] = [IH].[I_CSCODE]
    LEFT JOIN [T_PR_SHIP_INST_H] [SH]
        ON [SH].[I_SHIP_INST] = [IH].[I_SHIP_ORDER_NO]
    -- JOIN เฉพาะรายการที่รออนุมัติ
    INNER JOIN [VW_MY_PENDING_APPROVALS] [WF]
        ON [WF].[I_REF_DOC_NO] = [IH].[I_INVOICE_NO]
        AND [WF].[APPROVER_ID] = /**%TLN_LOGIN_USER%**/''
WHERE EXISTS (
    SELECT 1 
    FROM [USER_AUTHORITY] 
    WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/''
      AND [I_KIND] = '1002'  -- APPROVER
      AND [I_ACTIVE_FLAG] = '1'
)

-- ORDER BY [CREATED_DATE] DESC
