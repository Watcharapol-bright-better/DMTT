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

    Dim rowConfig As Long
    Dim rowStart As Long

    ' group check
    Dim prevGroup As String
    Dim currGroup As String
    Dim lineFlg As Long

    ' table type check
    Dim prevTBLType As String
    Dim currTBLType As String

    ' flag for first loop
    Dim isFirstLoop As Boolean: isFirstLoop = True

    ' check worksheets
    For Each sh In Worksheets
        If sh.Name = mainWS Then
            mainExists = True
        ElseIf sh.Name = dataWS Then
            dataExists = True
        End If
    Next sh

    If Not (mainExists And dataExists) Then Exit Sub

    ' get last row of data sheet
    With Worksheets(dataWS)
        lastRow = .Cells(.Rows.Count, "A").End(xlUp).Row
        If lastRow < 2 Then lastRow = 2
    End With

    ' starting row in Quotation (main sheet)
    rowStart = 14
    rowConfig = 14

    ' get first group and first table type
    prevGroup = Worksheets(dataWS).Cells(2, "E").Value
    prevTBLType = Worksheets(dataWS).Cells(2, "Y").Value

    ' ===== Loop through each data row =====
    For index = 2 To lastRow

        ' read item group value
        currGroup = Worksheets(dataWS).Cells(index, "E").Value

        ' check item group change to draw line
        If currGroup <> prevGroup Then
            lineFlg = 1
        Else
            lineFlg = 0
        End If

        ' read table type
        currTBLType = Worksheets(dataWS).Cells(index, "Y").Value

        ' ===========================================================
        ' === First loop: write table type into B11 =================
        ' ===========================================================
        If isFirstLoop Then

            With Worksheets(mainWS).Cells(11, "B")
                .Value = "Part " & currTBLType
                .Font.Name = "BrowalliaUPC"
                .Font.Bold = True
                .Font.Size = 16
                .HorizontalAlignment = xlLeft
                .VerticalAlignment = xlCenter
            End With

            isFirstLoop = False

        Else

            ' ===============================================================
            ' === When table type changes start a new table ==============
            ' ===============================================================
            If currTBLType <> prevTBLType Then

                ' close previous table bottom border
                BottomBorderComponent Worksheets(mainWS), rowStart

                ' add 2 empty rows
                addEmptyRowBlock Worksheets(mainWS), rowStart + 1

                ' write table type title
                With Worksheets(mainWS).Cells(rowStart + 2, "B")
                    .Value = "Part " & currTBLType
                    .Font.Name = "BrowalliaUPC"
                    .Font.Bold = True
                    .Font.Size = 16
                    .HorizontalAlignment = xlLeft
                    .VerticalAlignment = xlCenter
                End With

                ' add table header (2 rows)
                AddTableHeader rowStart + 3

                ' move start down 4 rows
                rowStart = rowStart + 4
            End If

        End If  ' end first-loop block

        ' ===========================================================
        ' === Add detail row ========================================
        ' ===========================================================
        copyRowDetail rowConfig, rowStart + 1, lineFlg
        tranferData index, rowStart + 1

        ' update trackers
        prevGroup = currGroup
        prevTBLType = currTBLType

        rowStart = rowStart + 1


        ' ===========================================================
        ' === LAST ROW: add bottom border ============================
        ' ===========================================================
        If index = lastRow Then
            BottomBorderComponent Worksheets(mainWS), rowStart
            Worksheets(mainWS).Rows(14).Delete Shift:=xlUp ' Delete row config
            Exit For    ' stop the loop
        End If

    Next index

End Sub
