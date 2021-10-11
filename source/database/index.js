const jsf = require('jsonfile')
const fs = require('fs')
const path = require('path')

module.exports = {


    createUser(file, data) {
        let filepath = path.resolve(`./source/database/users/${file}.json`)
        jsf.writeFileSync(filepath, data)
    },

    find_user(user) {
        let filepath = path.resolve(`./source/database/users/${user}.json`)
        let result = jsf.readFileSync(filepath)
        return result
    },

    users() {
        let directory = fs.readdirSync(path.resolve(`./source/database/users`))
        let ids = directory.map(file => Number(file.substr(0, file.lastIndexOf('.'))))
        let result = ids.map(id => this.find_user(id))
        return result
    },

    createBank(file, data) {
        let filepath = path.resolve(`./source/database/banks/${file}.json`)
        jsf.writeFileSync(filepath, data)
    },

    banks() {
        let directory = fs.readdirSync(path.resolve(`./source/database/banks`))
        let ids = directory.map(file => Number(file.substr(0, file.lastIndexOf('.'))))
        let result = ids.map(id => this.find_bank(id))
        return result
    },

    find_bank(bank) {
        let filepath = path.resolve(`./source/database/banks/${bank}.json`)
        let result = jsf.readFileSync(filepath)
        return result
    },

    createAccount(file, data) {
        let filepath = path.resolve(`./source/database/accounts/${file}.json`)
        jsf.writeFileSync(filepath, data)
    },

    accounts() {
        let directory = fs.readdirSync(path.resolve(`./source/database/accounts`))
        let ids = directory.map(file => Number(file.substr(0, file.lastIndexOf('.'))))
        let result = ids.map(id => this.find_account(id))
        return result
    },

    find_account(account) {
        let filepath = path.resolve(`./source/database/accounts/${account}.json`)
        let result = jsf.readFileSync(filepath)
        return result
    },

    

    get_files(pathfile) {
        return fs.readdirSync(path.resolve(`./source/database/${pathfile}`))
    },
    get_ids(files) {
        let ids = files.map(arg => {
            return Number(arg.substr(0, arg.lastIndexOf('.')));
        })
        return
    },

    register_ids_of() {
        return this.get_ids(this.get_files('expense')).reverse()
    },
    next_id(ids) {
        if (ids.length == 0) return 1
        let number = 0
        let aux = 0
        ids.forEach(el => {
            aux = Number(el)
            if (aux > number) number = aux
        });
        return number + 1
    },
    next(file) {
        let directory = fs.readdirSync(path.resolve(`./source/database/${file}`))
        let ids = directory.map(file => Number(file.substr(0, file.lastIndexOf('.'))));
        let orderedIds = ids.sort(function (a, b) { return a - b })
        console.log(orderedIds)
        if (orderedIds.length == 0) return 1
        let number = 0
        let aux = 0
        orderedIds.forEach(el => {
            aux = Number(el)
            if (aux > number) number = aux
        });
        return number + 1
    },

   


}