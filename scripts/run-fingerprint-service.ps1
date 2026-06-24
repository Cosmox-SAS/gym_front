$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$logPath = Join-Path $projectRoot "fingerprint_service.task.log"
$python = (Get-Command python -ErrorAction Stop).Source

Set-Location $projectRoot
$ErrorActionPreference = "Continue"
& $python (Join-Path $projectRoot "fingerprint_service.py") *>> $logPath
