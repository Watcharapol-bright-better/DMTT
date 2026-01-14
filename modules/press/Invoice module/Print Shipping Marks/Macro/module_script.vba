
Sub tranferData(fromRow As Long)

    Dim wsData As Worksheet
    Dim wsMain As Worksheet

    Dim blockIdx As Long
    Dim posInBlock As Long

    Dim baseRowCustomer As Long
    Dim baseRowQR As Long
    Dim baseRowDelivery As Long

    Dim targetRowCustomer As Long
    Dim targetRowQR As Long
    Dim targetRowDelivery As Long

    Dim colCustomer As String
    Dim colQR As String

    Set wsData = ThisWorkbook.Sheets("raw_data")
    Set wsMain = ThisWorkbook.Sheets("Shipping Mark")

    ' --- Calculate block position ---
    blockIdx = (fromRow - 2) \ 3
    posInBlock = (fromRow - 2) Mod 3

    ' --- Base rows (relative to template) ---
    baseRowCustomer = 3
    baseRowQR = 1
    baseRowDelivery = 5  
    baseRowPartNo = 6

    ' --- Final target rows ---
    targetRowCustomer = baseRowCustomer + (blockIdx * 16)
    targetRowQR = baseRowQR + (blockIdx * 16)
    targetRowDelivery = baseRowDelivery + (blockIdx * 16)
    targetRowPartNo = baseRowPartNo + (blockIdx * 16)

    ' --- Column mapping ---
    Select Case posInBlock
        Case 0
            colCustomer = "F"
            colQR = "J"
        Case 1
            colCustomer = "R"
            colQR = "V"
        Case 2
            colCustomer = "AD"
            colQR = "AH"
    End Select

    ' --- Transfer data ---
    ' QR Code
    wsMain.Cells(targetRowQR, colQR).Value = wsData.Cells(fromRow, "R").Value

    ' Customer Name
    wsMain.Cells(targetRowCustomer, colCustomer).Value = wsData.Cells(fromRow, "D").Value

    ' Delivery Place
    wsMain.Cells(targetRowDelivery, colCustomer).Value = wsData.Cells(fromRow, "O").Value

    ' Part No.
    wsMain.Cells(targetRowPartNo, colCustomer).Value = wsData.Cells(fromRow, "E").Value

End Sub

