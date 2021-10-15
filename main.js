const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')

const process = require('process')
app.setAppUserModelId("Connect - Financeiro")
const userProfilePath = process.env.USERPROFILE + '\\Downloads'
app.allowRendererProcessReuse = false

//  require('electron-reload')(__dirname, {
//    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
// });

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
      { name: 'Extrato Bancário', extensions: ['ofx'] }]
  })
  if (file === undefined)
    return
  event.reply('bank-statement-path', file[0])
})

ipcMain.on('select-image-user', (event) => {
  let file = dialog.showOpenDialogSync(null, {
    properties: ['openFile'],
    defaultPath: userProfilePath,
    filters: [
      { name: 'Image', extensions: ['jpg', 'png', 'jpeg'] }]
  })

  if (file === undefined)
    return
  event.reply('selected-image', file[0])
})


ipcMain.on('render-ofx-data', (event, data) => {

  win.webContents.loadFile('./source/views/preview.html', { query: { "data": JSON.stringify(data) } })

})

ipcMain.on('system-sign-out', (e) => {
  app.quit()
})


ipcMain.on('open-account-create', (event) => {
  win.webContents.loadFile('./source/views/createAccount.html')
})



ipcMain.on('new-user-created', (event, data) => {
  event.reply('notify', data)
  event.reply('new-account-created')
})

ipcMain.on("close-ofx", (event, data) => {
  event.reply('notify', (event, data))

})

ipcMain.on("transaction-manual", () => {
  win.webContents.loadFile('./source/views/addTransaction.html')
})



ipcMain.on('main-screen', () => {
  win.webContents.loadFile('./source/views/index.html')
})

ipcMain.on('back-to-home', () => {
  win.webContents.loadFile('./source/views/index.html')
})

ipcMain.on('home-screen-load', () => {

  win.webContents.loadFile('./source/views/index.html')
})

ipcMain.on('show-report', () => {
  win.webContents.loadFile('./source/views/report.html')
})

