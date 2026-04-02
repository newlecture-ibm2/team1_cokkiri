$csvPath = Join-Path $PSScriptRoot "wbs_allocated.csv"

if (-not (Test-Path $csvPath)) {
    Write-Host "File not found: $csvPath" -ForegroundColor Red
    exit
}

$data = Import-Csv $csvPath -Encoding UTF8
$firstLine = (Get-Content $csvPath -Encoding UTF8 -TotalCount 1)
$headers = $firstLine -replace '"', '' -split ','

$colWbsId = $headers[0]
$colDomain = $headers[1]
$colTask = $headers[2]
$colDesc = $headers[3]
$colAssignee = $headers[4]
$colStart = $headers[5]
$colEnd = $headers[6]
$colGitHubId = $headers[8]
$colLabels = $headers[9]
$colComponent = $headers[10]

Write-Host "Starting GitHub issue creation..." -ForegroundColor Cyan

foreach ($row in $data) {
    if ([string]::IsNullOrWhiteSpace($row.$colWbsId)) { continue }

    $taskName = $row.$colTask
    $roleType = $row.$colComponent
    $domainCode = ($row.$colWbsId -split '-')[0]
    
    $title = "[$domainCode] $taskName"
    
    $body = @"
### 작업 설명
$($row.$colDesc)

---
### 상세 정보
- **이슈 유형:** 스토리
- **컴포넌트:** $roleType
- **초기 담당자:** $($row.$colAssignee)
- **예정 일정:** $($row.$colStart) ~ $($row.$colEnd)
- **도메인 (분류):** $($row.$colDomain)
- **WBS ID:** $($row.$colWbsId)

---
### 컨트롤 가이드 (Reminder)

- **Branch:** feat/#이슈번호
- **Commit:** :이모지: [$domainCode] 커밋메세지
- **MR:** [$domainCode/feat] $taskName
"@

    $csvLabels = $row.$colLabels
    # 도메인 코드(예: USR)를 기본 라벨로 포함
    $labelsArray = @($domainCode)
    if (-not [string]::IsNullOrWhiteSpace($csvLabels)) {
        $labelsArray += $csvLabels -split ','
    }

    $assignee = $row.$colGitHubId

    $commandArgs = @("issue", "create")
    $commandArgs += "--title"
    $commandArgs += $title
    $commandArgs += "--body"
    $commandArgs += $body
    
    foreach ($label in $labelsArray) {
        $commandArgs += "--label"
        $commandArgs += $label.Trim()
    }

    if (-not [string]::IsNullOrWhiteSpace($assignee)) {
        $commandArgs += "--assignee"
        $commandArgs += $assignee
    }

    Write-Host "Drafting: $title" -NoNewline
    
    try {
        $cmdString = "gh issue create --title ""$title"" --label ""$labels"" ..."
        Write-Host " -> [Simulation] (Role: $roleType)" -ForegroundColor DarkGray
        
        <# Uncomment to run:
        & gh @commandArgs
        Write-Host " -> Created!" -ForegroundColor Green
        #>
    } catch {
        Write-Host " -> Error: $_" -ForegroundColor Red
    }
}
Write-Host "Done." -ForegroundColor Cyan

