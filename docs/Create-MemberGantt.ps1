$csvPath = Join-Path $PWD "wbs.csv"
$xlsxPath = Join-Path $PWD "wbs_gantt_by_member.xlsx"

if (Test-Path $xlsxPath) { Remove-Item $xlsxPath -Force }

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$workbook = $excel.Workbooks.Add()

$data = Import-Csv $csvPath -Encoding UTF8
$firstLine = (Get-Content $csvPath -Encoding UTF8 -TotalCount 1)
$headers = $firstLine -replace '"', '' -split ','

$assigneeHeader = $headers[4]

$members = $data | Select-Object -ExpandProperty $assigneeHeader | Select-Object -Unique

foreach ($member in $members) {
    $memberData = @($data | Where-Object { $_.$assigneeHeader -eq $member })
    
    if ($member -eq $members[0]) {
        $sheet = $workbook.Worksheets.Item(1)
    } else {
        $sheet = $workbook.Worksheets.Add([System.Reflection.Missing]::Value, $workbook.Worksheets.Item($workbook.Worksheets.Count))
    }
    
    $sheet.Name = $member
    
    for ($c = 0; $c -lt $headers.Count; $c++) {
        $cell = $sheet.Cells.Item(1, $c+1)
        $cell.Value2 = $headers[$c]
        $cell.Font.Bold = $true
        $cell.Font.Color = 0xFFFFFF
        $cell.Interior.Color = 0x5D4135
        $cell.HorizontalAlignment = -4108
        $cell.VerticalAlignment = -4108
    }

    $startDate = [datetime]"2026-04-01"
    for ($d = 0; $d -lt 20; $d++) {
        $col = 9 + $d
        $cell = $sheet.Cells.Item(1, $col)
        $cell.Value2 = $startDate.AddDays($d).ToString("yyyy-MM-dd")
        $cell.NumberFormat = "m/d"
        $cell.Font.Bold = $true
        $cell.Font.Color = 0xFFFFFF
        $cell.Interior.Color = 0x5D4135
        $cell.HorizontalAlignment = -4108
        $cell.VerticalAlignment = -4108
        $sheet.Columns.Item($col).ColumnWidth = 4
    }

    $sheet.Rows.Item(1).RowHeight = 25

    for ($r = 0; $r -lt $memberData.Count; $r++) {
        $row = $memberData[$r]
        $rowNum = $r + 2
        $sheet.Rows.Item($rowNum).RowHeight = 20
        
        $props = @()
        foreach ($h in $headers) { $props += $row.$h }
        
        for ($c = 0; $c -lt 5; $c++) {
            $sheet.Cells.Item($rowNum, $c+1).Value2 = $props[$c]
            $sheet.Cells.Item($rowNum, $c+1).VerticalAlignment = -4108
        }
        
        $sheet.Cells.Item($rowNum, 6).Value2 = $props[5]
        $sheet.Cells.Item($rowNum, 6).NumberFormat = "yyyy-mm-dd"
        $sheet.Cells.Item($rowNum, 6).HorizontalAlignment = -4108
        $sheet.Cells.Item($rowNum, 6).VerticalAlignment = -4108

        $sheet.Cells.Item($rowNum, 7).Value2 = $props[6]
        $sheet.Cells.Item($rowNum, 7).NumberFormat = "yyyy-mm-dd"
        $sheet.Cells.Item($rowNum, 7).HorizontalAlignment = -4108
        $sheet.Cells.Item($rowNum, 7).VerticalAlignment = -4108
        
        $sheet.Cells.Item($rowNum, 8).Value2 = $props[7]
        $sheet.Cells.Item($rowNum, 8).HorizontalAlignment = -4108
        $sheet.Cells.Item($rowNum, 8).VerticalAlignment = -4108
    }

    $totalRows = $memberData.Count + 1
    if ($totalRows -ge 2) {
        $ganttRange = $sheet.Range("I2:AB$totalRows")
        $missing = [System.Reflection.Missing]::Value
        $fc = $ganttRange.FormatConditions.Add(2, $missing, "=AND(I`$1>=`$F2, I`$1<=`$G2)")
        $fc.Interior.Color = 0xE2904A 
        $fc.Borders.LineStyle = 1
        $fc.Borders.Color = 0xE2904A

        $fullRange = $sheet.Range("A1:AB$totalRows")
        $fullRange.Borders.LineStyle = 1
        $fullRange.Borders.Weight = 2
        $fullRange.Borders.Color = 0xE0E0E0
        
        for ($r = 2; $r -le $totalRows; $r++) {
            if ($r % 2 -eq 0) {
                $sheet.Range("A$r:H$r").Interior.Color = 0xF7F7F7
            } else {
                $sheet.Range("A$r:H$r").Interior.Color = 0xFFFFFF
            }
        }
    }

    $sheet.Columns.Item(1).AutoFit() | Out-Null
    $sheet.Columns.Item(2).AutoFit() | Out-Null
    $sheet.Columns.Item(3).AutoFit() | Out-Null
    $sheet.Columns.Item(4).ColumnWidth = 45 
    $sheet.Columns.Item(5).AutoFit() | Out-Null
    $sheet.Columns.Item(6).AutoFit() | Out-Null
    $sheet.Columns.Item(7).AutoFit() | Out-Null
    $sheet.Columns.Item(8).AutoFit() | Out-Null
    
    $sheet.Activate()
    $excel.ActiveWindow.SplitRow = 1
    $excel.ActiveWindow.SplitColumn = 7
    $excel.ActiveWindow.FreezePanes = $true
}

$workbook.Worksheets.Item(1).Activate()

try {
    $workbook.SaveAs($xlsxPath, 51)
    Write-Output "Excel created at $xlsxPath"
} catch {
    Write-Error "Failed to save: $_"
} finally {
    $workbook.Close($false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
