// Funzione per derivare una chiave crittografica da una password
async function derivaChiave(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );
    
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Funzione per criptare i dati
async function criptaDati(dati, password) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await derivaChiave(password, salt);
    
    const encoder = new TextEncoder();
    const datiString = JSON.stringify(dati);
    const datiBuffer = encoder.encode(datiString);
    
    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        datiBuffer
    );
    
    // Combina salt + iv + dati criptati
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    return arrayBufferToBase64(result);
}

// Funzione per decriptare i dati
async function decriptaDati(datiCriptati, password) {
    try {
        const data = base64ToArrayBuffer(datiCriptati);
        const salt = data.slice(0, 16);
        const iv = data.slice(16, 28);
        const encrypted = data.slice(28);
        
        const key = await derivaChiave(password, salt);
        
        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encrypted
        );
        
        const decoder = new TextDecoder();
        const datiString = decoder.decode(decrypted);
        return JSON.parse(datiString);
    } catch (error) {
        throw new Error('Errore nella decrittazione: password errata o file corrotto');
    }
}

// Conversione da ArrayBuffer a Base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Conversione da Base64 a ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Validazione struttura JSON
function validaStrutturaJSON(dati) {
    return dati &&
           Array.isArray(dati.passwords) &&
           Array.isArray(dati.wallets) &&
           (!dati.cards || Array.isArray(dati.cards)) &&
           dati.passwords.every(p => p.piattaforma && p.username && p.password) &&
           dati.wallets.every(w => w.wallet && w.password) &&
           (!dati.cards || dati.cards.every(c => c.ente && c.pan && c.dataScadenza && c.cvv && c.pin));
}