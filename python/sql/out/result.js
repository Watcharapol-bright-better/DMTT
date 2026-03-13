var sql =
    "" +
    "SELECT " +
    "    CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS Result " +
    "FROM [T_PR_WOH_TEMP] " +
    "WHERE [I_WO] = '000000000000000127'";