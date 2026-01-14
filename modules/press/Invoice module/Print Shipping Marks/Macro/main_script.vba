Private Sub Workbook_Open()

    ' Sheet names
    Dim mainWS As String: mainWS = "Shipping Mark"
    Dim dataWS As String: dataWS = "raw_data"

    ' Local variables
    Dim sh As Worksheet
    Dim mainExists As Boolean
    Dim dataExists As Boolean
    Dim lastRow As Long
    Dim index As Long

    ' Check required sheets
    For Each sh In Worksheets
        If sh.Name = mainWS Then
            mainExists = True
        ElseIf sh.Name = dataWS Then
            dataExists = True
        End If
    Next sh

    If Not (mainExists And dataExists) Then Exit Sub

    ' Get last row from raw_data
    With Worksheets(dataWS)
        lastRow = .Cells(.Rows.Count, "A").End(xlUp).Row
        If lastRow < 2 Then Exit Sub
    End With

    ' Loop raw_data
    For index = 2 To lastRow
        tranferData index
    Next index

End Sub

