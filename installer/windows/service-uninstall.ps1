# Apparae Windows Service uninstall — invoked by MSI uninstaller.
$ErrorActionPreference = "Stop"
$ServiceName = "ApparaeAgency"

if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $ServiceName | Out-Null
    Write-Host "Apparae Windows Service removed."
} else {
    Write-Host "Apparae Windows Service not present; nothing to remove."
}
