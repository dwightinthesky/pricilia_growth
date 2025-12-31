import { CompactEncrypt, compactDecrypt } from "jose";

export async function encrypt(secret, text) {
    // Pad/truncate secret to 32 bytes for A256GCM if needed, or use prompt to ensure user provides 32 char secret.
    // ideally secret is high entropy. For JWE A256GCM direct, key must be 32 bytes (256 bits).
    // We'll trust the user provided a good secret or just pad/slice it. 
    // Better: use PBKDF2 to derive a key from the text secret.
    // But for speed and existing flow, let's assume secret is sufficient or handle it.

    // Simple approach: derive key using Web Crypto (PBKDF2) to be safe regardless of input length.
    const key = await deriveKey(secret);

    const encoder = new TextEncoder();
    const jwe = await new CompactEncrypt(encoder.encode(text))
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .encrypt(key);

    return jwe;
}

export async function decrypt(secret, jwe) {
    try {
        const key = await deriveKey(secret);
        const { plaintext } = await compactDecrypt(jwe, key);
        return new TextDecoder().decode(plaintext);
    } catch (e) {
        return null;
    }
}

// Helper to get a proper 32-byte key from any string string
async function deriveKey(secret) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    // Use a fixed salt for determinism across function invocations (since we don't store salt separately here).
    // In production, better to random salt and store with data.
    // But user schema: `refresh_token` string. 
    // We will risk fixed salt for this "personal dashboard" scope or append salt.
    // Let's use a "system salt" hardcoded for now to keep it simple as requested.
    const salt = enc.encode("pricilia-growth-dashboard-salt");

    return await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}
