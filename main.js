const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const process = require('process')

const userProfilePath = process.env.USERPROFILE+'\\Downloads'
app.allowRendererProcessReuse = false

require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
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
        defaultPath:  userProfilePath,
        filters: [           
            { name: 'Extrato Bancário', extensions: ['ofx'] },         
        ]
    })
    console.log(file)
    event.reply('bank-statement-path',file[0])
})

let ofxPreview;
ipcMain.on('render-ofx-data',(event, data)=>{
    ofxPreview =  new BrowserWindow({
        width: 1100,
        height: 640,
        
        webPreferences: {
            nodeIntegration: true
        }
    })
    ofxPreview.webContents.loadFile('./source/views/preview.html',{query: {"data": JSON.stringify(data)}})
    event
})