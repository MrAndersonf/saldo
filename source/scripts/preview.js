
const Statement = require(path.resolve(__dirname, '../models/Statement.js'))
const Account = require(path.resolve(__dirname, '../models/Account.js'))


const querystring = require('querystring');
let query = querystring.parse(global.location.search);
let data = JSON.parse(query['?data'])
let accountInfo;
console.log(data)
handleSelectedAccount(data)

let moviment;


let dataBank = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS
showBankStatement(dataBank)

async function handleSelectedAccount(data) {

    let accountData = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM.ACCTID.split('00000')
    let account = await Account.setAccount(accountData[1])
    moviment = await handleBalance(data)
    accountInfo = account
    accountInfo.balance.then = accountInfo.balance.now
    accountInfo.balance.now = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.LEDGERBAL.BALAMT
    accountInfo.balance.date = parseDate(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.LEDGERBAL.DTASOF)
    document.getElementById('bankId').textContent = account.bank.code


    document.getElementById('bankName').textContent = account.bank.name
    document.getElementById('accountAg').textContent = account.agency
    document.getElementById('accountNumber').textContent = account.number + "-" + account.digit

    document.getElementById('start').textContent = formater(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.DTSTART)
    document.getElementById('end').textContent = formater(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.DTEND)
    document.getElementById('owner').textContent = account.owner
    document.getElementById('status').textContent = account.status = 'active' ? "Ativa" : "Inativa"
}


function backToHome(event) {
    event.preventDefault();
    ipcRenderer.send("home-screen-load")
}

async function handleBalance(data) {
    let accountData = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM.ACCTID.split('00000')
    let acc = await Account.setAccount(accountData[1])
    let balancebefore;
    let currentBalance = acc.balance.now
    let ops = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN
    let l = []
    let debits = 0
    let credits = 0
    ops.forEach((el) => {
        el.TRNTYPE === "CREDIT" ? credits += parseFloat(el.TRNAMT) : debits += parseFloat(el.TRNAMT)
        let a = {
            balance: currentBalance.toString(),
            date: parseDate(el.DTPOSTED),
            type: el.TRNTYPE,
            amount: Number(el.TRNAMT),
            description: `${el.MEMO} - ${el.REFNUM != undefined ? el.REFNUM.substring(el.REFNUM.indexOf(' '), el.REFNUM.length - 1) : ""}`,
            account: {
                number: acc.number,
                bank: acc.bank,
                digit: acc.digit,
                owner: acc.owner,
                id: acc.id
            },
            position: Number(parseFloat(currentBalance) + parseFloat(el.TRNAMT)).toFixed(2)
        }
        balancebefore = currentBalance;
        currentBalance = Number(parseFloat(currentBalance) + parseFloat(a.amount)).toFixed(2)
        acc.balance.then = acc.balance.now;
        acc.balance.now = currentBalance;

        l.push(a)

    })
    console.log(credits)
    console.log(debits)
    return { balance: { then: balancebefore, now: currentBalance }, ops: l }
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

function notify(message) {
    let date = new Date()
    let options = { animation: true, autohide: true, delay: 5000 }
    var toast = document.getElementById('liveToast')
    var notificate = new bootstrap.Toast(toast, options)
    document.getElementById('date-time').innerText = date.toLocaleDateString('pt-BR') + " - " + date.toLocaleTimeString('pt-BR')
    document.getElementById('notification').innerText = message
    notificate.show()
}

async function incorporate(e) {
    e.preventDefault()


    await Statement.create(moviment)
    notify("Extrato incorporado com sucesso")


}


