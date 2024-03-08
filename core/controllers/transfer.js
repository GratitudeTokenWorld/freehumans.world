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
exports.transfer = void 0;
const js_1 = require("@proton/js");
const defaultPrivateKey = "PVT_K1_2FA8Af2BzBXVq2wVzgKZRrRDywzEW2ZKk9t7TDdyyqSLidgkTQ"; // user test1515 on testnet
const signatureProvider = new js_1.JsSignatureProvider([defaultPrivateKey]);
const rpc = new js_1.JsonRpc('https://testnet.brotonbp.com');
const api = new js_1.Api({ rpc, signatureProvider });
// TRANSFER TOKENS FUNCTION - here you might go into the b
const transfer = (app) => {
    // BATCH actions structure
    // actions = [
    //   generateNewAction(account, name, ...),
    //   generateBuyRamBytesActio(...),
    //   generateAccountResource(...)
    // ]
    // api.transact({ actions,{ ...}})
    app.get('/transfer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const result = yield api.transact({
                    actions: [{
                            account: "eosio.token",
                            name: "transfer",
                            authorization: [{
                                    actor: "test1515",
                                    permission: "active",
                                }],
                            data: {
                                from: "test1515",
                                to: "grat",
                                quantity: "0.0100 XPR",
                                memo: "gigi",
                            },
                        }],
                }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                });
                res.send(result);
            }
            catch (e) {
                console.log('\nCaught exception: ' + e);
                if (e instanceof js_1.RpcError)
                    console.log(JSON.stringify(e.json, null, 2));
            }
        }))();
    }));
};
exports.transfer = transfer;
