const userHandle = require('../database/index')

class Bank{
    static async create(data){
        try {
            userHandle.createBank(userHandle.next('banks'), data)
        } catch (error) {
            console.log(error)
        }        
    }

    static async list(){
        try {
            return userHandle.banks()
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = Bank