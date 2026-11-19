const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcher59Desktop', {
  getInfo: () => ipcRenderer.invoke('desktop:getInfo'),
  getSystemStats: () => ipcRenderer.invoke('desktop:getSystemStats'),
  getPlacementContext: () => ipcRenderer.invoke('desktop:getPlacementContext'),
  launchTarget: (payload) => ipcRenderer.invoke('desktop:launchTarget', payload),
  pickExecutable: () => ipcRenderer.invoke('desktop:pickExecutable'),
  extractAppIcons: (filePath) => ipcRenderer.invoke('desktop:extractAppIcons', filePath),
  pickIconImage: () => ipcRenderer.invoke('desktop:pickIconImage'),
  saveAppIcon: (appId, dataUrl, variant) =>
    ipcRenderer.invoke('desktop:saveAppIcon', appId, dataUrl, variant),
  deleteAppIcon: (appId) => ipcRenderer.invoke('desktop:deleteAppIcon', appId),
  getAutoStart: () => ipcRenderer.invoke('desktop:getAutoStart'),
  setAutoStart: (enabled) => ipcRenderer.invoke('desktop:setAutoStart', enabled),
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('desktop:setAlwaysOnTop', enabled),
  setMinimizeToTray: (enabled) => ipcRenderer.invoke('desktop:setMinimizeToTray', enabled),
  setWindowMode: (payload) => ipcRenderer.invoke('desktop:setWindowMode', payload),
  moveWindowBy: (dx, dy) => ipcRenderer.invoke('desktop:moveWindowBy', dx, dy),
  setPositionPreset: (preset) => ipcRenderer.invoke('desktop:setPositionPreset', preset),
  readUserFile: (name) => ipcRenderer.invoke('desktop:readUserFile', name),
  writeUserFile: (name, content) => ipcRenderer.invoke('desktop:writeUserFile', name, content),
  notify: (title, body) => ipcRenderer.invoke('desktop:notify', title, body),
  windowAction: (action) => ipcRenderer.invoke('desktop:windowAction', action),
  onTrayCommand: (cb) => {
    const handler = (_event, command) => cb(command);
    ipcRenderer.on('tray:command', handler);
    return () => ipcRenderer.removeListener('tray:command', handler);
  },
});
