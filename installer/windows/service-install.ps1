# Apparae Windows Service registration.
# Per plan 12-A Task 9. Run elevated (admin) — the MSI installer handles this.
$ErrorActionPreference = "Stop"

$ServiceName = "ApparaeAgency"
$DisplayName = "Apparae Agency Daemon"
$DaemonPath  = "C:\Program Files\Apparae\apparae-daemon.exe"
$DataDir     = "$env:USERPROFILE\.apparae"
$LogDir      = "$env:LOCALAPPDATA\Apparae\logs"

New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
New-Item -ItemType Directory -Force -Path $LogDir  | Out-Null

if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $ServiceName | Out-Null
    Start-Sleep -Seconds 2
}

New-Service `
    -Name $ServiceName `
    -BinaryPathName "`"$DaemonPath`" --data-dir `"$DataDir`"" `
    -DisplayName $DisplayName `
    -Description "Apparae's always-on agency daemon." `
    -StartupType AutomaticDelayedStart

Start-Service -Name $ServiceName

Write-Host "Apparae agency daemon registered as Windows Service."
