SELECT *
FROM (
    
    SELECT  
           /**%SEL_CHK%**/'' AS [SEL_CHK]
           ,'1' AS [LVL]
           ,NULL AS [I_QT_LN]
           ,[QH].[I_QT_MTH]
           ,[QH].[I_QT_NO]
           ,[QH].[I_PO_MONTH]
           ,[QH].[I_EXG_MONTH]
           ,[QH].[I_CSCODE]
           ,[MC].[I_NAME] AS [I_NAME]
           ,[QH].[I_REM1]
           ,NULL AS [I_ITEMCODE]
           ,NULL AS [I_DESC]
           ,[QH].[I_TYPE]
           ,NULL AS [I_COMMODITY]
           ,NULL AS [I_THICK]
           ,NULL AS [I_WIDTH]
           ,NULL AS [I_PROD_WGT]
           ,[QH].[I_CURRENCY]
           ,NULL AS [I_UNIT_PRICE]
           ,[QH].[I_SO_FLG]
           ,[QH].[CREATED_DATE]

           -- Workflow Info
           ,/**%TLN_LOGIN_USER%**/'' AS [USER_ID]
           ,'Requester' AS [USER_ROLE]
           ,[WF].[HEADER_STATUS] AS [WF_HEADER_STATUS]
           ,CASE [WF].[HEADER_STATUS]
               WHEN '0' THEN 'Closed'
               WHEN '1' THEN 'Open'
               ELSE 'No Workflow'
           END AS [WF_HEADER_STATUS_TEXT]
           ,[WF].[LATEST_STATUS] AS [I_QT_STATUS]
           ,[WF].[LATEST_STATUS_TEXT] AS [I_APPR_STATUS]
           ,[WF].[I_CURRENT_LEVEL]
           ,[WF].[I_REQUIRED_LEVEL]
           ,[WF].[I_ACTION_BY] AS [LAST_ACTION_BY]
           ,[WF].[LATEST_REMARK] AS [LAST_REMARK]
           ,[WF].[I_REQUEST_DATE]
           ,[WF].[I_COMPLETED_DATE]
    FROM [T_PR_QT_H] AS [QH]
        LEFT JOIN [MS_CS] AS [MC] 
            ON [MC].[I_CSCODE] = [QH].[I_CSCODE]
        LEFT JOIN [dbo].[VW_WF_LATEST_APPROVAL_STATUS] [WF]
            ON [WF].[I_REF_DOC_NO] = [QH].[I_QT_NO]
            AND [WF].[REQUESTER_ID] = /**%TLN_LOGIN_USER%**/''
    WHERE EXISTS (
        SELECT 1 
        FROM [dbo].[USER_AUTHORITY] 
        WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/''
          AND [I_KIND] = '1001'
          AND [I_ACTIVE_FLAG] = '1'
    )

    UNION ALL

    SELECT
           /**%SEL_CHK%**/'' AS [SEL_CHK]
           ,'2' AS [LVL]
           ,[QD].[I_QT_LN]
           ,[QH].[I_QT_MTH]
           ,[QD].[I_QT_NO]
           ,[QH].[I_PO_MONTH]
           ,[QH].[I_EXG_MONTH]
           ,[QH].[I_CSCODE]
           ,[MC].[I_NAME]
           ,[QH].[I_REM1]
           ,[QD].[I_ITEMCODE]
           ,[MP].[I_DESC]
           ,[QH].[I_TYPE]
           ,[QD].[I_COMMODITY]
           ,[QD].[I_THICK]
           ,[QD].[I_WIDTH]
           ,[QD].[I_PROD_WGT]
           ,[QH].[I_CURRENCY]
           ,NULL AS [I_UNIT_PRICE]
           ,NULL AS [I_SO_FLG]
           ,[QH].[CREATED_DATE]

           -- Workflow Info
           ,/**%TLN_LOGIN_USER%**/'' AS [USER_ID]
           ,'Requester' AS [USER_ROLE]
           ,[WF].[HEADER_STATUS] AS [WF_HEADER_STATUS]
           ,CASE [WF].[HEADER_STATUS]
               WHEN '0' THEN 'Closed'
               WHEN '1' THEN 'Open'
               ELSE 'No Workflow'
           END AS [WF_HEADER_STATUS_TEXT]
           ,[WF].[LATEST_STATUS] AS [I_QT_STATUS]
           ,[WF].[LATEST_STATUS_TEXT] AS [I_APPR_STATUS]
           ,[WF].[I_CURRENT_LEVEL]
           ,[WF].[I_REQUIRED_LEVEL]
           ,[WF].[I_ACTION_BY] AS [LAST_ACTION_BY]
           ,[WF].[LATEST_REMARK] AS [LAST_REMARK]
           ,[WF].[I_REQUEST_DATE]
           ,[WF].[I_COMPLETED_DATE]
    FROM [T_PR_QT_D] AS [QD]
        LEFT JOIN [T_PR_QT_H] AS [QH] 
            ON [QH].[I_QT_NO] = [QD].[I_QT_NO]
        LEFT JOIN [MS_CS] AS [MC] 
            ON [MC].[I_CSCODE] = [QH].[I_CSCODE]
        LEFT JOIN [MS_PRFG] AS [MP] 
            ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE]
        LEFT JOIN [dbo].[VW_WF_LATEST_APPROVAL_STATUS] [WF]
            ON [WF].[I_REF_DOC_NO] = [QH].[I_QT_NO]
            AND [WF].[REQUESTER_ID] = /**%TLN_LOGIN_USER%**/''
    WHERE EXISTS (
        SELECT 1 
        FROM [dbo].[USER_AUTHORITY] 
        WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/''
          AND [I_KIND] = '1001'
          AND [I_ACTIVE_FLAG] = '1'
    )

    UNION ALL

    SELECT  
           /**%SEL_CHK%**/'' AS [SEL_CHK]
           ,'1' AS [LVL]
           ,NULL AS [I_QT_LN]
           ,[QH].[I_QT_MTH]
           ,[QH].[I_QT_NO]
           ,[QH].[I_PO_MONTH]
           ,[QH].[I_EXG_MONTH]
           ,[QH].[I_CSCODE]
           ,[MC].[I_NAME] AS [I_NAME]
           ,[QH].[I_REM1]
           ,NULL AS [I_ITEMCODE]
           ,NULL AS [I_DESC]
           ,[QH].[I_TYPE]
           ,NULL AS [I_COMMODITY]
           ,NULL AS [I_THICK]
           ,NULL AS [I_WIDTH]
           ,NULL AS [I_PROD_WGT]
           ,[QH].[I_CURRENCY]
           ,NULL AS [I_UNIT_PRICE]
           ,[QH].[I_SO_FLG]
           ,[QH].[CREATED_DATE]

           -- Workflow Info
           ,/**%TLN_LOGIN_USER%**/'' AS [USER_ID]
           ,'Approver' AS [USER_ROLE]
           ,[WF].[HEADER_STATUS] AS [WF_HEADER_STATUS]
           ,CASE [WF].[HEADER_STATUS]
               WHEN '0' THEN 'Closed'
               WHEN '1' THEN 'Open'
               ELSE 'No Workflow'
           END AS [WF_HEADER_STATUS_TEXT]
           ,[WF].[LATEST_STATUS] AS [I_QT_STATUS]
           ,[WF].[LATEST_STATUS_TEXT] AS [I_APPR_STATUS]
           ,[WF].[I_CURRENT_LEVEL]
           ,[WF].[I_REQUIRED_LEVEL]
           ,[WF].[I_ACTION_BY] AS [LAST_ACTION_BY]
           ,[WF].[REQUEST_REMARK] AS [LAST_REMARK]
           ,[WF].[I_REQUEST_DATE]
           ,[WF].[I_COMPLETED_DATE]
    FROM [T_PR_QT_H] AS [QH]
        LEFT JOIN [MS_CS] AS [MC] 
            ON [MC].[I_CSCODE] = [QH].[I_CSCODE]
        INNER JOIN [dbo].[VW_WF_LATEST_APPROVAL_STATUS] [WF]
            ON [WF].[I_REF_DOC_NO] = [QH].[I_QT_NO]
            AND [WF].[I_APPROVER_ID] = /**%TLN_LOGIN_USER%**/''
            AND [WF].[LATEST_STATUS] IN ('0', '1', '2')
    WHERE EXISTS (
        SELECT 1 
        FROM [dbo].[USER_AUTHORITY] 
        WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/''
          AND [I_KIND] = '1002'
          AND [I_ACTIVE_FLAG] = '1'
    )

    UNION ALL

    SELECT
           /**%SEL_CHK%**/'' AS [SEL_CHK]
           ,'2' AS [LVL]
           ,[QD].[I_QT_LN]
           ,[QH].[I_QT_MTH]
           ,[QD].[I_QT_NO]
           ,[QH].[I_PO_MONTH]
           ,[QH].[I_EXG_MONTH]
           ,[QH].[I_CSCODE]
           ,[MC].[I_NAME]
           ,[QH].[I_REM1]
           ,[QD].[I_ITEMCODE]
           ,[MP].[I_DESC]
           ,[QH].[I_TYPE]
           ,[QD].[I_COMMODITY]
           ,[QD].[I_THICK]
           ,[QD].[I_WIDTH]
           ,[QD].[I_PROD_WGT]
           ,[QH].[I_CURRENCY]
           ,NULL AS [I_UNIT_PRICE]
           ,NULL AS [I_SO_FLG]
           ,[QH].[CREATED_DATE]

           -- Workflow Info
           ,/**%TLN_LOGIN_USER%**/'' AS [USER_ID]
           ,'Approver' AS [USER_ROLE]
           ,[WF].[HEADER_STATUS] AS [WF_HEADER_STATUS]
           ,CASE [WF].[HEADER_STATUS]
               WHEN '0' THEN 'Closed'
               WHEN '1' THEN 'Open'
               ELSE 'No Workflow'
           END AS [WF_HEADER_STATUS_TEXT]
           ,[WF].[LATEST_STATUS] AS [I_QT_STATUS]
           ,[WF].[LATEST_STATUS_TEXT] AS [I_APPR_STATUS]
           ,[WF].[I_CURRENT_LEVEL]
           ,[WF].[I_REQUIRED_LEVEL]
           ,[WF].[I_ACTION_BY] AS [LAST_ACTION_BY]
           ,[WF].[REQUEST_REMARK] AS [LAST_REMARK]
           ,[WF].[I_REQUEST_DATE]
           ,[WF].[I_COMPLETED_DATE]
    FROM [T_PR_QT_D] AS [QD]
        LEFT JOIN [T_PR_QT_H] AS [QH] 
            ON [QH].[I_QT_NO] = [QD].[I_QT_NO]
        LEFT JOIN [MS_CS] AS [MC] 
            ON [MC].[I_CSCODE] = [QH].[I_CSCODE]
        LEFT JOIN [MS_PRFG] AS [MP] 
            ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE]
        INNER JOIN [dbo].[VW_WF_LATEST_APPROVAL_STATUS] [WF]
            ON [WF].[I_REF_DOC_NO] = [QH].[I_QT_NO]
            AND [WF].[I_APPROVER_ID] = /**%TLN_LOGIN_USER%**/''
            AND [WF].[LATEST_STATUS] IN ('0', '1', '2')
    WHERE EXISTS (
        SELECT 1 
        FROM [dbo].[USER_AUTHORITY] 
        WHERE [I_USER_ID] = /**%TLN_LOGIN_USER%**/''
          AND [I_KIND] = '1002'
          AND [I_ACTIVE_FLAG] = '1'
    )

) AS [MAIN]