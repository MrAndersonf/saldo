const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const process = require('process')
app.setAppUserModelId("Connect - Financeiro")
const userProfilePath = process.env.USERPROFILE + '\\Downloads'
app.allowRendererProcessReuse = false

// require('electron-reload')(__dirname, {
//     electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
// });


function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.webContents.loadFile('./source/views/index.html')
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})


ipcMain.on('select-bank-statement', (event) => {
    let file = dialog.showOpenDialogSync(null, {
        properties: ['openFile'],
        defaultPath: userProfilePath,
        filters: [
            { name: 'Extrato Bancário', extensions: ['ofx'] },
        ]
    })
    if (file === undefined)
        return
    event.reply('bank-statement-path', file[0])
})

let ofxPreview;
ipcMain.on('render-ofx-data', (event, data) => {
    ofxPreview = new BrowserWindow({
        fullscreen: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    ofxPreview.on('close', () => {
        ofxPreview = null
    })
    ofxPreview.webContents.loadFile('./source/views/preview.html', { query: { "data": JSON.stringify(data) } })

})

ipcMain.on('system-sign-out', (e) => {
    app.quit()
})


let account;
ipcMain.on('open-account-create', (event) => {
    account = new BrowserWindow({
        width: 600,
        height: 320,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    account.webContents.loadFile('./source/views/createAccount.html')
})



ipcMain.on('new-user-created', (event) => {
    event.reply('notify')
})

ipcMain.on("close-ofx-window", (event) => {    
    event.reply('notify')    
})
