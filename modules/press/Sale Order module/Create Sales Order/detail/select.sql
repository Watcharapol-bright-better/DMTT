SELECT  
    Q.I_QT_NO,
    Q.I_CSCODE,
    Q.I_SALE_UNIT,
    P.I_DESC,            -- ชื่อสินค้า/รายละเอียดจาก MS_PRFG
    S.I_DLYDATE,
    S.I_QTY,
    S.I_AMOUNT,
    S.I_SONO,
    S.I_LNNO,
    Q.I_ITEMCODE
FROM T_PR_QT AS Q
-- ดึง Description จาก Master FG
LEFT JOIN MS_PRFG AS P
    ON Q.I_ITEMCODE = P.I_ITEMCODE
-- ดึงข้อมูลล่าสุดจาก T_PR_SORD ถ้ามี
OUTER APPLY (
    SELECT TOP 1
        I_DLYDATE,
        I_QTY,
        I_AMOUNT,
        S.I_SONO,
        S.I_LNNO
    FROM T_PR_SORD AS S
    WHERE S.I_ITEMCODE = Q.I_ITEMCODE
    ORDER BY S.I_DLYDATE DESC
) AS S
