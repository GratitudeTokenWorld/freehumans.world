// Shamir's threshold secret sharing scheme 
import { split } from 'shamir-secret-sharing';
import { sendShares } from '../controllers/emailController';

const toUint8Array = (data: string) => new TextEncoder().encode(data);
const fromUint8ArrayToBase64 = (data: Uint8Array) => btoa(String.fromCharCode(...data));

export const shamir = async (email: string, user: string, secretString: string) => {
    // this is the private key that starts with PVT_ and it comes from generating it with @proton/mnemonic npm package.
    // secretString - on it, we apply Shamir's encryption on this parsed key, we split the encryption result into 3 shares which are then distributed to 3 different custodies, the original key will not exist anywhere ever again in the original format obtained, it will be deleted from RAM and can be reconstructed from 2/3 shares.

    const secret = toUint8Array(secretString);

    const threeShares = await split(secret, 3, 2);

    const [share1, share2, share3] = threeShares; // these are in Uint8Array format
    const s1 = fromUint8ArrayToBase64(share1);
    const s2 = fromUint8ArrayToBase64(share2);
    const s3 = fromUint8ArrayToBase64(share3);

    sendShares(email, user, s1, s2, s3)
    // Dissimination: 1 share save like this in MYSQL, 1 share in the other server with faceID, 1 share email to the user.

    // use deshamir.ts to reconstruct the private key using 2 or all 3 secret shares

}