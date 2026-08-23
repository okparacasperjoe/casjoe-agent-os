import { exec, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ipcMain, desktopCapturer } from 'electron';

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
    return {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      totalMem: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      freeMem: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
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
