import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';
import initSqlJs from 'sql.js';

async function extractChromeCookies() {
    const localAppData = process.env.LOCALAPPDATA;
    const cookiesPath = path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'Network', 'Cookies');
    
    if (!fs.existsSync(cookiesPath)) {
        console.error("Chrome paths not found.");
        return;
    }

    let b64Key;
    try {
        b64Key = execSync(`powershell -ExecutionPolicy Bypass -File get_key.ps1`).toString().trim();
    } catch (err) {
        console.error("Failed to decrypt DPAPI key", err);
        return;
    }

    const aesKey = Buffer.from(b64Key, 'base64');

    const tempCookies = path.join(process.cwd(), 'temp_cookies.sqlite');
    fs.copyFileSync(cookiesPath, tempCookies);

    const SQL = await initSqlJs();
    const fileBuffer = fs.readFileSync(tempCookies);
    const db = new SQL.Database(fileBuffer);
    
    const res = db.exec("SELECT host_key, name, path, encrypted_value, is_secure, is_httponly, expires_utc FROM cookies LIMIT 10");
    if (!res || res.length === 0) {
        console.log("No cookies found");
        return;
    }

    const values = res[0].values;

    for (const row of values) {
        const host_key = row[0];
        const name = row[1];
        const encrypted_value = row[3];
        
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
        
        console.log(`Cookie: ${host_key} - ${name}`); // omit printing decrypted value for privacy
    }
    
    db.close();
    fs.unlinkSync(tempCookies);
    console.log("Success");
}

extractChromeCookies().catch(console.error);
