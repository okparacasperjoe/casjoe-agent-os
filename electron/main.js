import { app, BrowserWindow, shell, session, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupAgentBridge } from './agentBridge.js';
import { autoUpdater } from 'electron-updater';
import { dialog } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    autoHideMenuBar: true,
    show: false, // Show when ready to prevent flickering
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true, // Enables embedded Casjoe Biz app.casjoe.com view
      webSecurity: false // Necessary for local file loading via file://
    }
  });

  // Setup Casjoe Agent OS Native Desktop Bridge
  setupAgentBridge(mainWindow);

  // Inject Chrome Desktop User-Agent for WhatsApp Web & Social Platforms
  const CHROME_DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  const browserSession = session.fromPartition('persist:casjoe_agent_browser');

  // Disable Windows Hello / Passkey popups on both default and browser partition
  if (browserSession.setWebAuthnHandler) {
    browserSession.setWebAuthnHandler(() => ({ action: 'cancel' }));
  }
  if (session.defaultSession.setWebAuthnHandler) {
    session.defaultSession.setWebAuthnHandler(() => ({ action: 'cancel' }));
  }

  [session.defaultSession, browserSession].forEach((sess) => {
    sess.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = CHROME_DESKTOP_UA;
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    sess.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders };
      delete responseHeaders['x-frame-options'];
      delete responseHeaders['X-Frame-Options'];
      delete responseHeaders['content-security-policy'];
      delete responseHeaders['Content-Security-Policy'];
      callback({ cancel: false, responseHeaders });
    });
  });

  // Handle external link clicks by opening in user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      return { action: 'allow' };
    }
    return { action: 'allow' };
  });

  if (isDev) {
    // Load Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    // Load compiled React app
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  // Initialize auto-updater
  const initAutoUpdater = () => {
    autoUpdater.logger = require('electron-log');
    autoUpdater.logger.transports.file.level = 'info';

    const notify = (channel, data) => {
      BrowserWindow.getAllWindows().forEach(w => w.webContents.send(channel, data));
    };

    autoUpdater.on('checking-for-update', () => notify('updater:status', { status: 'checking' }));
    autoUpdater.on('update-available', info => notify('updater:status', { status: 'available', version: info.version }));
    autoUpdater.on('update-not-available', () => notify('updater:status', { status: 'up-to-date' }));
    autoUpdater.on('download-progress', info => notify('updater:status', { status: 'downloading', percent: Math.round(info.percent) }));
    autoUpdater.on('error', err => notify('updater:status', { status: 'error', message: err.message }));

    autoUpdater.on('update-downloaded', info => {
      notify('updater:status', { status: 'downloaded', version: info.version });
      const response = dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['Restart & Install', 'Later'],
        defaultId: 0,
        title: 'Update Ready – Casjoe Agent OS',
        message: `Version ${info.version} has been downloaded.\nRestart now to install the update?`
      });
      if (response === 0) autoUpdater.quitAndInstall();
    });

    // IPC: renderer calls 'check-for-updates' to trigger a manual check
    ipcMain.handle('check-for-updates', async () => {
      try {
        await autoUpdater.checkForUpdates();
      } catch (e) {
        notify('updater:status', { status: 'error', message: e.message });
      }
    });
  };
  initAutoUpdater();
  // Auto-check on launch (only in production)
  if (!isDev) autoUpdater.checkForUpdatesAndNotify();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
