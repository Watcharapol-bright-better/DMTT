SELECT 
    /**%I_WO%**/'' AS I_WO,
    LatestPlan.I_PLAN_START,
    /**%I_PLAN_FINISHED%**/'' AS I_PLAN_FINISHED,
    '' AS PLAN_MINUTES,
    ISNULL(LatestPlan.I_WODATE, GETDATE()) AS I_WODATE,
    '' AS SHIFT,
    5 AS I_WO_TYPE,
    ms.I_MACHINE AS I_PR_MACHINE,
    ms.I_CSCODE,
    mc.I_NAME,
    LatestPlan.CREATED_DATE,
    LatestPlan.CREATED_BY,
    LatestPlan.CREATED_PRG_NM,
    LatestPlan.UPDATED_DATE,
    LatestPlan.UPDATED_BY,
    LatestPlan.UPDATED_PRG_NM,
    LatestPlan.MODIFY_COUNT,
    LatestPlan.I_COMPLETE_FLG 
FROM ms_prfg ms
INNER JOIN ms_cs mc ON ms.I_CSCODE = mc.I_CSCODE
-- ใช้ OUTER APPLY เพื่อหาค่าล่าสุด
OUTER APPLY (
    SELECT TOP 1 *
    FROM T_PR_WOH_TEMP tmp
    WHERE 
        -- 1. แก้เรื่อง Machine Match: ใช้ RTRIM กันช่องว่าง และยอมรับค่า NULL ถ้าหาไม่เจอจริงๆ
        (RTRIM(tmp.I_PR_MACHINE) = RTRIM(ms.I_MACHINE) OR tmp.I_PR_MACHINE IS NULL)
        -- 2. กรองโปรแกรมตามชื่อ (ระวังพิมพ์ผิด หรือมีช่องว่าง)
        AND (RTRIM(tmp.CREATED_PRG_NM) = 'DMTT_T_WO_PLAN')
    ORDER BY tmp.CREATED_DATE DESC 
) AS LatestPlan
WHERE ms.I_ITEMCODE = /**%I_ITEMCODE%**/''