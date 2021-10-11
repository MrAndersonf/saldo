const userHandle = require('../database/index')

class User{
    static async create(data){
        try {          
            userHandle.createUser(userHandle.next('users'), data)
        } catch (error) {
            console.log(error)
        }        
    }

    static async list(){
        try {
            return userHandle.users()
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = User