import { app, BrowserWindow, shell, session } from 'electron';
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

    autoUpdater.on('update-available', () => console.log('Update available'));
    autoUpdater.on('update-not-available', () => console.log('No update'));
    autoUpdater.on('download-progress', info => console.log(`Downloading ${Math.round(info.percent)}%`));
    autoUpdater.on('update-downloaded', info => {
      const response = dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['Restart now', 'Later'],
        defaultId: 0,
        title: 'Update Ready',
        message: `Version ${info.version} downloaded. Restart now?`
      });
      if (response === 0) autoUpdater.quitAndInstall();
    });
    autoUpdater.on('error', err => console.error('Auto-update error:', err));
  };
  initAutoUpdater();
  autoUpdater.checkForUpdatesAndNotify();
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
