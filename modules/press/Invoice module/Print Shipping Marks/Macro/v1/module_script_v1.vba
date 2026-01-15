Sub tranferData(fromRow As Long)

    Dim wsData As Worksheet
    Dim wsMain As Worksheet

    Dim blockIdx As Long
    Dim posInBlock As Long

    Dim baseRowCustomer As Long
    Dim baseRowQR As Long
    Dim baseRowDelivery As Long
    Dim baseRowPartName As Long
    Dim baseRowPartNo As Long
    Dim baseRowOrderNo As Long
    Dim baseRowMFGDate As Long
    Dim baseRowLotNo As Long
    Dim baseRowPackages As Long
    Dim baseRowQTY As Long
    Dim baseRowNetWeight As Long
    Dim baseRowGrossWeight As Long
    Dim baseRowInvoiceNo As Long
    Dim baseRowDeliveryDate As Long

    Dim targetRowCustomer As Long
    Dim targetRowQR As Long
    Dim targetRowDelivery As Long
    Dim targetRowPartName As Long
    Dim targetRowPartNo As Long
    Dim targetOrderNo As Long
    Dim targetMFGDate As Long
    Dim targetLotNo As Long
    Dim targetPackages As Long
    Dim targetQTY As Long
    Dim targetNetWeight As Long
    Dim targetGrossWeight As Long
    Dim targetInvoiceNo As Long
    Dim targetDeliveryDate As Long

    Dim calData As String
    Dim colQR As String
    Dim colWeight As String
    
    Dim qrShape As Shape
    Dim qrCell As Range
    Dim newShape As Shape

    Set wsData = ThisWorkbook.Sheets("raw_data")
    Set wsMain = ThisWorkbook.Sheets("Shipping Mark")

    ' Calculate block position
    blockIdx = (fromRow - 2) \ 3
    posInBlock = (fromRow - 2) Mod 3

    ' Base rows (relative to template)
    baseRowCustomer = 3
    baseRowQR = 1
    baseRowDelivery = 4
    baseRowPartNo = 6
    baseRowPartName = 5
    baseRowOrderNo = 7
    baseRowMFGDate = 8
    baseRowLotNo = 9
    baseRowNetWeight = 10
    baseRowGrossWeight = 11
    baseRowPackages = 10
    baseRowQTY = 11
    baseRowInvoiceNo = 12
    baseRowDeliveryDate = 13

    ' Final target rows
    targetRowCustomer = baseRowCustomer + (blockIdx * 16)
    targetRowQR = baseRowQR + (blockIdx * 16)
    targetRowDelivery = baseRowDelivery + (blockIdx * 16)
    targetRowPartName = baseRowPartName + (blockIdx * 16)
    targetRowPartNo = baseRowPartNo + (blockIdx * 16)
    targetOrderNo = baseRowOrderNo + (blockIdx * 16)
    targetMFGDate = baseRowMFGDate + (blockIdx * 16)
    targetLotNo = baseRowLotNo + (blockIdx * 16)
    targetNetWeight = baseRowNetWeight + (blockIdx * 16)
    targetGrossWeight = baseRowGrossWeight + (blockIdx * 16)
    targetPackages = baseRowPackages + (blockIdx * 16)
    targetQTY = baseRowQTY + (blockIdx * 16)
    targetInvoiceNo = baseRowInvoiceNo + (blockIdx * 16)
    targetDeliveryDate = baseRowDeliveryDate + (blockIdx * 16)

    ' Column mapping
    Select Case posInBlock
        Case 0
            calData = "F"
            colQR = "J"
            colWeight = "J"
        Case 1
            calData = "R"
            colQR = "V"
            colWeight = "V"
        Case 2
            calData = "AD"
            colQR = "AH"
            colWeight = "AH"
    End Select

    ' Delete old QR Code shape at target location
    Set qrCell = wsData.Cells(fromRow, "R")
    
    On Error Resume Next
    For Each qrShape In wsMain.Shapes
        If Not Intersect(wsMain.Range(wsMain.Cells(targetRowQR, colQR), _
                         wsMain.Cells(targetRowQR, colQR)), _
                         wsMain.Range(qrShape.TopLeftCell, qrShape.BottomRightCell)) Is Nothing Then
            qrShape.Delete
        End If
    Next qrShape
    On Error GoTo 0
    
    ' Copy QR Code shape from raw_data
    For Each qrShape In wsData.Shapes
        If Not Intersect(qrCell, wsData.Range(qrShape.TopLeftCell, qrShape.BottomRightCell)) Is Nothing Then
            qrShape.Copy
            wsMain.Cells(targetRowQR, colQR).Select
            wsMain.Paste
            
            ' Adjust position with margin
            Set newShape = wsMain.Shapes(wsMain.Shapes.Count)
            With newShape
                .Top = wsMain.Cells(targetRowQR, colQR).Top + 5
                .Left = wsMain.Cells(targetRowQR, colQR).Left
            End With
            
            Exit For
        End If
    Next qrShape

    ' Transfer data from raw_data to Shipping Mark
    wsMain.Cells(targetRowCustomer, calData).Value = wsData.Cells(fromRow, "D").Value      ' Customer Name
    wsMain.Cells(targetRowDelivery, calData).Value = wsData.Cells(fromRow, "O").Value      ' Delivery Place
    wsMain.Cells(targetRowPartNo, calData).Value = wsData.Cells(fromRow, "E").Value        ' Part No.
    wsMain.Cells(targetRowPartName, calData).Value = wsData.Cells(fromRow, "F").Value      ' Part Name
    wsMain.Cells(targetOrderNo, calData).Value = wsData.Cells(fromRow, "B").Value          ' Order No.
    wsMain.Cells(targetMFGDate, calData).Value = wsData.Cells(fromRow, "L").Value          ' MFG Date
    wsMain.Cells(targetLotNo, calData).Value = wsData.Cells(fromRow, "M").Value            ' Lot No
    wsMain.Cells(targetPackages, calData).Value = wsData.Cells(fromRow, "H").Value         ' Packages
    wsMain.Cells(targetQTY, calData).Value = wsData.Cells(fromRow, "N").Value              ' QTY
    wsMain.Cells(targetInvoiceNo, calData).Value = wsData.Cells(fromRow, "P").Value        ' Invoice No.
    wsMain.Cells(targetDeliveryDate, calData).Value = wsData.Cells(fromRow, "Q").Value     ' Delivery Date
    
    ' Weight group - using colWeight (J, V, AH)
    wsMain.Cells(targetNetWeight, colWeight).Value = wsData.Cells(fromRow, "I").Value      ' Net Weight
    wsMain.Cells(targetGrossWeight, colWeight).Value = wsData.Cells(fromRow, "K").Value    ' Gross Weight

End Sub



