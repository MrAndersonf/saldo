const path = require('path');
const { list } = require('../models/User');
const User = require(path.resolve(__dirname, '../models/User.js'))
const Bank = require(path.resolve(__dirname, '../models/Bank.js'))
const Account = require(path.resolve(__dirname, '../models/Account.js'))
const Currency = require(path.resolve(__dirname, '../util/Currency.js'))
loadAccountsTable()

function menuhandle(id) {
  this.event.preventDefault()
  let menuItems = document.getElementsByTagName('ul')[0].getElementsByTagName('li')
  for (let index = 0; index < menuItems.length; index++) {
    const element = menuItems[index];
    let currentClass = element.className;
    let anchor = element.getElementsByTagName('a')[0]
    console.log(anchor.getAttribute('id'))
    if (anchor.getAttribute('id') === id) {
      element.classList.add('active')
    }
  }
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

function toggleMenu() {
  let toggle = document.querySelector(".toggle");
  let navigation = document.querySelector(".navigations");
  let main = document.querySelector(".main");
  toggle.classList.toggle("active");
  navigation.classList.toggle("active");
  main.classList.toggle("active");
}

async function insertUser() {
  let userName = document.getElementById('userName')
  if (userName.value.length > 2) {
    userName.classList.remove('is-invalid');
    await User.create({ name: userName.value })
    notify(`Usuário ${userName.value} criado.`)
    modalUser.hide()
  } else {
    userName.classList.add('is-invalid');
    document.getElementById('error-message').innerText = "O nome deve conter no mínimo 3 caracteres."
  }
}

function insertAccount() {
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
    notify(`Revise o formulário.`)
  } else {
    Account.create({
      owner: owner.value,
      bank: bank.value,
      agency: agency.value,
      number: number.value,
      digit: digit.value,
      balance: balance.value,
      date: date.value
    })
    notify("Conta criada com sucesso.")
    modalAccount.hide()
    loadAccountsTable()
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
    notify(`Banco ${name.value} criado. `)
    modalBank.hide()
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
  let list = await User.list()
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

async function loadAccountsTable() {
  let list = await Account.list()
  console.log(list)
  let table = document.getElementById('accountsTable')
  table.innerHTML = ""
  list.forEach(account => {
    console.log(JSON.stringify(account))
    let tr = `<tr>
      <td class="imgTd">
        <div class="imgBx">
          <img src="../assets/userr.jpg" alt="" />
         </div>
      </td>
      <td>
        <h4 class="userAc">
          ${account.owner}<br>
          <span>${account.bank}</span>
          <span>${account.agency} - ${account.number}</span>
        </h4>
      </td>
      <td class="btnUserAc">
        <button class="iconBtn" onclick="modalHandleAccount('${JSON.stringify(account).split('"').join('"')}')">
          <i class="fa fa-cogs fa-2x" aria-hidden="true"></i>
        </button>
      </td>
    </tr>`
    var newRow = table.insertRow(table.rows.length);    
    newRow.innerHTML = tr;

  })
}

function modalHandleAccount(account){
  console.log(JSON.parse(account))
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



var modalAccount = new bootstrap.Modal(document.getElementById('createAccount'))
var modalUser = new bootstrap.Modal(document.getElementById('createUser'))
var modalBank = new bootstrap.Modal(document.getElementById('createBankModal'))


var hiddenModalAccount = document.getElementById('createAccount')
hiddenModalAccount.addEventListener('hidden.bs.modal', () => {
  document.getElementById('accountOwner').selectedIndex = "0";
  document.getElementById('accountBank').selectedIndex = "0";
  document.getElementById('accountAgency').value = '';
  document.getElementById('accountNumber').value = '';
  document.getElementById('accountDigit').value = '';
  document.getElementById('accountBalance').value = '';
  document.getElementById('balanceDate').value = '';

})

hiddenModalAccount.addEventListener('shown.bs.modal', () => {
  loadUsers()
  loadBanks()
})



var hiddenModalUser = document.getElementById('createUser')
hiddenModalUser.addEventListener('hidden.bs.modal', () => {
  document.getElementById('userName').value = '';
  modalAccount.show()
})


var hiddenModalBank = document.getElementById('createBankModal')
hiddenModalBank.addEventListener('hidden.bs.modal', () => {
  document.getElementById('bankCode').value = '';
  document.getElementById('bankName').value = '';
  modalAccount.show();
})


function showCreateAccountModal() {
  modalAccount.show();
}


function showCreateUser() {
  modalAccount.hide()
  modalUser.show();
}

function showCreateBank() {
  modalAccount.hide()
  modalBank.show();
}

