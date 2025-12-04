Sub HelloWorld()
    MsgBox "Hello World"
End Sub



' This function copies a row format from one row to another
'
' Parameters:
'   fromRow   -> the row number to copy from
'   targetRow -> the row number to insert and paste the format
'   lineFlg   -> if 1, change the bottom border to solid
'               if 0, change the bottom border to dot
'
' Example usage:
'   copyRow 5, 10, 1   ' copy format from row 5 to row 10, make bottom border solid
'   copyRow 3, 8, 0    ' copy format from row 3 to row 8, make bottom border dot
Sub copyRow(fromRow As Long, targetRow As Long, lineFlg As Long)
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

    ' Change the bottom border based on lineFlg
    With ws.Range("B" & targetRow & ":W" & targetRow).Borders(xlEdgeBottom)
        If lineFlg = 1 Then
            .LineStyle = xlContinuous   ' solid line
        ElseIf lineFlg = 0 Then
            .LineStyle = xlDot
        End If
        .Weight = xlThin
    End With

    Application.CutCopyMode = False
End Sub

Sub copyContent(fromRow As Long, targetRow As Long)

    Dim wsData As Worksheet
    Dim wsMain As Worksheet

    Set wsData = ThisWorkbook.Sheets("data")
    Set wsMain = ThisWorkbook.Sheets("Quotation")

    ' Copy values only (no format)
    ' No.
    wsMain.Cells(targetRow, "B").Value = wsData.Cells(fromRow, "A").Value
    ' Part No.
    wsMain.Cells(targetRow, "C").Value = wsData.Cells(fromRow, "B").Value
    ' Part Name
    wsMain.Cells(targetRow, "D").Value = wsData.Cells(fromRow, "C").Value

    ' ==============================================
    ' Material size
    ' ==============================================
    wsMain.Cells(targetRow, "E").Value = wsData.Cells(fromRow, "F").Value ' Material
    wsMain.Cells(targetRow, "F").Value = wsData.Cells(fromRow, "G").Value ' Thickness
    wsMain.Cells(targetRow, "G").Value = "x"
    wsMain.Cells(targetRow, "H").Value = wsData.Cells(fromRow, "H").Value ' Width
    ' ==============================================

    ' FG Unit Weight
    wsMain.Cells(targetRow, "I").Value = wsData.Cells(fromRow, "I").Value
    ' Pitch
    wsMain.Cells(targetRow, "L").Value = wsData.Cells(fromRow, "N").Value
    ' Material amount
    wsMain.Cells(targetRow, "O").Value = wsData.Cells(fromRow, "L").Value
    ' Scrap weight
    wsMain.Cells(targetRow, "P").Value = wsData.Cells(fromRow, "M").Value


    ' Material weight
    wsMain.Cells(targetRow, "J").Value = wsData.Cells(fromRow, "O").Value
    ' Scrap weight
    wsMain.Cells(targetRow, "K").Value = wsData.Cells(fromRow, "P").Value

    ' Press Processing
    wsMain.Cells(targetRow, "Q").Value = wsData.Cells(fromRow, "Q").Value
    ' Customer Clearance
    wsMain.Cells(targetRow, "R").Value = wsData.Cells(fromRow, "R").Value
    ' Package Material
    wsMain.Cells(targetRow, "S").Value = wsData.Cells(fromRow, "S").Value
    ' Maintenance Expenses
    wsMain.Cells(targetRow, "T").Value = wsData.Cells(fromRow, "T").Value
    ' Delivery fee
    wsMain.Cells(targetRow, "U").Value = wsData.Cells(fromRow, "U").Value
    ' Management Expenses
    wsMain.Cells(targetRow, "V").Value = wsData.Cells(fromRow, "V").Value

    ' Material cost
    wsMain.Cells(targetRow, "M").Value = wsData.Cells(fromRow, "W").Value

    ' Scrap cost
    wsMain.Cells(targetRow, "N").Value = wsData.Cells(fromRow, "X").Value


End Sub


