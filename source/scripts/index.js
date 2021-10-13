const User = require(path.resolve(__dirname, '../models/User.js'))
const Bank = require(path.resolve(__dirname, '../models/Bank.js'))
const Account = require(path.resolve(__dirname, '../models/Account.js'))

window.addEventListener('load', function () {
  loadAccountsTableActive()
})

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
    modalCreateUserHide()
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
      date: date.value,
      status: "active"
    })
    notify("Conta criada com sucesso.")
    modalAccount.hide()
    loadAccountsTableActive()
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

async function loadAccountsTableActive() {
  let list = await Account.actives();
  let table = document.getElementById('accountsTable')
  table.innerHTML = ""
  list.forEach(account => {
    let tr = `<tr>
      <td class="imgTd">
        <div class="imgBx">
          <img src="../assets/userr.jpg" alt="" />
         </div>
      </td>
      <td>
        <h4 class="userAc">
          ${account.owner}<br>
          <span>${account.bank} </span>
          <span>${account.agency} - ${account.number} - ${account.status === "active" ? "Ativa" : "Inativa"}</span>
          
        </h4>
      </td>
      <td class="btnUserAc">
        <button class="iconBtn" onclick="modalHandleAccount('${account.number}')">
          <i class="fa fa-cogs fa-2x" aria-hidden="true"></i>
        </button>
      </td>
    </tr>`
    var newRow = table.insertRow(table.rows.length);
    newRow.innerHTML = tr;

  })
}

async function loadAccountsTableInactive() {
  let list = await Account.inactives()
  if (list.length <= 0) {
    notify("Não há contas inativas.")
    return
  }
  let table = document.getElementById('accountsTable')
  table.innerHTML = ""
  list.forEach(account => {

    let tr = `<tr>
      <td class="imgTd">
        <div class="imgBx">
          <img src="../assets/userr.jpg" alt="" />
         </div>
      </td>
      <td>
        <h4 class="userAc">
          ${account.owner}<br>
          <span>${account.bank} </span>
          <span>${account.agency} - ${account.number} - ${account.status === "active" ? "Ativa" : "Inativa"}</span>
          
        </h4>
      </td>
      <td class="btnUserAc">
        <button class="iconBtn" onclick="modalHandleAccount('${account.number}')">
          <i class="fa fa-cogs fa-2x" aria-hidden="true"></i>
        </button>
      </td>
    </tr>`
    var newRow = table.insertRow(table.rows.length);
    newRow.innerHTML = tr;

  })
}


async function modalHandleAccount(number) {
  let account = await Account.find(number)
  document.getElementById('accountEditOwner').value = account.owner;
  document.getElementById('accountEditBank').value = account.bank;
  document.getElementById('accountEditAgency').value = account.agency;
  document.getElementById('accountEditNumber').value = account.number;
  document.getElementById('accountEditDigit').value = account.digit;
  document.getElementById('accountEditBalance').value = account.balance;
  document.getElementById('balanceEditDate').value = account.date;
  let btn = document.getElementById('accountStatusBtn')
  if (account.status == 'active') {
    btn.classList.remove('btn-success')
    btn.classList.add('btn-warning')
    btn.innerText = "Inativar"
  } else {
    btn.classList.remove('btn-warning')
    btn.classList.add('btn-success')
    btn.innerText = "Reativar"
  }
  modalManageAccountShow()
}

async function handleAccountStatus(e) {
  e.preventDefault()
  let account = document.getElementById('accountEditNumber')
  console.log(account.value)
  await Account.status(account.value)
  modalManageAccountHide()
  loadAccountsTableActive()
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


var modalSignOut = new bootstrap.Modal(document.getElementById('sign_out_modal'))




function modalCreateAccountShow() {
  var modal = new bootstrap.Modal(document.getElementById('createAccount'))
  modal.show()
}

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
  var modal = new bootstrap.Modal(document.getElementById('createUser'))
  modal.show();
}

function modalCreateUserHide() {
  document.getElementById('userName').value = '';
  var modal = new bootstrap.Modal(document.getElementById('createUser'))
  modal.hide();
  modalCreateAccountShow()
}

function modalCreateBankShow() {
  var modal = new bootstrap.Modal(document.getElementById('createBankModal'));
  modal.show()
}

function modalCreateBankHide() {
  document.getElementById('bankCode').value = '';
  document.getElementById('bankName').value = '';
  var modal = new bootstrap.Modal(document.getElementById('createBankModal'));
  modal.hide()
  modalCreateAccountShow()
}

function modalManageAccountShow() {
  var modal = new bootstrap.Modal(document.getElementById('manageAccount'))
  modal.show()
}

function modalManageAccountHide() {
  var modal = new bootstrap.Modal(document.getElementById('manageAccount'))
  modal.hide()
}

function modalSignOutShow() {
  var modal = new bootstrap.Modal(document.getElementById('sign_out_modal'))
  modal.show()
}

function modalSignOutHide() {

}

function showCreateAccountModal() {
  modalCreateAccountShow()
  loadUsers()
  loadBanks()
}


function showCreateUser() {
  modalCreateAccountHide()
  modalCreateUserShow()
}

function showCreateBank() {
  modalCreateAccountHide()
  modalCreateBankShow()
}

function cancelSignOut() {
  modalSignOut.hide()
}

function systemSignOut(e) {
  e.preventDefault();
  modalSignOut.show()
}

