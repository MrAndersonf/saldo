const userHandle = require('../database/index')

class User {
    static async create(data) {
        try {
            let nextId = userHandle.next('users')
            userHandle.createUser(nextId, { id: nextId, ...data })
        } catch (error) {
            console.log(error)
        }
    }

    static async list() {
        try {
            return userHandle.users()
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = User