import { Express } from 'express';
import { Api, JsonRpc, RpcError, JsSignatureProvider } from '@proton/js';
const defaultPrivateKey: string = "PVT_K1_2FA8Af2BzBXVq2wVzgKZRrRDywzEW2ZKk9t7TDdyyqSLidgkTQ"; // user test1515 on testnet
const signatureProvider: JsSignatureProvider = new JsSignatureProvider([defaultPrivateKey]);

const rpc = new JsonRpc('https://testnet.brotonbp.com');
const api = new Api({ rpc, signatureProvider });

// TRANSFER TOKENS FUNCTION - here you might go into the b
export const transfer = (app: Express) => {
    // BATCH actions structure
    // actions = [
    //   generateNewAction(account, name, ...),
    //   generateBuyRamBytesActio(...),
    //   generateAccountResource(...)
    // ]
    // api.transact({ actions,{ ...}})

    app.get('/transfer', async (req, res) => {
        (async () => {
            try {
                const result = await api.transact({
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

            } catch (e) {
                console.log('\nCaught exception: ' + e);
                if (e instanceof RpcError)
                    console.log(JSON.stringify(e.json, null, 2));
            }
        })();
    });
};