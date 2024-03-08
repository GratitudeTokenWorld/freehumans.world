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
exports.shamir = void 0;
// Shamir's threshold secret sharing scheme 
const shamir_secret_sharing_1 = require("shamir-secret-sharing");
const emailController_1 = require("../controllers/emailController");
const toUint8Array = (data) => new TextEncoder().encode(data);
const fromUint8ArrayToBase64 = (data) => btoa(String.fromCharCode(...data));
const shamir = (email, user, secretString) => __awaiter(void 0, void 0, void 0, function* () {
    // this is the private key that starts with PVT_ and it comes from generating it with @proton/mnemonic npm package.
    // secretString - on it, we apply Shamir's encryption on this parsed key, we split the encryption result into 3 shares which are then distributed to 3 different custodies, the original key will not exist anywhere ever again in the original format obtained, it will be deleted from RAM and can be reconstructed from 2/3 shares.
    const secret = toUint8Array(secretString);
    const threeShares = yield (0, shamir_secret_sharing_1.split)(secret, 3, 2);
    const [share1, share2, share3] = threeShares; // these are in Uint8Array format
    const s1 = fromUint8ArrayToBase64(share1);
    const s2 = fromUint8ArrayToBase64(share2);
    const s3 = fromUint8ArrayToBase64(share3);
    (0, emailController_1.sendShares)(email, user, s1, s2, s3);
    // Dissimination: 1 share save like this in MYSQL, 1 share in the other server with faceID, 1 share email to the user.
    // use deshamir.ts to reconstruct the private key using 2 or all 3 secret shares
});
exports.shamir = shamir;
