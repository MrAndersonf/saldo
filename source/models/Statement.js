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

}

module.exports = Statement