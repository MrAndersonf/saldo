const User = require(path.resolve(__dirname, '../models/User.js'))
const Bank = require(path.resolve(__dirname, '../models/Bank.js'))
const Account = require(path.resolve(__dirname, '../models/Account.js'))
const Statement = require(path.resolve(__dirname, '../models/Statement.js'))
const Currency = require(path.resolve(__dirname, '../util/Currency.js'))

window.addEventListener('load', function () {
  loadAccountsTableActive()
  loadLastMoviments()
})

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

function handleReport(e){
  e.preventDefault()
  ipcRenderer.send('show-report')
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
  await loadLastMoviments()
  try {
    let list = await User.list()
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
  document.getElementById('accountEditBalance').value = Currency.formater(account.balance.now);
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

async function deleteAccount(e){
  e.preventDefault()
  let account = document.getElementById('accountEditNumber').value;
  let selected = await Statement.last()
  selected.moviments.forEach(el =>{
    if(el.account.number == account){
      notify("Essa conta não pode ser cancelada.")
      return
    }
  })
  let result = await Account.delete(account)
  if(result){
    notify("Conta cancelada com sucesso..")
  }
  loadAccountsTableActive()
  modalManageAccountHide()
}

async function handleAccountStatus(e) {
  e.preventDefault()
  let account = document.getElementById('accountEditNumber')
  await Account.status(account.value)
  modalManageAccountHide()
  loadAccountsTableActive()
  loadLastMoviments()
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
var modal = new bootstrap.Modal(document.getElementById('manageAccount'))


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
  modal.show()
}

function modalManageAccountHide() {
  modal.hide()
}

function modalSignOutShow() {
  var modal = new bootstrap.Modal(document.getElementById('sign_out_modal'))
  modal.show()
}

function modalSignOutHide() {

}

function closeModalManage(e){
  e.preventDefault();
  modalManageAccountHide()
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


async function loadLastMoviments() {
  let info = await Statement.last()
  if (info.length <= 0) {
    notify("Não há contas inativas.")
    return
  }
  let table = document.getElementById('lastMoviments')
  table.innerHTML = ""
  info.accounts.forEach(account => {
    let debits = 0
    let credits = 0
    info.users.forEach(user => {
      if (account.owner == user.name) {
        info.moviments.forEach(op => {
          if (op.type !== "CREDIT" && op.account.number == account.number) {
            debits += op.amount
          } else if (op.type === "CREDIT" && op.account.number == account.number) {
            credits += op.amount
          }
        })
      }
    })
    let row = `<tr>
    <td>${account.owner}</td>
    <td>${account.bank}</td>
    <td>${account.number}-${account.digit}</td>
    <td>${Currency.formater(account.balance.then)}</td>
    <td>${Currency.formater(debits)}</td>
    <td>${Currency.formater(credits)}</td>
    <td>${Currency.formater(account.balance.now)}</td>   
  </tr>`
    var newRow = table.insertRow(table.rows.length);
    newRow.innerHTML = row;
  })
}

function handleMount(e, amount) {
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
