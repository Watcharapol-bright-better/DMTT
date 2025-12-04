
Private Sub Workbook_Open()

    Dim mainWS As String
    Dim dataWS As String
    Dim sh As Worksheet
    Dim mainExists As Boolean
    Dim dataExists As Boolean
    Dim lastRow As Long
    Dim i As Long
    
    mainWS = "Quotation"
    dataWS = "data"

    mainExists = False
    dataExists = False

    ' Check if worksheets exist
    For Each sh In Worksheets
        If sh.Name = mainWS Then
            mainExists = True
        ElseIf sh.Name = dataWS Then
            dataExists = True
        End If
    Next sh

    If mainExists And dataExists Then
        ' Call other subs

        ' --- Find last row with content in column A of dataWS ---
        With Worksheets(dataWS)
            ' Start from row 2, look down column A
            lastRow = .Cells(.Rows.count, "A").End(xlUp).Row
            If lastRow < 2 Then lastRow = 2
        End With


        Dim count As Long
        count = 14

        ' Loop from row 2 to lastRow
        For i = 2 To lastRow
            Debug.Print "Data Row : " & i & " Quotation Row: "; count

            ' Insert & format new row
            copyRow count, (count + 1), 0

            ' Copy A,B,C → B,C,D
            copyContent i, count + 1


            count = count + 1
        Next i

    End If

End Sub

