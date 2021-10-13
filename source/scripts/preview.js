const path = require('path')
const electron = require('electron')
const Statement = require(path.resolve(__dirname, '../models/Statement.js'))
const Account = require(path.resolve(__dirname, '../models/Account.js'))

const querystring = require('querystring');
let query = querystring.parse(global.location.search);
let data = JSON.parse(query['?data'])
let accountInfo;

handleSelectedAccount(data)




let dataBank = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS
showBankStatement(dataBank)

async function handleSelectedAccount(data) {
    let accountData = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM.ACCTID.split('00000')
    let account = await Account.setAccount(accountData[1])
    accountInfo = account
    console.log(accountInfo)
    document.getElementById('bankId').textContent = account.bank.code


    document.getElementById('bankName').textContent = account.bank.name
    document.getElementById('accountAg').textContent = account.agency
    document.getElementById('accountNumber').textContent = account.number + "-" + account.digit

    document.getElementById('start').textContent = formater(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.DTSTART)
    document.getElementById('end').textContent = formater(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.DTEND)
    document.getElementById('owner').textContent = account.owner
    document.getElementById('status').textContent = account.status = 'active' ? "Ativa" : "Inativa"
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

    console.log(`Débitos = ${debits.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}   -   Créditos = ${credits.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}  -  Saldo = ${(debits + credits).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`)
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



async function incorporate(e) {
    e.preventDefault()
    let month = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN
    let debits = []
    let credits = []

    month.forEach(op => {
        if (op.TRNTYPE === "CREDIT") {
            credits.push({
                date: parseDate(op.DTPOSTED),
                type: op.TRNTYPE,
                amount: Number(op.TRNAMT),
                description: `${op.MEMO} - ${op.REFNUM != undefined ? op.REFNUM.substring(op.REFNUM.indexOf(' '), op.REFNUM.length - 1) : ""}`,
            })
        } else {
            debits.push({
                date: parseDate(op.DTPOSTED),
                type: op.TRNTYPE,
                amount: Number(op.TRNAMT),
                description: `${op.MEMO} - ${op.REFNUM != undefined ? op.REFNUM.substring(op.REFNUM.indexOf(' '), op.REFNUM.length - 1) : ""}`,
            })
        }
    })
    
    await Statement.create(
        {
            balance: 
            { 
                date: parseDate(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.LEDGERBAL.DTASOF), 
                amount: Number(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.LEDGERBAL.BALAMT) 
            },
            statement:{
                month: data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.DTEND.substring(4, 6),
                year: data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.DTEND.substring(0, 4),
                operations: {
                    credit: credits,
                    debit: debits
                }
            },
            account: accountInfo
        }
    )
    electron.ipcRenderer.send('close-ofx',{ title: "Sucesso", body: "Extrato .OFX importado." })
    
   
}


