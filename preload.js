const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  compile: (code) => ipcRenderer.invoke('compile-latex', code),
  synctex: (page, x, y) => ipcRenderer.invoke('synctex', { page, x, y })
});
