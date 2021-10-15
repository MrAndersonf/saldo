const jsf = require('jsonfile')
const fs = require('fs')
const path = require('path')

module.exports = {
  createUser(file, data) {
    let filepath = path.resolve(`./source/database/users/${file}.json`)
    let destiny = path.resolve(`./source/assets/users/${file}.${data.image.substring(data.image.lastIndexOf('.') + 1, data.image.length)}`)
    fs.copyFile(data.image, destiny, (err) => {
      if (err) throw err;
    });
    data.image = destiny
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

  deleteAccount(number) {
    try {
      let accounts =  this.accounts();
      let account = ""
      accounts.forEach(e => {
        if(e.number == number){
          account = e
        }
      })
      console.log(account)
      let userlist = this.users()
      let user = ""
      userlist.forEach(el => {
        if (el.name == account.owner) {
          user = el
        }
      })
      console.log(user)
   
   
      fs.unlink(user.image, (err => {
        if (err) console.log(err)
      }))
      fs.unlink(path.resolve(`./source/database/users/${user.id}.json`), (err => {
        if (err) console.log(err)
      }))
      fs.unlink(path.resolve(`./source/database/accounts/${account.id}.json`), (err => {
        if (err) console.log(err)
      }))
      return true
    } catch (error) {
      console.log(error)
    }
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

  find_account_number(number) {
    let directory = this.accounts();
    let found;
    directory.forEach(account => {
      if (account.number == number) {
        found = account;
      }
    })
    return found
  },

  account_status_active() {
    let directory = this.accounts();
    let actives = []
    let users = this.users()
    directory.forEach(account => {
      if (account.status == 'active') {
        users.forEach(user => {
          if (user.name == account.owner) {
            account.owner = user
            actives.push(account);
          }
        })

      }
    })
    return actives
  },

  account_status_inactive() {
    let directory = this.accounts();
    let inactives = []
    directory.forEach(account => {
      if (account.status == 'inactive') {
        inactives.push(account);
      }
    })
    return inactives
  },

  account_status(number) {
    let account = this.find_account_number(number)
    console.log(account)
    if (account.status == 'active') {
      account.status = 'inactive'
    } else {
      account.status = 'active'
    }
    this.createAccount(account.id, account)
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
    if (orderedIds.length == 0) return 1
    let number = 0
    let aux = 0
    orderedIds.forEach(el => {
      aux = Number(el)
      if (aux > number) number = aux
    });
    return number + 1
  },
  setThisYear(passedYear) {
    let year = passedYear
    let directory = fs.readdirSync(path.resolve(`./source/database/statements`))
    if (!directory.includes(year)) {
      fs.mkdirSync(path.resolve(`./source/database/statements/${year}`))
    }
  },
  setThisMonth(passedMonth, passedYear) {
    let month = passedMonth
    let year = passedYear
    let directory = fs.readdirSync(path.resolve(`./source/database/statements/${year}`))
    if (!directory.includes(month)) {
      fs.mkdirSync(path.resolve(`./source/database/statements/${year}/${month}`))
    }
  },
  setSelectedAccount(current) {
    let accounts = this.accounts()
    let selected = ""
    accounts.forEach(account => {
      if (current.includes(account.number)) {
        selected = account;
      }
    })
    let banks = this.banks()
    banks.forEach(bank => {
      if (selected.bank == bank.name) {
        selected.bank = bank;
      }
    })
    console.log(selected)
    return selected
  },
  createStatement(data) {
    console.log(data)
    let files = jsf.readFileSync(path.resolve(`./source/database/statements/data.json`))
    let filepath = path.resolve(`./source/database/statements/data.json`)
    jsf.writeFileSync(filepath, [...files, ...data.ops])
    let conta = this.find_account(data.ops[0].account.id)
    conta.balance.then = data.balance.then
    conta.balance.now = data.balance.now

    jsf.writeFileSync(path.resolve(`./source/database/accounts/${data.ops[0].account.id}.json`), conta)
  },

  moviments() {
    let moviments = jsf.readFileSync(path.resolve(`./source/database/statements/data.json`))
    let accounts = this.accounts()
    let users = this.users()
    return { moviments, accounts, users }
  },
  insertOperation(data) {
    console.log(data)

    let account = this.find_account_number(data.account.number)
    let now = data.type === "CREDIT" ? Number(parseFloat(account.balance.now) + parseFloat(data.amount)) : Number(parseFloat(account.balance.now) - parseFloat(data.amount))

    console.log(account)
    account.balance.then = account.balance.now
    account.balance.now = now.toString()
    account.balance.date = data.date
    let files = jsf.readFileSync(path.resolve(`./source/database/statements/data.json`))
    let filepath = path.resolve(`./source/database/statements/data.json`)
    jsf.writeFileSync(filepath, [...files, data])
    this.createAccount(data.account.id, account)

  }






}