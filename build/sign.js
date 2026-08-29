// build/sign.js
// Custom signing hook for electron-builder.
// Uses Windows signtool.exe with the self-signed PFX in build/codesign.pfx.
// To use a real commercial certificate, replace codesign.pfx with your issued .pfx
// and update the password below (or read from an env var for security).

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.default = async function sign(config) {
  const filePath = config.path;
  if (!filePath) return;

  const pfxPath = path.join(process.cwd(), 'build', 'codesign.pfx');
  const password = process.env.WIN_CSC_KEY_PASSWORD || 'CasjoeSign2026!';
  const timestamp = 'http://timestamp.digicert.com';

  // Locate signtool.exe (Windows SDK)
  const candidates = [
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.22621.0\\x64\\signtool.exe',
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041.0\\x64\\signtool.exe',
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.18362.0\\x64\\signtool.exe',
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64\\signtool.exe',
    'C:\\Program Files\\Microsoft SDKs\\Windows\\v10.0A\\bin\\NETFX 4.8 Tools\\x64\\signtool.exe',
  ];

  let signtool = null;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      signtool = p;
      break;
    }
  }

  if (!signtool) {
    // Try PATH
    try {
      execSync('signtool.exe /?', { stdio: 'ignore' });
      signtool = 'signtool.exe';
    } catch {}
  }

  if (!signtool) {
    console.warn('[sign.js] signtool.exe not found – installer will be unsigned.');
    return;
  }

  const cmd = [
    `"${signtool}" sign`,
    `/fd SHA256`,
    `/f "${pfxPath}"`,
    `/p "${password}"`,
    `/t "${timestamp}"`,
    `/v`,
    `"${filePath}"`,
  ].join(' ');

  console.log('[sign.js] Signing:', filePath);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('[sign.js] Signed successfully.');
  } catch (err) {
    // Signing failures are non-fatal for self-signed certs
    console.warn('[sign.js] Signing warning (may be non-fatal for self-signed certs):', err.message);
  }
};
