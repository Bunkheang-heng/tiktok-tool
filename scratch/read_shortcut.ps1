$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut("C:\Users\bunkh\OneDrive\Desktop\Bunkheang - Chrome.lnk")
Write-Host "TargetPath:" $sc.TargetPath
Write-Host "Arguments:" $sc.Arguments
