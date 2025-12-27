USE DMTT_DEMO_PRESS;
GO

DECLARE @tblName NVARCHAR(MAX) = 'I_ENDUSER'
SELECT 
    t.name AS TableName,
    c.name AS ColumnName
FROM 
    sys.columns c
    INNER JOIN sys.tables t ON c.object_id = t.object_id
WHERE 
    c.name = @tblName
ORDER BY 
    t.name;
