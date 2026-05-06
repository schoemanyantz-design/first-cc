const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  closeApp: () => require('electron').remote?.getCurrentWindow()?.close()
})
