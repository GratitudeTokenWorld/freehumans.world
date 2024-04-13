// reconstruct the private key
import { combine } from 'shamir-secret-sharing';


const fromUint8ArrayToString = (data: Uint8Array) => new TextDecoder().decode(data);

const fromBase64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

export const deshamir = async (share1: string, share2: string) => {

    const s1 = fromBase64ToUint8Array(share1);
    const s2 = fromBase64ToUint8Array(share2);



    try {
        const reconstructed = await combine([s1, s2]); // step 1
        const reconstructedString = fromUint8ArrayToString(reconstructed); // step 2

        //console.log('Reconstructed: ' + reconstructedString); // use it for signing like this

        return reconstructedString;
    } catch (error) {
        console.error('Error converting reconstructed data:', error);
        return null;
    }
}