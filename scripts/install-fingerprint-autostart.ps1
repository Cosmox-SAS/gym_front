$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$runnerPath = Join-Path $projectRoot "scripts\run-fingerprint-service.ps1"
$taskName = "CosmoGym Fingerprint Service"
$python = (Get-Command python -ErrorAction Stop).Source

$dllCandidates = @(
    "C:\Program Files\DigitalPersona\U.are.U SDK\Windows\Lib\x64\dpfj.dll",
    "C:\Program Files\DigitalPersona\U.are.U RTE\Windows\Lib\x64\dpfj.dll",
    "C:\Windows\System32\dpfj.dll",
    "C:\Windows\SysWOW64\dpfj.dll"
)

$dllPath = $dllCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $dllPath) {
    throw "No se encontro dpfj.dll. Instala DigitalPersona U.are.U Runtime/SDK antes de continuar."
}

& $python -m pip install flask flask-cors

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runnerPath`"" `
    -WorkingDirectory $projectRoot

$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)
$settings.DisallowStartIfOnBatteries = $false
$settings.StopIfGoingOnBatteries = $false

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Servicio local de matching de huellas para CosmoGym" `
    -Force | Out-Null

Start-ScheduledTask -TaskName $taskName

Write-Host "OK: tarea instalada y servicio iniciado."
Write-Host "Tarea: $taskName"
Write-Host "DLL: $dllPath"
Write-Host "Servicio: http://127.0.0.1:3002/health"
