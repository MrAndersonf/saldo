const userHandle = require('../database/index')

class Account{
    static async create(data){
        try {          
            userHandle.createAccount(userHandle.next('accounts'),{id:userHandle.next('accounts'), ...data})
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

    static async find(number){
        try {
            return userHandle.find_account_number(number)
        } catch (error) {
            console.log(error)
        }
    }

    static async status(number){
        try {
            return userHandle.account_status(number)
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = Account