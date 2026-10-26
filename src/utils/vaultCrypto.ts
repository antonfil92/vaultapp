import { EncryptedVaultData, VaultItem } from '../types';

const VAULT_STORAGE_KEY = 'vaultkey_encrypted_data_v1';
const PBKDF2_ITERATIONS = 100000;

// Convert Uint8Array to Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive an AES-GCM-256 key from master password and salt using PBKDF2
 */
async function deriveEncryptionKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt vault items with Master Password using AES-GCM
 */
export async function encryptVault(items: VaultItem[], masterPassword: string): Promise<EncryptedVaultData> {
  const enc = new TextEncoder();
  const rawData = enc.encode(JSON.stringify(items));

  // 16-byte random salt
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  // 12-byte random IV for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveEncryptionKey(masterPassword, salt);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as ArrayBuffer,
    },
    key,
    rawData
  );

  return {
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBuffer),
    version: 1,
    updatedAt: Date.now(),
  };
}

/**
 * Decrypt vault items with Master Password
 * Throws error if password is incorrect or data corrupted
 */
export async function decryptVault(
  encryptedData: EncryptedVaultData,
  masterPassword: string
): Promise<VaultItem[]> {
  const salt = base64ToBuffer(encryptedData.salt);
  const iv = base64ToBuffer(encryptedData.iv);
  const ciphertext = base64ToBuffer(encryptedData.ciphertext);

  const key = await deriveEncryptionKey(masterPassword, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as ArrayBuffer,
      },
      key,
      ciphertext as unknown as ArrayBuffer
    );

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuffer);
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('Decrypted vault format invalid');
    }
    return parsed as VaultItem[];
  } catch (err) {
    throw new Error('Incorrect Master Password or corrupted vault data.');
  }
}

/**
 * Local storage persistence helpers
 */
export function getStoredEncryptedVault(): EncryptedVaultData | null {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EncryptedVaultData;
  } catch {
    return null;
  }
}

export function saveStoredEncryptedVault(data: EncryptedVaultData): void {
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(data));
}

export function removeStoredEncryptedVault(): void {
  localStorage.removeItem(VAULT_STORAGE_KEY);
}

/**
 * Export unencrypted CSV for standard password managers (Bitwarden, 1Password)
 */
export function exportVaultToCsv(items: VaultItem[]): string {
  const headers = ['title', 'username', 'password', 'url', 'category', 'notes', 'platform'];
  const rows = items.map((item) => {
    return [
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${(item.username || '').replace(/"/g, '""')}"`,
      `"${(item.password || '').replace(/"/g, '""')}"`,
      `"${(item.url || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      `"${(item.platform || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse imported CSV or JSON into VaultItems
 */
export function parseImportedVault(rawContent: string): Partial<VaultItem>[] {
  const trimmed = rawContent.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    // Attempt JSON parse
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed.items && Array.isArray(parsed.items)) {
      return parsed.items;
    }
  }

  // Parse CSV
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let insideQuotes = false;
    let current = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headerLine = lines[0].toLowerCase();
  const headers = parseCsvLine(headerLine);

  const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('name'));
  const userIdx = headers.findIndex((h) => h.includes('user') || h.includes('login') || h.includes('email'));
  const passIdx = headers.findIndex((h) => h.includes('pass') || h.includes('secret'));
  const urlIdx = headers.findIndex((h) => h.includes('url') || h.includes('website') || h.includes('link'));
  const noteIdx = headers.findIndex((h) => h.includes('note') || h.includes('comment'));
  const catIdx = headers.findIndex((h) => h.includes('folder') || h.includes('category') || h.includes('tag'));

  const items: Partial<VaultItem>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length === 0) continue;

    const password = passIdx !== -1 ? cols[passIdx] : '';
    if (!password) continue;

    const title = titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx] : 'Imported Item';
    const username = userIdx !== -1 && cols[userIdx] ? cols[userIdx] : '';
    const url = urlIdx !== -1 && cols[urlIdx] ? cols[urlIdx] : '';
    const notes = noteIdx !== -1 && cols[noteIdx] ? cols[noteIdx] : '';
    const category = (catIdx !== -1 && cols[catIdx] ? cols[catIdx] : 'Personal') as VaultItem['category'];

    items.push({
      title,
      username,
      password,
      url,
      notes,
      category: ['Social', 'Work', 'Finance', 'Personal', 'Other'].includes(category) ? category : 'Personal',
    });
  }

  return items;
}
