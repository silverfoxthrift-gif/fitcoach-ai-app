# ==========================================================================
#  Coach Rey - start-backend.ps1
#  Brings your site online by starting the two things it needs on this PC:
#    1. n8n      - the workflow engine that talks to Claude
#    2. ngrok    - the stable public tunnel (fixed address, never changes)
#
#  Your live site:  https://fitcoach-ai-app-silverfoxthrift.vercel.app
#
#  The site is online ONLY while this PC is awake and the two windows this
#  opens stay running. To take the site offline, close those two windows.
#  (Easiest way to run this: double-click "Start Coach Rey.cmd".)
# ==========================================================================

$Domain  = 'small-dugout-otter.ngrok-free.dev'
$SiteUrl = 'https://fitcoach-ai-app-silverfoxthrift.vercel.app'
$Port    = 5678

Write-Host ''
Write-Host '  Coach Rey - starting your backend...' -ForegroundColor Cyan
Write-Host ''

# --- find ngrok.exe (durable location, then a bundled copy, then PATH) ---
$ngrok = $null
foreach ($c in @(
    (Join-Path $env:USERPROFILE 'ngrok\ngrok.exe'),
    (Join-Path $PSScriptRoot   'tools\ngrok.exe'))) {
  if (Test-Path $c) { $ngrok = $c; break }
}
if (-not $ngrok) {
  $cmd = Get-Command ngrok -ErrorAction SilentlyContinue
  if ($cmd) { $ngrok = $cmd.Source }
}
if (-not $ngrok) {
  Write-Host '  ERROR: could not find ngrok.exe.' -ForegroundColor Red
  Write-Host "         Expected at: $env:USERPROFILE\ngrok\ngrok.exe" -ForegroundColor Red
  Read-Host '  Press Enter to close'
  exit 1
}

# --- is n8n already healthy? ---
function Test-N8n {
  try {
    (Invoke-WebRequest "http://localhost:$Port/healthz" -UseBasicParsing -TimeoutSec 3).StatusCode -eq 200
  } catch { $false }
}

if (Test-N8n) {
  Write-Host '  n8n is already running.' -ForegroundColor Green
} else {
  Write-Host '  Starting n8n in a new window (first launch can take a minute)...'
  Start-Process 'cmd.exe' -ArgumentList '/k', 'npx n8n start'
  Write-Host -NoNewline '  Waiting for n8n to be ready'
  $ready = $false
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 2
    Write-Host -NoNewline '.'
    if (Test-N8n) { $ready = $true; break }
  }
  Write-Host ''
  if (-not $ready) {
    Write-Host '  n8n did not come up in time. Check its window for errors, then re-run.' -ForegroundColor Red
    Read-Host '  Press Enter to close'
    exit 1
  }
  Write-Host '  n8n is ready.' -ForegroundColor Green
}

# --- start the stable tunnel ---
Write-Host "  Opening the public tunnel on $Domain ..."
Start-Process $ngrok -ArgumentList 'http', "$Port", "--domain=$Domain"
Start-Sleep -Seconds 3

Write-Host ''
Write-Host '  ============================================================'
Write-Host '   Coach Rey is LIVE' -ForegroundColor Green
Write-Host "   Open:  $SiteUrl"
Write-Host '  ============================================================'
Write-Host ''
Write-Host '  Two windows are now running (n8n + ngrok). Keep them open.'
Write-Host '  To take the site OFFLINE: close both of those windows.'
Write-Host ''
Read-Host '  Press Enter to close this launcher (the site stays up)'
