export const createAccountAction = (newAccount: string, creator: string) => {
    return {
        "account": "eosio",
        "name": newAccount,
        "authorization": [{
            "actor": creator,
            "permission": "active"
        }],
    }
}