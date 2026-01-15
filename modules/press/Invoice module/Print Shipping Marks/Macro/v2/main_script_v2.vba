Private Sub Workbook_Open()

    Dim wsData As Worksheet
    Dim wsTemplate As Worksheet
    Dim wsMain As Worksheet

    Dim lastRow As Long
    Dim r As Long

    Dim groupSet As Object
    Dim grp As Variant

    Dim groupRowIndex As Long

    Set wsData = Worksheets("raw_data")
    Set wsTemplate = Worksheets("Shipping Mark")

    ' Create Group Set
    Set groupSet = CreateObject("Scripting.Dictionary")

    ' Get last row
    lastRow = wsData.Cells(wsData.Rows.Count, "A").End(xlUp).Row
    If lastRow < 2 Then Exit Sub

    ' Build Group Set (column R)
    For r = 2 To lastRow
        If Not groupSet.Exists(wsData.Cells(r, "R").Value) Then
            groupSet.Add wsData.Cells(r, "R").Value, True
        End If
    Next r

    ' Loop each Group
    For Each grp In groupSet.Keys

        ' Clone template
        wsTemplate.Copy After:=Sheets(Sheets.Count)
        Set wsMain = ActiveSheet
        wsMain.Name = "Shipping Mark " & grp

        ' RESET counter for this sheet
        groupRowIndex = 0

        ' Loop raw_data rows
        For r = 2 To lastRow
            If wsData.Cells(r, "R").Value = grp Then
                tranferData r, wsMain, groupRowIndex
                groupRowIndex = groupRowIndex + 1
            End If
        Next r

    Next grp

End Sub


