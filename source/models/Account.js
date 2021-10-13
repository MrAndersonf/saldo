const userHandle = require('../database/index')

class Account {
    static async create(data) {
        try {
            let nextId = userHandle.next('accounts');
            userHandle.createAccount(nextId, { id: nextId, ...data })
        } catch (error) {
            console.log(error)
        }
    }

    static async list() {
        try {
            return userHandle.accounts()
        } catch (error) {
            console.log(error)
        }
    }

    static async find(number) {
        try {
            return userHandle.find_account_number(number)
        } catch (error) {
            console.log(error)
        }
    }

    static async status(number) {
        try {
            return userHandle.account_status(number)
        } catch (error) {
            console.log(error)
        }
    }

    static async actives() {
        try {
            return userHandle.account_status_active()
        } catch (error) {
            console.log(error)
        }
    }

    static async inactives() {
        try {
            return userHandle.account_status_inactive()
        } catch (error) {
            console.log(error)
        }
    }

    static async setAccount(accountNumber) {
        try {
            return userHandle.setSelectedAccount(accountNumber)
        } catch (error) {
            console.log(error)
        }
    }


}

module.exports = Account