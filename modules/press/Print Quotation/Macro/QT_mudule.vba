


' This function copies a row format from one row to another
' 
' Parameters:
'   fromRow   -> the row number to copy from
'   targetRow -> the row number to insert and paste the format
'   lineFlg   -> if 1, change the bottom border to solid; if 0, keep as is
'
' Example usage:
'   copyRow 5, 10, 1   ' copy format from row 5 to row 10, make bottom border solid
'   copyRow 3, 8, 0    ' copy format from row 3 to row 8, keep bottom border
Sub copyRow(fromRow As Integer, targetRow As Integer, lineFlg As Integer)
    Dim ws As Worksheet

    Set ws = ActiveSheet

    ' Insert a new row at targetRow
    ws.Rows(targetRow).Insert Shift:=xlDown

    ' Copy only the format from fromRow
    ws.Rows(fromRow).Copy
    ws.Rows(targetRow).PasteSpecial Paste:=xlPasteFormats
    ws.Rows(targetRow).PasteSpecial Paste:=xlPasteColumnWidths

    ' Clear values in the new row (keep only the format)
    ws.Rows(targetRow).ClearContents

    ' If lineFlg = 1, change the bottom border to solid
    If lineFlg = 1 Then
        With ws.Range("B" & targetRow & ":W" & targetRow).Borders(xlEdgeBottom)
            .LineStyle = xlContinuous   ' solid line
            .Weight = xlThin
        End With
    End If

    Application.CutCopyMode = False
End Sub

