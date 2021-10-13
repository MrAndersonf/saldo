const { ipcRenderer } = require('electron')
const fs = require('fs')
const ofx = require('node-ofx-parser');



function importBankStatement() {
    ipcRenderer.send('select-bank-statement')
}

ipcRenderer.on('bank-statement-path', (e, file) => {
    fs.readFile(file, 'utf8', function (err, ofxData) {
        if (err) throw err;

        const data = ofx.parse(ofxData);
        console.dir(data);
        ipcRenderer.send('render-ofx-data', data)
    });
})

function confirmSignOut(e) {
    e.preventDefault();
    ipcRenderer.send('system-sign-out')
}

function showCreateAccount(e) {
    e.preventDefault();
    ipcRenderer.send('open-account-create')
}

ipcRenderer.on('notify', (event, data) => {
    try {
        let notification = new Notification("Test Title", { body: "Test Body" });

        notification.show();
    } catch (error) {
        console.log(error)
    }
})





