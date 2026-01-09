Private Sub Workbook_Open()
    
    ' Sheet names
    Dim mainWS As String: mainWS = "Packing list"
    Dim dataWS As String: dataWS = "raw_data"
    
    ' Local variables
    Dim sh As Worksheet
    Dim mainExists As Boolean
    Dim dataExists As Boolean
    Dim rowStart As Long
    Dim lastRow As Long
    Dim index As Long
    Dim tableStartRow As Long
    
    ' Check required sheets
    For Each sh In Worksheets
        If sh.Name = mainWS Then
            mainExists = True
        ElseIf sh.Name = dataWS Then
            dataExists = True
        End If
    Next sh
    
    If Not (mainExists And dataExists) Then Exit Sub
    
    ' Get last row from data sheet
    With Worksheets(dataWS)
        lastRow = .Cells(.Rows.Count, "A").End(xlUp).Row
        If lastRow < 2 Then lastRow = 2
    End With
    
    ' Start row in main sheet
    rowStart = 14
    
    ' Loop data rows
    For index = 2 To lastRow
    
        ' Insert one empty row
        addEmptyRowBlock Worksheets(mainWS), rowStart
    
        ' Copy template table
        copyTemplateTable Worksheets(mainWS), rowStart + 1
    
        ' Transfer data to row 3 of the table
        tranferData index, rowStart + 1
    
        ' Move start row (1 empty + 6 table rows)
        rowStart = rowStart + 7
    
    Next index
    
    ' Remove template table
    Worksheets(mainWS).Rows("7:14").Delete

End Sub


