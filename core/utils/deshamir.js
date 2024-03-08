"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deshamir = void 0;
// reconstruct the private key
const shamir_secret_sharing_1 = require("shamir-secret-sharing");
const fromUint8ArrayToString = (data) => new TextDecoder().decode(data);
const fromBase64ToUint8Array = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};
const deshamir = (share1, share2) => __awaiter(void 0, void 0, void 0, function* () {
    const s1 = fromBase64ToUint8Array(share1);
    const s2 = fromBase64ToUint8Array(share2);
    const reconstructed = yield (0, shamir_secret_sharing_1.combine)([s1, s2]); // step 1
    const reconstructedString = fromUint8ArrayToString(reconstructed); // step 2
    console.log('Reconstructed: ' + reconstructedString); // use it for signing like this
    return reconstructedString;
});
exports.deshamir = deshamir;
