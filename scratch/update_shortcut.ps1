$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut("C:\Users\bunkh\OneDrive\Desktop\Bunkheang - Chrome.lnk")
$sc.Arguments = '--profile-directory="Default" --remote-debugging-port=9222'
$sc.Save()

Write-Host "Updated shortcut arguments:" $sc.Arguments
