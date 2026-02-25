-- Requester 
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
    ,'Requester' AS [USER_ROLE]
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
      AND [I_KIND] = '1001'
      AND [I_ACTIVE_FLAG] = '1'
)

UNION ALL

-- Approver 
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
    ,'Approver' AS [USER_ROLE]
    ,[WF_ALL].[I_STATUS]
    ,[IH].[CREATED_DATE]
FROM [T_PR_INVOICE_H] [IH]
    LEFT JOIN [MS_CS] AS [MC] 
        ON [MC].[I_CSCODE] = [IH].[I_CSCODE]
    LEFT JOIN [T_PR_SHIP_INST_H] [SH]
        ON [SH].[I_SHIP_INST] = [IH].[I_SHIP_ORDER_NO]
    
    LEFT JOIN (
        SELECT 
            I_WF_ID,
            I_REF_DOC_NO,
            I_STATUS,
            I_GROUP,
            I_CURRENT_LEVEL,
            I_USER_ID
        FROM [WF_H]
        WHERE I_WF_ID IN (
            -- ดึง Workflow ล่าสุดของแต่ละเอกสาร
            SELECT MAX(I_WF_ID)
            FROM [WF_H]
            GROUP BY I_REF_DOC_NO
        )
    ) [WF_ALL] ON [WF_ALL].[I_REF_DOC_NO] = [IH].[I_INVOICE_NO]
    
    -- JOIN กับ USER_AUTHORITY เพื่อเช็คว่า User นี้เป็น Approver หรือไม่
    INNER JOIN [USER_AUTHORITY] [UA]
        ON [UA].[I_USER_ID] = /**%TLN_LOGIN_USER%**/''
        AND [UA].[I_GROUP] = [WF_ALL].[I_GROUP]
        AND [UA].[I_KIND] = '1002'
        AND [UA].[I_ACTIVE_FLAG] = '1'

WHERE EXISTS (
    SELECT 1 
    FROM [USER_AUTHORITY] 
    WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/''
      AND [I_KIND] = '1002'
      AND [I_ACTIVE_FLAG] = '1'
)
-- Rejected (I_STATUS = '2')
AND ([WF_ALL].[I_STATUS] IS NULL OR [WF_ALL].[I_STATUS] <> '2')

--ORDER BY [CREATED_DATE] DESC;