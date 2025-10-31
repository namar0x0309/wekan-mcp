# made by namar0x0309 with ❤️ at GoAIX
# get-wekan-token.ps1
Write-Host "=== Wekan Token Generator ===" -ForegroundColor Cyan
Write-Host "made by namar0x0309 with ❤️ at GoAIX" -ForegroundColor Cyan

# Ask for endpoint (default if blank)
$Endpoint = Read-Host "Enter Wekan endpoint (default: https://wekan.namar0x0309.com)"
if ([string]::IsNullOrWhiteSpace($Endpoint)) {
    $Endpoint = "https://wekan.namar0x0309.com"
}

# Ask for username
$Username = Read-Host "Enter username"
if ([string]::IsNullOrWhiteSpace($Username)) {
    Write-Host "Username is required." -ForegroundColor Red
    exit 1
}

# Secure password input
$SecurePass = Read-Host "Enter password" -AsSecureString
$Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePass)
)

if ([string]::IsNullOrWhiteSpace($Password)) {
    Write-Host "Password is required." -ForegroundColor Red
    exit 1
}

Write-Host "`nAuthenticating with Wekan..." -ForegroundColor Yellow

# Build request
$Body = @{
    username = $Username
    password = $Password
} | ConvertTo-Json -Depth 3

try {
    $Response = Invoke-RestMethod -Uri "$Endpoint/users/login" -Method Post -Body $Body -ContentType "application/json"
} catch {
    Write-Host "Error: Failed to connect or invalid credentials." -ForegroundColor Red
    $_ | Format-List -Force
    exit 1
}

if (-not $Response.token) {
    Write-Host "Login failed or no token returned:" -ForegroundColor Red
    $Response | ConvertTo-Json -Depth 5
    exit 1
}

# Write .env file
@"
# Wekan MCP Server Configuration
WEKAN_BASE_URL=$Endpoint
WEKAN_API_TOKEN=$($Response.token)
WEKAN_USER_ID=$($Response.id)
WEKAN_TOKEN_EXPIRES=$($Response.tokenExpires)
"@ | Set-Content ".env"

# Update mcp-inspector-config.json if it exists
if (Test-Path "mcp-inspector-config.json") {
    $config = Get-Content "mcp-inspector-config.json" -Raw | ConvertFrom-Json
    
    # Update WEKAN_BASE_URL in both wekan-username and wekan entries
    if ($config.mcpServers."wekan-username") {
        $config.mcpServers."wekan-username".env.WEKAN_BASE_URL = $Endpoint
    }
    if ($config.mcpServers.wekan) {
        $config.mcpServers.wekan.env.WEKAN_BASE_URL = $Endpoint
    }
    
    # Save the updated config
    $config | ConvertTo-Json -Depth 10 | Set-Content "mcp-inspector-config.json"
    Write-Host "✅ Updated WEKAN_BASE_URL in mcp-inspector-config.json" -ForegroundColor Green
}

Write-Host "`n✅ Authentication successful!" -ForegroundColor Green
Write-Host "Token saved to .env"
Write-Host "Token expires: $($Response.tokenExpires)"
