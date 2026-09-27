$WshShell = New-Object -ComObject WScript.Shell
$currentDir = $PSScriptRoot

$targetPath = "wscript.exe"
$arguments = "`"$currentDir\launch.vbs`""
$iconLocation = "$currentDir\assets\web-icon.ico"

# 1. Start Menu Shortcut
$startMenuDir = [Environment]::GetFolderPath('Programs')
$startMenuShortcutPath = Join-Path $startMenuDir "LaTeX Editor.lnk"

$shortcut = $WshShell.CreateShortcut($startMenuShortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.Arguments = $arguments
$shortcut.WorkingDirectory = $currentDir
$shortcut.IconLocation = "$iconLocation, 0"
$shortcut.Description = "Modern LaTeX Editor (Offline & High Performance)"
$shortcut.Save()

Write-Host "Created Start Menu shortcut: $startMenuShortcutPath"

# 2. Desktop Shortcut
$desktopDir = [Environment]::GetFolderPath('Desktop')
$desktopShortcutPath = Join-Path $desktopDir "LaTeX Editor.lnk"

$shortcutDesktop = $WshShell.CreateShortcut($desktopShortcutPath)
$shortcutDesktop.TargetPath = $targetPath
$shortcutDesktop.Arguments = $arguments
$shortcutDesktop.WorkingDirectory = $currentDir
$shortcutDesktop.IconLocation = "$iconLocation, 0"
$shortcutDesktop.Description = "Modern LaTeX Editor (Offline & High Performance)"
$shortcutDesktop.Save()

Write-Host "Created Desktop shortcut: $desktopShortcutPath"
Write-Host "LaTeX Editor is now ready and integrated into Windows Start Menu and Desktop!"
