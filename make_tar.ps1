# make_tar.ps1 - Creates tar.gz from linux-unpacked using 7-Zip or PowerShell
Set-Location (Join-Path $PSScriptRoot 'app-dist-win')

$sevenZip = 'C:\Program Files\7-Zip\7z.exe'
$tarGz = 'Casjoe-Agent-OS-1.0.0-Linux.tar.gz'
$tarTmp = 'Casjoe-Agent-OS-1.0.0-Linux.tar'
$src = 'linux-unpacked'

Remove-Item $tarGz -Force -ErrorAction SilentlyContinue
Remove-Item $tarTmp -Force -ErrorAction SilentlyContinue

if (Test-Path $sevenZip) {
    Write-Host '7-Zip found, building tar.gz...'
    & $sevenZip a -ttar $tarTmp "$src\*" -r | Out-Null
    & $sevenZip a -tgzip $tarGz $tarTmp | Out-Null
    Remove-Item $tarTmp -Force -ErrorAction SilentlyContinue
    Write-Host "Done: $(Get-Item $tarGz | Select-Object -ExpandProperty Length) bytes"
} else {
    Write-Host '7-Zip not found. The .zip archive will be used instead.'
    Write-Host 'Install 7-Zip from https://7-zip.org to generate tar.gz'
}

Write-Host ''
Write-Host 'Files in app-dist-win:'
Get-ChildItem . -File | Format-Table Name, Length -AutoSize
