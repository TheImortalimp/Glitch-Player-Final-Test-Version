param(
    [int]$Width = 1280,
    [int]$Height = 720
)

$ErrorActionPreference = 'Stop'
$app = Join-Path $PSScriptRoot 'app\StandaloneRevisionRFinal.exe'
if (-not (Test-Path $app)) {
    throw "Application files are missing: $app"
}

Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class WindowPlacement {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint flags);
}
'@

$process = Start-Process -FilePath $app -WorkingDirectory $PSScriptRoot -PassThru
$process.WaitForInputIdle(5000) | Out-Null
$windowHandle = [IntPtr]::Zero
for ($attempt = 0; $attempt -lt 50; $attempt++) {
    $process.Refresh()
    $windowHandle = $process.MainWindowHandle
    if ($windowHandle -ne [IntPtr]::Zero) { break }
    Start-Sleep -Milliseconds 100
}
if ($process.HasExited) {
    throw "Standalone shell exited during startup with code $($process.ExitCode)"
}
if ($windowHandle -eq [IntPtr]::Zero) {
    throw 'Standalone shell did not expose a window handle during startup'
}

Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$x = [Math]::Max(0, [int](($screen.Width - $Width) / 2))
$y = [Math]::Max(0, [int](($screen.Height - $Height) / 2))
$flags = 0x0040 -bor 0x0004
[WindowPlacement]::SetWindowPos($windowHandle, [IntPtr]::Zero, $x, $y, $Width, $Height, $flags) | Out-Null
