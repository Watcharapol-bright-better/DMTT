Sub tranferData(fromRow As Long, wsMain As Worksheet, groupRowIndex As Long)

    Dim wsData As Worksheet
    Set wsData = Worksheets("raw_data")

    Dim blockIdx As Long
    Dim posInBlock As Long
    Dim baseOffset As Long

    Dim calData As String
    Dim colQR As String
    Dim colWeight As String

    Dim qrShape As Shape
    Dim qrCell As Range
    Dim newShape As Shape

    ' --- Block calculation (RESET per sheet) ---
    blockIdx = groupRowIndex \ 3
    posInBlock = groupRowIndex Mod 3
    baseOffset = blockIdx * 16

    ' --- Column mapping ---
    Select Case posInBlock
        Case 0: calData = "F":  colQR = "J":  colWeight = "J"
        Case 1: calData = "R":  colQR = "V":  colWeight = "V"
        Case 2: calData = "AD": colQR = "AH": colWeight = "AH"
    End Select

    ' ==================================================
    ' QR Code (KEEP LOGIC)
    ' ==================================================
    Set qrCell = wsData.Cells(fromRow, "V")

    On Error Resume Next
    For Each qrShape In wsMain.Shapes
        If Not Intersect(wsMain.Cells(1 + baseOffset, colQR), _
                         wsMain.Range(qrShape.TopLeftCell, qrShape.BottomRightCell)) Is Nothing Then
            qrShape.Delete
        End If
    Next qrShape
    On Error GoTo 0

    For Each qrShape In wsData.Shapes
        If Not Intersect(qrCell, wsData.Range(qrShape.TopLeftCell, qrShape.BottomRightCell)) Is Nothing Then
            qrShape.Copy
            wsMain.Cells(1 + baseOffset, colQR).PasteSpecial

            Set newShape = wsMain.Shapes(wsMain.Shapes.Count)
            With newShape
                .Top = wsMain.Cells(1 + baseOffset, colQR).Top + 5
                .Left = wsMain.Cells(1 + baseOffset, colQR).Left
            End With
            Exit For
        End If
    Next qrShape

    ' ==================================================
    ' Data transfer
    ' ==================================================
    ' --- Main data columns (F / R / AD) ---
    
    wsMain.Cells(3 + baseOffset, calData).Value = wsData.Cells(fromRow, "D").Value    ' Customer Name
    wsMain.Cells(4 + baseOffset, calData).Value = wsData.Cells(fromRow, "O").Value    ' Delivery Place
    wsMain.Cells(5 + baseOffset, calData).Value = wsData.Cells(fromRow, "F").Value    ' Part Name
    wsMain.Cells(6 + baseOffset, calData).Value = wsData.Cells(fromRow, "E").Value    ' Part No.
    wsMain.Cells(7 + baseOffset, calData).Value = wsData.Cells(fromRow, "B").Value    ' Order No.
    wsMain.Cells(8 + baseOffset, calData).Value = wsData.Cells(fromRow, "L").Value    ' MFG Date
    wsMain.Cells(9 + baseOffset, calData).Value = wsData.Cells(fromRow, "M").Value    ' Lot No.
    wsMain.Cells(10 + baseOffset, calData).Value = wsData.Cells(fromRow, "H").Value   ' Packages
    wsMain.Cells(11 + baseOffset, calData).Value = wsData.Cells(fromRow, "N").Value   ' Quantity
    wsMain.Cells(12 + baseOffset, calData).Value = wsData.Cells(fromRow, "P").Value   ' Invoice No.
    wsMain.Cells(13 + baseOffset, calData).Value = wsData.Cells(fromRow, "Q").Value   ' Delivery Date
    
    ' --- Weight columns (J / V / AH) ---
    wsMain.Cells(10 + baseOffset, colWeight).Value = wsData.Cells(fromRow, "I").Value ' Net Weight
    wsMain.Cells(11 + baseOffset, colWeight).Value = wsData.Cells(fromRow, "K").Value ' Gross Weight


End Sub


