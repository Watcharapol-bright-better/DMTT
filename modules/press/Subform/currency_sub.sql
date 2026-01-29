SELECT
     [I_CURRENCY]
    ,[I_EXG_RATE_TYPE]
    ,[I_EXG_RATE]
    ,[I_VALIDFR]
    ,[RATE]
FROM (
    SELECT 
         [I_CURRENCY]
        ,[I_EXG_RATE_TYPE]
        ,[I_EXG_RATE]
        ,[I_VALIDFR]
        ,[RATE]
        ,ROW_NUMBER() OVER(
            PARTITION BY [I_CURRENCY], [I_EXG_RATE_TYPE] 
            ORDER BY [I_VALIDFR] DESC
        ) AS [RN] 
    FROM (
        SELECT 
             [I_CURRENCY]
            ,'1' AS [I_EXG_RATE_TYPE] -- Rate Buy TTB
            ,[I_EXG_RATE]
            ,[I_VALIDFR]
            ,[I_RATE_TTB] AS [RATE]
        FROM [MS_EXG]

        UNION

        SELECT 
             [I_CURRENCY]
            ,'2' AS [I_EXG_RATE_TYPE] -- Rate Average TTM
            ,[I_EXG_RATE]
            ,[I_VALIDFR]
            ,[I_RATE_TTM] AS [RATE]
        FROM [MS_EXG]

        UNION

        SELECT 
             [I_CURRENCY]
            ,'3' AS [I_EXG_RATE_TYPE] -- Rate Sale TTS
            ,[I_EXG_RATE]
            ,[I_VALIDFR]
            ,[I_RATE_TTS] AS [RATE]
        FROM [MS_EXG]
    ) AS [M]
) AS [Ranked]
WHERE [RN] = 1 -- latest
ORDER BY [I_CURRENCY], [I_EXG_RATE_TYPE]