Write-Host "1. Closing Chrome to unlock session and cookie files..."
Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1.5

$src = "C:\Users\bunkh\AppData\Local\Google\Chrome\User Data"
$dst = "C:\Users\bunkh\.ben10fx\browser-profile"

if (-not (Test-Path $dst)) {
    New-Item -ItemType Directory -Path $dst -Force | Out-Null
}

Write-Host "2. Copying Local State..."
Copy-Item "$src\Local State" -Destination "$dst\Local State" -Force

$defaultSrc = "$src\Default"
$defaultDst = "$dst\Default"
if (-not (Test-Path $defaultDst)) {
    New-Item -ItemType Directory -Path $defaultDst -Force | Out-Null
}

Write-Host "3. Copying essential session files..."
$files = @("Preferences", "Secure Preferences", "Login Data", "Web Data", "History", "Favicons", "TransportSecurity")
foreach ($f in $files) {
    if (Test-Path "$defaultSrc\$f") {
        Copy-Item "$defaultSrc\$f" -Destination "$defaultDst\$f" -Force
    }
}

Write-Host "4. Copying Network (Cookies) and Storage..."
$dirs = @("Network", "Sessions", "Storage", "IndexedDB", "Local Storage", "Session Storage")
foreach ($d in $dirs) {
    if (Test-Path "$defaultSrc\$d") {
        Copy-Item "$defaultSrc\$d" -Destination "$defaultDst\$d" -Recurse -Force
    }
}

Write-Host "5. Reopening your Chrome browser..."
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList '--restore-last-session'

Write-Host "✅ Chrome session successfully cloned into Ben10 FX automation profile!"
