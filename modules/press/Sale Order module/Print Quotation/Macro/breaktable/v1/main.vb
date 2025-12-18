Private Sub Workbook_Open()
    ' === Settings & sheet names ===
    Dim mainWS As String: mainWS = "Quotation"
    Dim dataWS As String: dataWS = "data"
    
    ' === Local variables ===
    Dim sh As Worksheet
    Dim mainExists As Boolean: mainExists = False
    Dim dataExists As Boolean: dataExists = False
    Dim lastRow As Long
    Dim index As Long
    
    Dim currentTable As Long
    Dim totalTable As Long
    Dim rowConfig As Long
    Dim rowStart As Long
    Dim breakTable As Long
    Dim rowsPerTable As Long
    
    ' Column E change detection
    Dim prevEValue As String
    Dim currEValue As String
    Dim lineFlg As Long
    
    ' --- Check if worksheets exist ---
    For Each sh In Worksheets
        If sh.Name = mainWS Then
            mainExists = True
        ElseIf sh.Name = dataWS Then
            dataExists = True
        End If
    Next sh
    
    If Not (mainExists And dataExists) Then Exit Sub
    
    ' --- Find last row with data in column A of "data" sheet ---
    With Worksheets(dataWS)
        lastRow = .Cells(.Rows.Count, "A").End(xlUp).Row
        If lastRow < 2 Then lastRow = 2
    End With
    
    ' --- Settings for "Quotation" sheet ---
    rowStart = 14
    rowConfig = 14
    breakTable = 0
    currentTable = 2
    rowsPerTable = 5
    
    ' --- Save first value of column E ---
    prevEValue = Worksheets(dataWS).Cells(2, "E").Value
    
    ' --- Calculate total number of tables/pages ---
    totalTable = lastRow \ rowsPerTable
    If (lastRow Mod rowsPerTable) <> 0 Then totalTable = totalTable + 1
    
    ' --- Loop through each data row ---
    For index = 2 To lastRow
        currEValue = Worksheets(dataWS).Cells(index, "E").Value
        
        ' Determine border style
        If currEValue <> prevEValue Then
            lineFlg = 1
        Else
            lineFlg = 0
        End If
        
        ' Copy row formatting and data
        copyRow rowConfig, rowStart + 1, lineFlg
        copyContent index, rowStart + 1
        
        ' Update trackers
        prevEValue = currEValue
        rowStart = rowStart + 1
        breakTable = breakTable + 1
        
        ' ---- Table boundary check ----
        If (breakTable = rowsPerTable) Or (index = lastRow) Then
            
            ' Apply solid bottom border
            SetBottomBorderSolid Worksheets(mainWS), rowStart
            
            ' Insert 2 blank rows and add table number if full table
            If breakTable = rowsPerTable Then
                Worksheets(mainWS).Rows(rowStart + 1).Insert Shift:=xlDown
                Worksheets(mainWS).Rows(rowStart + 1).Insert Shift:=xlDown
                
                Worksheets(mainWS).Rows(rowStart + 1).Clear
                Worksheets(mainWS).Rows(rowStart + 2).Clear
                
                With Worksheets(mainWS).Cells(rowStart + 2, "W")
                    .Value = "P." & currentTable & "/" & totalTable
                    .Font.Name = "BrowalliaUPC"
                    .Font.Size = 11
                    .Font.Color = RGB(0, 0, 255)
                    .HorizontalAlignment = xlRight
                    .VerticalAlignment = xlCenter
                End With
                
                rowStart = rowStart + 2
                breakTable = 0
                currentTable = currentTable + 1
            End If
            
        End If
        
    Next index
    
End Sub

