Sub HelloWorld()
    MsgBox "Hello World"
End Sub


Sub ShowCells()

    Dim valE As String
    Dim valF As String

    valE = Range("E2").Value
    valF = Range("F2").Value

    MsgBox valE & ", " & valF

End Sub


Sub InsertRowsCols()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("data")
    'Set ws = ThisWorkbook.Sheets("Quotation")
    
    ws.Rows(2).Insert Shift:=xlDown
    ws.Columns("A").Insert Shift:=xlToRight
End Sub

