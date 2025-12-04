
Sub addQTTableRow(RowNumber As Long)

    Dim ws As Worksheet
    Set ws = ActiveSheet   ' safe if calling from that sheet

    ' Insert a new row
    ws.Rows(RowNumber).Insert Shift:=xlDown

    ' Bottom dashed border (B to W)
    With ws.Range("B" & RowNumber & ":W" & RowNumber).Borders(xlEdgeBottom)
        .LineStyle = xlDash
        .Weight = xlThin
    End With

    ' ======================================================================
    ' Left border of column B
    With ws.Range("B" & RowNumber).Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    ' Right border of column W
    With ws.Range("W" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With



    With ws.Range("B" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("C" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("D" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("H" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("I" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With


    With ws.Range("J" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("K" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("L" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("M" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("N" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("O" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("P" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("Q" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("R" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("S" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("T" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("U" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("V" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With

    With ws.Range("W" & RowNumber).Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .Weight = xlThin
    End With


End Sub



