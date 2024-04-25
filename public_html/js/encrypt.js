function hexToUint8Array(hexString) {
    if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hexString");
    }
    var arrayBuffer = new Uint8Array(hexString.length / 2);
    for (let i = 0, j = 0; i < hexString.length; i += 2, j++) {
        arrayBuffer[j] = parseInt(hexString.substring(i, i + 2), 16);
    }
    return arrayBuffer;
}

export async function encryptString(share, hexKey) {

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(share);

    // Convert hex key to Uint8Array
    const keyBuffer = hexToUint8Array(hexKey);
    if (keyBuffer.byteLength !== 32) {
        throw new Error('Key length must be 256 bits / 32 bytes for AES-256.');
    }

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "AES-CBC", length: 256 }, // Specify AES-256
        false,
        ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(16)); // IV must be 16 bytes for AES

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        dataBuffer
    );

    const encryptedData = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedData.length);
    combined.set(iv);
    combined.set(encryptedData, iv.length);

    return window.btoa(String.fromCharCode(...combined));
}
