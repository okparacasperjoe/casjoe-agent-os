import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ipcMain } from 'electron';

/**
 * Casjoe Agent OS - Electron Desktop Bridge
 * Enables native OS interaction, command execution, file operations, and security checks.
 */

// Helper to sanitize command inputs and analyze risk level
function analyzeCommandRisk(command) {
  const highRiskPatterns = [
    /rm\s+-rf/i,
    /format\s+/i,
    /del\s+\/[sfq]/i,
    /rd\s+\/s/i,
    /drop\s+database/i,
    /shutdown/i,
    /reg\s+delete/i,
    />\s*\/dev\/sd/i
  ];

  for (const pattern of highRiskPatterns) {
    if (pattern.test(command)) {
      return { isHighRisk: true, reason: `Command contains high-risk pattern: ${pattern}` };
    }
  }
  return { isHighRisk: false };
}

export function setupAgentBridge(mainWindow) {
  // 1. Execute Terminal / Shell Commands
  ipcMain.handle('agent:run-command', async (event, { command, cwd, timeout = 30000 }) => {
    const risk = analyzeCommandRisk(command);
    if (risk.isHighRisk) {
      return { success: false, error: `Blocked for safety: ${risk.reason}`, requiresApproval: true };
    }

    const workingDir = cwd || os.homedir();

    return new Promise((resolve) => {
      exec(command, { cwd: workingDir, timeout, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            success: false,
            error: error.message,
            stdout: stdout || '',
            stderr: stderr || ''
          });
        } else {
          resolve({
            success: true,
            stdout: stdout.trim(),
            stderr: stderr.trim()
          });
        }
      });
    });
  });

  // 2. Read File Content
  ipcMain.handle('agent:read-file', async (event, { filePath }) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content, filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 3. Write / Save File
  ipcMain.handle('agent:write-file', async (event, { filePath, content, createDirs = true }) => {
    try {
      if (createDirs) {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
      }
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true, filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 4. List Directory Contents
  ipcMain.handle('agent:list-dir', async (event, { dirPath }) => {
    try {
      const targetDir = dirPath || os.homedir();
      const items = await fs.readdir(targetDir, { withFileTypes: true });
      const files = items.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        path: path.join(targetDir, item.name)
      }));
      return { success: true, dirPath: targetDir, files };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 5. Fetch System Information
  ipcMain.handle('agent:get-system-info', async () => {
    const total = os.totalmem();
    const free = os.freemem();
    return {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      totalMem: (total / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      freeMem: (free / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      totalMemory: total,
      freeMemory: free,
      cpuCount: os.cpus().length,
      cpus: os.cpus().length,
      hostname: os.hostname(),
      userInfo: os.userInfo().username,
      homedir: os.homedir()
    };
  });

  // 7. Import Chrome Cookies into Persistent Session
  ipcMain.handle('agent:import-cookies', async (event, { cookies }) => {
    try {
      if (!cookies || !Array.isArray(cookies)) {
        return { success: false, error: 'Invalid cookies format' };
      }

      const { session } = await import('electron');
      const targetSessions = [
        mainWindow.webContents.session,
        session.fromPartition('persist:casjoe_agent_browser'),
        session.defaultSession
      ];

      let successCount = 0;
      for (const cookie of cookies) {
        let setInAny = false;

        // Generate URL variations to cover subdomains (e.g. facebook.com, web.facebook.com, www.facebook.com)
        const cleanDomain = cookie.domain.replace(/^\./, '');
        const targetUrls = new Set([
          cookie.url,
          `https://${cleanDomain}`,
          `http://${cleanDomain}`,
          `https://www.${cleanDomain}`,
          `https://m.${cleanDomain}`,
          `https://web.${cleanDomain}`
        ]);

        for (const targetSession of targetSessions) {
          if (!targetSession || !targetSession.cookies) continue;

          for (const url of targetUrls) {
            try {
              await targetSession.cookies.set({
                url,
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path || '/',
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                expirationDate: cookie.expirationDate
              });
              setInAny = true;
            } catch {
              // Ignore single URL variation errors
            }
          }
        }

        if (setInAny) successCount++;
      }

      return { success: true, count: successCount, total: cookies.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 7.5. Auto-pull Chrome Cookies
  ipcMain.handle('agent:auto-import-cookies', async (event, { browser, items }) => {
    try {
      if (browser && !browser.includes('Chrome')) {
        return { success: false, error: 'Only Chrome automatic import is fully supported right now.' };
      }

      const localAppData = process.env.LOCALAPPDATA;
      const localStatePath = path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Local State');
      const cookiesPath = path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'Network', 'Cookies');
      
      const { existsSync, copyFileSync, readFileSync, unlinkSync } = await import('fs');
      if (!existsSync(localStatePath) || !existsSync(cookiesPath)) {
          return { success: false, error: 'Chrome data paths not found.' };
      }

      // Decrypt DPAPI AES key via PowerShell
      const { execSync } = await import('child_process');
      const psCommand = `
          $ProgressPreference = 'SilentlyContinue';
          $localState = Get-Content -Raw "${localStatePath}" | ConvertFrom-Json;
          $encryptedKey = [Convert]::FromBase64String($localState.os_crypt.encrypted_key);
          $encryptedKey = $encryptedKey[5..($encryptedKey.Length-1)];
          Add-Type -AssemblyName System.Security;
          $key = [Security.Cryptography.ProtectedData]::Unprotect($encryptedKey, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser);
          [Convert]::ToBase64String($key)
      `;

      let b64Key;
      try {
          const encodedCommand = Buffer.from(psCommand, 'utf16le').toString('base64');
          const rawOutput = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedCommand}`).toString().trim();
          // PowerShell might output #< CLIXML or other artifacts. The key should be the last line.
          const lines = rawOutput.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
          b64Key = lines[lines.length - 1];
          if (!b64Key || b64Key.includes('<')) throw new Error("Invalid base64 key extracted");
      } catch (err) {
          console.error("DPAPI Extraction error:", err.message);
          return { success: false, error: 'Failed to decrypt Chrome AES key.' };
      }

      const aesKey = Buffer.from(b64Key, 'base64');
      const tempCookies = path.join(os.tmpdir(), 'casjoe_temp_cookies.sqlite');

      // Attempt to copy the SQLite DB, if locked by Chrome, force kill Chrome first.
      try {
          copyFileSync(cookiesPath, tempCookies);
      } catch (e) {
          if (e.code === 'EBUSY') {
              console.log("Chrome is locking cookies file, closing Chrome...");
              try { execSync('taskkill /F /IM chrome.exe'); } catch {}
              // wait a moment
              await new Promise(r => setTimeout(r, 1000));
              copyFileSync(cookiesPath, tempCookies);
          } else {
              throw e;
          }
      }

      const initSqlJs = (await import('sql.js')).default;
      const SQL = await initSqlJs();
      const db = new SQL.Database(readFileSync(tempCookies));
      
      const res = db.exec("SELECT host_key, name, path, encrypted_value, is_secure, is_httponly, expires_utc FROM cookies");
      if (!res || res.length === 0) {
          return { success: false, error: 'No cookies found in Chrome DB.' };
      }

      const crypto = await import('crypto');
      const parsedCookies = [];
      for (const row of res[0].values) {
          const [host_key, name, cookiePath, encrypted_value, is_secure, is_httponly, expires_utc] = row;
          let decrypted = '';
          if (encrypted_value) {
              const buf = Buffer.from(encrypted_value);
              if (buf.toString('ascii', 0, 3) === 'v10' || buf.toString('ascii', 0, 3) === 'v11') {
                  const iv = buf.slice(3, 15);
                  const cipherText = buf.slice(15, buf.length - 16);
                  const authTag = buf.slice(buf.length - 16);
                  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
                  decipher.setAuthTag(authTag);
                  decrypted = decipher.update(cipherText, null, 'utf8') + decipher.final('utf8');
              }
          }
          
          if (decrypted) {
              parsedCookies.push({
                  url: (is_secure ? 'https://' : 'http://') + host_key.replace(/^\./, ''),
                  name: name,
                  value: decrypted,
                  domain: host_key,
                  path: cookiePath || '/',
                  secure: Boolean(is_secure),
                  httpOnly: Boolean(is_httponly),
                  expirationDate: Math.floor(expires_utc / 1000000) - 11644473600 // Chrome webkit epoch to unix
              });
          }
      }
      
      db.close();
      try { unlinkSync(tempCookies); } catch {}

      // Now inject them into Casjoe Session
      const { session } = await import('electron');
      const targetSessions = [
        mainWindow.webContents.session,
        session.fromPartition('persist:casjoe_agent_browser'),
        session.defaultSession
      ];

      let successCount = 0;
      for (const cookie of parsedCookies) {
        let setInAny = false;
        const cleanDomain = cookie.domain.replace(/^\./, '');
        const targetUrls = new Set([
          cookie.url,
          `https://${cleanDomain}`,
          `http://${cleanDomain}`,
          `https://www.${cleanDomain}`,
          `https://m.${cleanDomain}`,
          `https://web.${cleanDomain}`
        ]);

        for (const targetSession of targetSessions) {
          if (!targetSession || !targetSession.cookies) continue;
          for (const url of targetUrls) {
            try {
              await targetSession.cookies.set({
                url, name: cookie.name, value: cookie.value,
                domain: cookie.domain, path: cookie.path,
                secure: cookie.secure, httpOnly: cookie.httpOnly,
                expirationDate: cookie.expirationDate > 0 ? cookie.expirationDate : (Math.floor(Date.now() / 1000) + 31536000)
              });
              setInAny = true;
            } catch {}
          }
        }
        if (setInAny) successCount++;
      }

      return { success: true, count: successCount, total: parsedCookies.length };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  });

  // 8. Open File in System Notepad / Default Editor
  ipcMain.handle('agent:open-file', async (event, { filePath }) => {
    try {
      const { shell } = await import('electron');
      const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
      await shell.openPath(resolved);
      return { success: true, filePath: resolved };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}
