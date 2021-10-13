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

let ofxPreview = null;
ipcMain.on('render-ofx-data', (event, data) => {
    if (ofxPreview != null)
    return
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


let account = null;
ipcMain.on('open-account-create', (event) => {
   
    account = new BrowserWindow({
        width: 600,
        height: 320,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    account.on('close', () => {
        account = null
    })
    account.webContents.loadFile('./source/views/createAccount.html')
})



ipcMain.on('new-user-created', (event, data) => {
    event.reply('notify', data)
})

ipcMain.on("close-ofx", (event, data) => {
    event.reply('notify',(event,data))
    ofxPreview.close()
})

ipcMain.on('close-window-create-account', () => {
    account.close();
})


