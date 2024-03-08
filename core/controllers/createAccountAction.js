"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountAction = void 0;
const createAccountAction = (newAccount, creator) => {
    return {
        "account": "eosio",
        "name": newAccount,
        "authorization": [{
                "actor": creator,
                "permission": "active"
            }],
    };
};
exports.createAccountAction = createAccountAction;
