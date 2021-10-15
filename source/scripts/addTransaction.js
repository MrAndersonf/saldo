const User = require(path.resolve(__dirname, '../models/User.js'))
const Bank = require(path.resolve(__dirname, '../models/Bank.js'))
const Account = require(path.resolve(__dirname, '../models/Account.js'))
const Currency = require(path.resolve(__dirname, '../util/Currency.js'))
const Statement = require(path.resolve(__dirname, '../models/Statement.js'))

window.addEventListener('load', function () {
  loadOwner()
})

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

function backHome(e) {
  e.preventDefault()
  ipcRenderer.send('back-to-home')
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





async function loadOwner() {
  let list = await User.list()
  let select = document.getElementById('transOwner')
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
}

async function loadAccount(user) {
  console.log(user)
  let list = await Account.list()
  console.log(list)
  let select = document.getElementById('transAccount')
  select.innerHTML = ''
  var option = document.createElement("option");
  option.value = "";
  option.text = "Selecione";
  select.appendChild(option)
  list.forEach(account => {
    if (account.owner === user) {
      var option = document.createElement("option");
      option.value = account.number;
      option.text = `${account.number}-${account.digit}`;
      select.appendChild(option)
    }

  })
}

async function loadAccountsTableActive() {
  let list = await Account.actives();
  let table = document.getElementById('accountsTable')
  table.innerHTML = ""
  list.forEach(account => {
    let tr = `<tr>
      <td class="imgTd">
        <div class="imgBx">
          <img src="${account.owner.image}" alt="" />
         </div>
      </td>
      <td>
        <h4 class="userAc">
          ${account.owner.name}<br>
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
  document.getElementById('accountEditBalance').value = Currency.formater(account.balance.amount);
  document.getElementById('balanceEditDate').value = account.balance.date.slice(0, 10);
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

function handleManualOperation(event) {
  event.preventDefault()
  ipcRenderer.send("transaction-manual")
}

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

function handleAmount(e, amount) {
  e.preventDefault()
  let input = document.getElementById('transAmount')
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
    document.getElementById('transDescription').focus()
  }
}


async function insertOperation(e) {
  e.preventDefault();
  let type = document.getElementById('transType')
  let date = document.getElementById('transDate')
  let owner = document.getElementById('transOwner')
  let account = document.getElementById('transAccount')
  let amount = document.getElementById('transAmount')
  let description = document.getElementById('transDescription')
  let fields = [
    {
      input: owner,
      error: 'error-trans-owner',
    },
    {
      input: type,
      error: 'error-trans-type',
    },
    {
      input: account,
      error: 'error-trans-account',
    },
    {
      input: amount,
      error: 'error-trans-amount',
    },
    {
      input: description,
      error: 'error-trans-description',
    },
    {
      input: date,
      error: 'error-trans-date',
    },
  ]
  let result = validate(fields)
  if (!result) {
    notify(`Revise o formulário.`)
  } else {
    let dates = new Date(date.value)
    let cc = await Account.find(account.value)
    await Statement.insert(
      {
        date: new Date(dates.setDate(dates.getDate() + 1)),
        type: type.value.toUpperCase(),
        amount: (Currency.sanitizeCurrency(amount.value) / 100),
        description: description.value,
        account: {
          number: account.value,
          id: cc.id
        }
      })
    notify("Conta criada com sucesso.")
    document.getElementById('transType').selectedIndex = "0"
    document.getElementById('transDate').value = ""
    document.getElementById('transOwner').selectedIndex = "0"
    document.getElementById('transAccount').selectedIndex = "0"
    document.getElementById('transAmount').value = ""
    document.getElementById('transDescription').value = ""


  }


}