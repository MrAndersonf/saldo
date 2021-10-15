const User = require(path.resolve(__dirname, '../models/User.js'))
const Account = require(path.resolve(__dirname, '../models/Account.js'))
const Currency = require(path.resolve(__dirname, '../util/Currency.js'))
const Statement = require(path.resolve(__dirname, '../models/Statement.js'))

window.addEventListener('load', function () {
  loadUsers();
})

async function loadUsers() {
  try {
    let list = await User.list()
    if (list.length <= 0) {
      return
    }
    let select = document.getElementById('owner')
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
  } catch (error) {
    console.log(error)
  }

}

async function loadBanks(e, user) {
  e.preventDefault()
  let accounts = await Account.list();
  let selected = []
  accounts.forEach(acc => {
    if (acc.owner === user) {
      selected.push(acc)
    }
  })
  let select = document.getElementById('bankName')
  select.innerHTML = ''
  var option = document.createElement("option");
  option.value = "";
  option.text = "Selecione";
  select.appendChild(option)
  selected.forEach(account => {
    var option = document.createElement("option");
    option.value = account.bank;
    option.text = `${account.bank}`;
    select.appendChild(option)
  })
}

async function loadAccounts(e, bank) {
  e.preventDefault()
  let user = document.getElementById('owner').value
  let accounts = await Account.list();
  let selected = []
  accounts.forEach(acc => {
    if (acc.bank == bank && acc.owner == user) {
      selected.push(acc)
    }
  })
  let select = document.getElementById('accountNumber')
  select.innerHTML = ''
  var option = document.createElement("option");
  option.value = "";
  option.text = "Selecione";
  select.appendChild(option)
  selected.forEach(account => {
    var option = document.createElement("option");
    option.value = account.number;
    option.text = `${account.number}`;
    select.appendChild(option)
  })
}

async function report(event) {
  event.preventDefault()
  let bank = document.getElementById('bankName').value
  let account = document.getElementById('accountNumber').value
  let start = document.getElementById('start').value
  let end = document.getElementById('end').value
  let owner = document.getElementById('owner').value
  if (owner != "" && bank == "" && account == "" && start == "" && end == "") {
    await filterByOwner(owner)
  }
  if (owner != "" && bank != "" && account == "" && start == "" && end == "") {
    await filterByOwnerAndBank(owner, bank)
  }
  if (owner != "" && bank != "" && account != "" && start == "" && end == "") {
    await filterByOwnerAndBankAndAccount(owner, bank, account)
  }
  if (owner != "" && bank != "" && account != "" && start != "" && end != "") {
    await filterByOwnerAndBankAndAccountAndPeriod(owner, bank, account, start, end)
  }
  if (owner == "" && bank == "" && account == "" && start != "" && end != "") {
    await filterByPeriod(start, end)
  }
  if (owner != "" && bank == "" && account == "" && start != "" && end != "") {
    await filterByPeriodAndOwner(start, end, owner)
  }

}

async function filterByOwner(owner) {
  let info = await Statement.last()
  let elements = []
  info.moviments.forEach(el => {
    if (el.account.owner === owner) {
      elements.push(el)
    }
  })
  let tableBody = document.getElementById("report-table");
  elements.forEach(el => {
    let td = `<tr>
        <td class="date">${new Date(el.date).toLocaleDateString('pt-br')}</td>
        <td class="names">${el.account.owner}</td>
        <td class="bank">${el.account.bank.name}</td>
        <td class="account">${el.account.number}-${el.account.digit}</td>        
        <td class="historic">${el.description.substr(0, Math.round(el.description.length * .50))}</td>
        <td class="debit">${el.type !== "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="credit">${el.type === "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="sald">${Currency.formater(el.balance)}</td>
    </tr>`
    let newRow = tableBody.insertRow(tableBody.rows.length);
    newRow.innerHTML = td;
  })
}

async function filterByOwnerAndBank(owner, bank) {
  let info = await Statement.last()
  let elements = []
  info.moviments.forEach(el => {
    if (el.account.owner === owner && el.account.bank.name == bank) {
      elements.push(el)
    }
  })
  let tableBody = document.getElementById("report-table");
  elements.forEach(el => {
    let td = `<tr>
        <td class="date">${new Date(el.date).toLocaleDateString('pt-br')}</td>
        <td class="names">${el.account.owner}</td>
        <td class="bank">${el.account.bank.name}</td>
        <td class="account">${el.account.number}-${el.account.digit}</td>
        <td class="historic">${el.description.substr(0, Math.round(el.description.length * .50))}</td>
        <td class="debit">${el.type !== "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="credit">${el.type === "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="sald">${Currency.formater(el.balance)}</td>
    </tr>`
    let newRow = tableBody.insertRow(tableBody.rows.length);
    newRow.innerHTML = td;
  })
}


async function filterByOwnerAndBankAndAccount(owner, bank, account) {
  let info = await Statement.last()
  let elements = []
  info.moviments.forEach(el => {
    if (el.account.owner === owner && el.account.bank.name == bank && el.account.number == account) {
      elements.push(el)
    }
  })
  let tableBody = document.getElementById("report-table");
  elements.forEach(el => {
    let td = `<tr>
        <td class="date">${new Date(el.date).toLocaleDateString('pt-br')}</td>
        <td class="names">${el.account.owner}</td>
        <td class="bank">${el.account.bank.name}</td>
        <td class="account">${el.account.number}-${el.account.digit}</td>        
        <td class="historic">${el.description.substr(0, Math.round(el.description.length * .50))}</td>
        <td class="debit">${el.type !== "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="credit">${el.type === "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="sald">${Currency.formater(el.balance)}</td>
    </tr>`
    let newRow = tableBody.insertRow(tableBody.rows.length);
    newRow.innerHTML = td;
  })
}

async function filterByOwnerAndBankAndAccountAndPeriod(owner, bank, account, start, end) {
  let info = await Statement.last()
  let elements = []
  info.moviments.forEach(el => {
    let date = new Date(end)
    date.setDate(date.getDate() + 1)
    if (el.account.owner == owner && el.account.bank.name == bank && el.account.number == account && new Date(el.date.substring(0, 10)).toISOString() > new Date(start).toISOString() && new Date(el.date.substring(0, 10)).toISOString() <= new Date(date).toISOString()) {
      elements.push(el)
    }
  })
  let tableBody = document.getElementById("report-table");
  tableBody.innerHTML = ""
  elements.forEach(el => {
    let td = `<tr>
        <td class="date">${new Date(el.date).toLocaleDateString('pt-br')}</td>
        <td class="names">${el.account.owner}</td>
        <td class="bank">${el.account.bank.name}</td>
        <td class="account">${el.account.number}-${el.account.digit}</td>        
        <td class="historic">${el.description.substr(0, Math.round(el.description.length * .50))}</td>
        <td class="debit">${el.type !== "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="credit">${el.type === "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="sald">${Currency.formater(el.balance)}</td>
    </tr>`
    let newRow = tableBody.insertRow(tableBody.rows.length);
    newRow.innerHTML = td;
  })
}

async function filterByPeriod(start, end) {
  let info = await Statement.last()
  let elements = []
  info.moviments.forEach(el => {
    let date = new Date(end)
    date.setDate(date.getDate() + 1)
    if (
      new Date(el.date.substring(0, 10)).toISOString() > new Date(start).toISOString() &&
      new Date(el.date.substring(0, 10)).toISOString() <= new Date(date).toISOString()) {
      elements.push(el)
    }
  })
  let tableBody = document.getElementById("report-table");
  tableBody.innerHTML = ""
  elements.forEach(el => {
    let td = `<tr>
        <td class="date">${new Date(el.date.substring(0, 10)).toLocaleDateString('pt-br')}</td>
        <td class="names">${el.account.owner}</td>
        <td class="bank">${el.account.bank.name}</td>
        <td class="account">${el.account.number}-${el.account.digit}</td>        
        <td class="historic">${el.description.substr(0, Math.round(el.description.length * .50))}</td>
        <td class="debit">${el.type !== "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="credit">${el.type === "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="sald">${Currency.formater(el.balance)}</td>
    </tr>`
    let newRow = tableBody.insertRow(tableBody.rows.length);
    newRow.innerHTML = td;
  })
}

async function filterByPeriodAndOwner(start, end, owner) {
  let info = await Statement.last()
  let elements = []
  info.moviments.forEach(el => {
    let date = new Date(end)
    date.setDate(date.getDate() + 1)
    if (el.account.owner == owner &&
      new Date(el.date.substring(0, 10)).toISOString() > new Date(start).toISOString() &&
      new Date(el.date.substring(0, 10)).toISOString() <= new Date(date).toISOString()) {
      elements.push(el)
    }
  })
  let tableBody = document.getElementById("report-table");
  tableBody.innerHTML = ""
  elements.forEach(el => {
    let td = `<tr>
        <td class="date">${new Date(el.date.substring(0, 10)).toLocaleDateString('pt-br')}</td>
        <td class="names">${el.account.owner}</td>
        <td class="bank">${el.account.bank.name}</td>
        <td class="account">${el.account.number}-${el.account.digit}</td>        
        <td class="historic">${el.description.substr(0, Math.round(el.description.length * .50))}</td>
        <td class="debit">${el.type !== "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="credit">${el.type === "CREDIT" ? Currency.formater(el.amount) : "-"}</td>
        <td class="sald">${Currency.formater(el.balance)}</td>
    </tr>`
    let newRow = tableBody.insertRow(tableBody.rows.length);
    newRow.innerHTML = td;
  })
}


function backToHome(event) {
  event.preventDefault();
  ipcRenderer.send("home-screen-load")
}

function showBankStatement(data) {
  let debits = 0
  let credits = 0
  let tableBody = document.getElementById("ofx-table");
  tableBody.innerHTML = "";
  data.BANKTRANLIST.STMTTRN.forEach((el) => {
    el.TRNTYPE != 'CREDIT' ? debits += Number(el.TRNAMT) : credits += Number(el.TRNAMT)
    let row = `<tr>
          <td class="date">${formater(el.DTPOSTED)}</th>
          <td class="docId">${el.FITID.split(" ")[0].length < 6 ? '-' : el.FITID.split(" ")[0]}</td>
          <td class="historic">${el.MEMO} - ${el.REFNUM != undefined ? el.REFNUM.substring(el.REFNUM.indexOf(' '), el.REFNUM.length - 1) : ""}</td>
          <td class="debit">${el.TRNTYPE != 'CREDIT' ? Number(el.TRNAMT).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) : "-"}</td>
          <td class="credit">${el.TRNTYPE === 'CREDIT' ? Number(el.TRNAMT).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) : "-"}</td>
          </tr>`;
    let newRow = tableBody.insertRow(tableBody.rows.length);
    newRow.innerHTML = row;
  });
}

function formater(date) {
  let rawDate = date.slice(0, 8);
  let day = rawDate.substring(6, 8)
  let month = rawDate.substring(4, 6)
  let year = rawDate.substring(0, 4)
  return `${day}/${month}/${year}`
}

function parseDate(date) {
  let rawDate = date.slice(0, 8);
  let day = rawDate.substring(6, 8)
  let month = rawDate.substring(4, 6)
  let year = rawDate.substring(0, 4)
  return new Date(`${year}-${month}-${day}`)
}





