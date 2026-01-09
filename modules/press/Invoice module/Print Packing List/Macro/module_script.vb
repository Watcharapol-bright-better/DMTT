
Sub HelloWorld()
    MsgBox "Hello World"
End Sub


Sub addEmptyRowBlock(ws As Worksheet, targetRow As Long)
    ws.Rows(targetRow).Insert Shift:=xlDown
    ws.Rows(targetRow).Clear
End Sub


Sub copyTemplateTable(ws As Worksheet, targetRow As Long)

    Dim srcRange As Range
    Dim dstRange As Range

    ' Template range A7:G12
    Set srcRange = ws.Range("A7:G12")

    ' Destination range (same size)
    Set dstRange = ws.Range("A" & targetRow)

    srcRange.Copy
    dstRange.PasteSpecial Paste:=xlPasteAll

    Application.CutCopyMode = False

End Sub


Sub tranferData(fromRow As Long, tableStartRow As Long)

    Dim wsData As Worksheet
    Dim wsMain As Worksheet
    Dim targetRow As Long

    Set wsData = ThisWorkbook.Sheets("raw_data")
    Set wsMain = ThisWorkbook.Sheets("Packing list")

    ' Row 3 inside the table
    targetRow = tableStartRow + 2

    ' Row No.
    wsMain.Cells(targetRow, "A").Value = wsData.Cells(fromRow, "A").Value

    ' Part No.
    wsMain.Cells(targetRow, "B").Value = wsData.Cells(fromRow, "B").Value

    ' Part Name
    wsMain.Cells(targetRow, "C").Value = wsData.Cells(fromRow, "C").Value

    ' Pcs per Box
    wsMain.Cells(targetRow, "G").Value = wsData.Cells(fromRow, "H").Value

    ' Box,Reel QTY
    wsMain.Cells(targetRow, "F").Value = wsData.Cells(fromRow, "F").Value

    ' Lot No
    wsMain.Cells(targetRow, "D").Value = wsData.Cells(fromRow, "D").Value

End Sub


