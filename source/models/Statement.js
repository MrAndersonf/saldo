const userHandle = require('../database/index')

class Statement {
    static async create(data) {
        try {
            userHandle.createStatement(data)
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

    static async lastweek() {
        try {
            return userHandle.banks()
        } catch (error) {
            console.log(error)
        }
    }

    static async insert(data) {
        try {
            return userHandle.insertOperation(data)
        } catch (error) {
            console.log(error)
        }
    }

    static async last() {
        try {
            return userHandle.moviments()
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = Statement