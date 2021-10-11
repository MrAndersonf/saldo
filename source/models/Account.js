const userHandle = require('../database/index')

class Account{
    static async create(data){
        try {          
            userHandle.createAccount(userHandle.next('accounts'), data)
        } catch (error) {
            console.log(error)
        }        
    }

    static async list(){
        try {
            return userHandle.accounts()
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = Account