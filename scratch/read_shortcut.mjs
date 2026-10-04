import { execSync } from 'node:child_process';

const script = `
$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut("C:\\Users\\bunkh\\OneDrive\\Desktop\\Bunkheang - Chrome.lnk")
[PSCustomObject]@{
  TargetPath = $sc.TargetPath
  Arguments = $sc.Arguments
  WorkingDirectory = $sc.WorkingDirectory
} | ConvertTo-Json
`;

const res = execSync(`powershell -Command "${script.replace(/\n/g, '; ')}"`, { encoding: 'utf-8' });
console.log('Shortcut Details:', res);
