const userHandle = require('../database/index')

class Bank {
    static async create(data) {
        try {
            let nextId = userHandle.next('banks')
            userHandle.createBank(nextId, { id: nextId, ...data })
        } catch (error) {
            console.log(error)
        }
    }

    static async list() {
        try {
            return userHandle.banks()
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = Bank