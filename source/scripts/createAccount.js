

const User = require(path.resolve(__dirname, '../models/User.js'))
const Bank = require(path.resolve(__dirname, '../models/Bank.js'))
const Account = require(path.resolve(__dirname, '../models/Account.js'))
const Currency = require(path.resolve(__dirname, '../util/Currency.js'))


window.addEventListener('load', function () {
  loadUsers()
  loadBanks()
})

async function insertUser() {
  let userName = document.getElementById('userName')
  if (userName.value.length > 2) {
    userName.classList.remove('is-invalid');
    await User.create({ name: userName.value })
    ipcRenderer.send('new-user-created', { title: "Sucesso", body: "Banco criado com sucesso" })
    modalCreateUserHide()
  } else {
    userName.classList.add('is-invalid');
    document.getElementById('error-message').innerText = "O nome deve conter no mínimo 3 caracteres."
  }
}

async function insertAccount(e) {
  e.preventDefault()
  let owner = document.getElementById('accountOwner')
  let bank = document.getElementById('accountBank')
  let agency = document.getElementById('accountAgency')
  let number = document.getElementById('accountNumber')
  let digit = document.getElementById('accountDigit')
  let balance = document.getElementById('accountBalance')
  let date = document.getElementById('balanceDate')
  let fields = [
    {
      input: owner,
      error: 'error-message-owner',
    },
    {
      input: bank,
      error: 'error-message-bank'
    },
    {
      input: agency,
      error: 'error-message-agency'
    },
    {
      input: number,
      error: 'error-message-account'
    },
    {
      input: digit,
      error: 'error-message-digit'
    },
    {
      input: balance,
      error: 'error-message-balance'
    }
    ,
    {
      input: date,
      error: 'error-message-date'
    }
  ]
  let result = validate(fields)
  if (!result) {
    ipcRenderer.send('new-user-created', { title: "Aviso", body: "Preencha todos os campos." })
    return
  } else {
    await Account.create({
      owner: owner.value,
      bank: bank.value,
      agency: agency.value,
      number: number.value,
      digit: digit.value,
      balance: {
        date: new Date(date.value),
        amount: balance.value,
      },
      status: "active"
    })
    notify("Conta Criada com Sucesso")
  }



}


function handleBack(event){
  event.preventDefault()
  ipcRenderer.send("main-screen")
}

function handleBalance(e, amount) {
  e.preventDefault()
  let input = document.getElementById('accountBalance')
  if (e.keyCode >= 96 && e.keyCode <= 105 || e.keyCode >= 48 && e.keyCode <= 57) {
    let sanitized = Currency.sanitizeCurrency(amount)
    let parsetToNum = sanitized + e.key
    let readyNumber = parsetToNum / 100
    input.value = ''
    input.value = Currency.formater(readyNumber)
  }
  if (e.keyCode == 8) {
    let sanitized = Currency.sanitizeCurrency(amount)
    let removedIndex = sanitized.slice(0, -1)
    let readyNumber = removedIndex / 100
    input.value = ''
    input.value = Currency.formater(readyNumber)

  }
  if (e.keyCode == 9) {
    document.getElementById('balanceDate').focus()
  }
}


async function insertBank() {
  let code = document.getElementById('bankCode')
  let name = document.getElementById('bankName')
  let fields = [
    {
      input: code,
      error: 'error-bank-code',
    },
    {
      input: name,
      error: 'error-bank-name'
    }
  ]
  let result = validate(fields)
  if (!result) {
    notify(`Revise o formulário.`)
  } else {
    await Bank.create({ code: code.value, name: name.value })
    ipcRenderer.send('new-user-created', { title: "Sucesso", body: "Banco criado com sucesso" })
    modalCreateBankHide()
  }
}



function validate(fields) {
  let invalids = 0
  fields.forEach(field => {
    if (field.input.value == "") {
      invalids += 1
      field.input.classList.add('is-invalid')
      document.getElementById(field.error).innerText = 'Campo obrigatório.'
    } else {
      field.input.classList.remove('is-invalid')
    }
  })
  return invalids <= 0 ? true : false
}

function handleChange(input) {
  console.log(input)
  switch (input) {
    case 'createUser':
      showCreateUser();
      break;
    case 'createBank':
      showCreateBank()
      break;
  }
}

async function loadUsers() {
  try {
    let list = await User.list()
    console.log(list)
    if (list.length <= 0) {
      return
    }
    let select = document.getElementById('accountOwner')
    select.innerHTML = ''
    var option = document.createElement("option");
    option.value = "";
    option.text = "Selecione";
    select.appendChild(option)
    list.forEach(user => {
      var option = document.createElement("option");
      option.value = user.name;
      option.text = user.name;
      select.appendChild(option)
    })
    var option = document.createElement("option");
    option.value = "createUser";
    option.text = "Cadastrar Usuário";
    option.style = "color:white; background-color: green"
    select.appendChild(option)
  } catch (error) {
    console.log(error)
  }

}

async function loadBanks() {
  let list = await Bank.list()
  let select = document.getElementById('accountBank')
  select.innerHTML = ''
  var option = document.createElement("option");
  option.value = "";
  option.text = "Selecione";
  select.appendChild(option)
  list.forEach(bank => {
    var option = document.createElement("option");
    option.value = bank.name;
    option.text = `${bank.code} - ${bank.name}`;
    select.appendChild(option)
  })
  var option = document.createElement("option");
  option.value = "createBank";
  option.text = "Cadastrar Banco";
  option.style = "color:white; background-color: green"
  select.appendChild(option)
}







var modalCreateUser = new bootstrap.Modal(document.getElementById('createUser'))
var modalCreateBank = new bootstrap.Modal(document.getElementById('createBankModal'));


function modalCreateAccountHide() {
  document.getElementById('accountOwner').selectedIndex = "0";
  document.getElementById('accountBank').selectedIndex = "0";
  document.getElementById('accountAgency').value = '';
  document.getElementById('accountNumber').value = '';
  document.getElementById('accountDigit').value = '';
  document.getElementById('accountBalance').value = '';
  document.getElementById('balanceDate').value = '';
  var modal = new bootstrap.Modal(document.getElementById('createAccount'))
  modal.hide()
}

function modalCreateUserShow() {
  modalCreateUser.show();
}

function modalCreateUserHide() {
  document.getElementById('userName').value = '';
  loadUsers()
  modalCreateUser.hide();
}

function modalCreateBankShow() {
  modalCreateBank.show()
}

function modalCreateBankHide() {
  document.getElementById('bankCode').value = '';
  document.getElementById('bankName').value = '';
  loadBanks()
  modalCreateBank.hide()
}


function showCreateUser() {
  modalCreateUserShow()
}

function showCreateBank() {
  modalCreateBankShow()
}



function notify(message) {
  let date = new Date()
  let options = { animation: true, autohide: true, delay: 5000 }
  var toast = document.getElementById('liveToast')
  var notificate = new bootstrap.Toast(toast, options)
  document.getElementById('date-time').innerText = date.toLocaleDateString('pt-BR') + " - " + date.toLocaleTimeString('pt-BR')
  document.getElementById('notification').innerText = message
  notificate.show()
}



