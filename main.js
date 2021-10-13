const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const notifier = require('node-notifier');
const process = require('process')
app.setAppUserModelId("Connect - Financeiro")
const userProfilePath = process.env.USERPROFILE + '\\Downloads'
app.allowRendererProcessReuse = false

 require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
 });

 let win = null;
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
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
   
  
    win.webContents.loadFile('./source/views/createAccount.html')
})



ipcMain.on('new-user-created', (event, data) => {

    event.reply('notify',data)
    event.reply('new-account-created')
})

ipcMain.on("close-ofx", (event, data) => {
    event.reply('notify',(event,data))
    
})



ipcMain.on('account-create-successfuly',(event,data)=>{
    alert(data)
})

ipcMain.on('main-screen',()=>{
    win.webContents.loadFile('./source/views/index.html')
})

function alert(options) {
    notifier.notify(
        {
            title: options.title,
            message: options.body,
            icon: path.join(__dirname, './source/assets/logo.png'), // Absolute path (doesn't work on balloons)
            sound: true, // Only Notification Center or Windows Toasters
            wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
        },
        function (err, response, metadata) {
            // Response is response from notification
            // Metadata contains activationType, activationAt, deliveredAt
        }
    );
  
    notifier.on('click', function (notifierObject, options, event) {
        // Triggers if `wait: true` and user clicks notification
    });
  
    notifier.on('timeout', function (notifierObject, options) {
        // Triggers if `wait: true` and notification closes
    });
  }