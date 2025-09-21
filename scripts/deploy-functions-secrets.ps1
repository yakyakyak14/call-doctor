# scripts/deploy-functions-secrets.ps1
# Prompts for secrets, sets them only for this session, deploys functions, then cleans up.

param()

$ErrorActionPreference = 'Stop'

function Read-Secret([string]$Prompt) {
  $sec = Read-Host $Prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Remove-EnvVars([string[]]$Names) {
  foreach ($n in $Names) {
    try { Remove-Item "Env:$n" -ErrorAction SilentlyContinue } catch {}
  }
}

# Ensure Supabase CLI is available
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  Write-Error "Supabase CLI not found. Install: https://supabase.com/docs/guides/cli"
  exit 1
}

Write-Host "This script will set Supabase Edge Function secrets and deploy functions."
Write-Host "Note: SUPABASE_URL and SUPABASE_ANON_KEY are auto-injected by Supabase; do NOT set them as secrets." -ForegroundColor Yellow

# Prompt for secrets (masked)
$vapiApiKey        = Read-Secret "VAPI_API_KEY"
$vapiAssistantId   = Read-Secret "VAPI_ASSISTANT_ID"

$useId = Read-Host "Do you use a Vapi phone number ID instead of a raw phone number? (y/N)"
$vapiPhoneNumber   = $null
$vapiPhoneNumberId = $null
if ($useId -match '^(y|yes)$') {
  $vapiPhoneNumberId = Read-Secret "VAPI_PHONE_NUMBER_ID"
} else {
  $vapiPhoneNumber   = Read-Secret "VAPI_PHONE_NUMBER (+234... or +1...)"
}

$serviceRoleKey    = Read-Secret "SERVICE_ROLE_KEY (Supabase Service Role; do NOT use SUPABASE_* prefix)"
$paystackSecretKey = Read-Secret "PAYSTACK_SECRET_KEY"

# Set env vars in this session only
$env:VAPI_API_KEY        = $vapiApiKey
$env:VAPI_ASSISTANT_ID   = $vapiAssistantId
if ($vapiPhoneNumber)   { $env:VAPI_PHONE_NUMBER    = $vapiPhoneNumber }
if ($vapiPhoneNumberId) { $env:VAPI_PHONE_NUMBER_ID = $vapiPhoneNumberId }
$env:SERVICE_ROLE_KEY    = $serviceRoleKey
$env:PAYSTACK_SECRET_KEY = $paystackSecretKey

# Build secrets list conditionally
$secrets = @()
$secrets += "VAPI_API_KEY=$env:VAPI_API_KEY"
$secrets += "VAPI_ASSISTANT_ID=$env:VAPI_ASSISTANT_ID"
if ($env:VAPI_PHONE_NUMBER)    { $secrets += "VAPI_PHONE_NUMBER=$env:VAPI_PHONE_NUMBER" }
if ($env:VAPI_PHONE_NUMBER_ID) { $secrets += "VAPI_PHONE_NUMBER_ID=$env:VAPI_PHONE_NUMBER_ID" }
$secrets += "SERVICE_ROLE_KEY=$env:SERVICE_ROLE_KEY"
$secrets += "PAYSTACK_SECRET_KEY=$env:PAYSTACK_SECRET_KEY"

$setSucceeded = $false
try {
  Write-Host "`nSetting Supabase secrets..." -ForegroundColor Cyan
  & supabase secrets set @secrets

  $setSucceeded = $true

  Write-Host "`nDeploying Edge Functions..." -ForegroundColor Cyan
  & supabase functions deploy vapi-call
  & supabase functions deploy verify-paystack

  Write-Host "`nCurrent secrets (names only):" -ForegroundColor Cyan
  & supabase secrets list

  Write-Host "`nAll done." -ForegroundColor Green
}
finally {
  # Cleanup env vars
  Remove-EnvVars @(
    'VAPI_API_KEY',
    'VAPI_ASSISTANT_ID',
    'VAPI_PHONE_NUMBER',
    'VAPI_PHONE_NUMBER_ID',
    'SERVICE_ROLE_KEY',
    'PAYSTACK_SECRET_KEY'
  )
  if ($setSucceeded) {
    Write-Host "Cleaned up session environment variables." -ForegroundColor DarkGray
  }
}
