const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Replace the require with inline detection code
const isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
require('@electron/remote/main').initialize(); // Initialize remote module

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true, // Be cautious with this in production
            contextIsolation: false, // Easier for IPC in this example, but less secure
            enableRemoteModule: true // Needed for dialog in renderer process via remote
        },
        backgroundColor: '#131314' // Set initial background color
    });

    win.loadURL(
        isDev
            ? 'http://localhost:3001' // Dev server URL (changed from 3000 to 3001)
            : `file://${path.join(__dirname, '../build/index.html')}` // Production build path
    );

    // Optional: Open DevTools automatically if in development
    if (isDev) {
        win.webContents.openDevTools({ mode: 'detach' });
    }

     require('@electron/remote/main').enable(win.webContents); // Enable remote for this window
}

app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC Handler for opening file dialog
ipcMain.handle('open-file-dialog', async (event) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (result.canceled || result.filePaths.length === 0) {
        return { error: 'File selection cancelled.', data: null };
    }

    const filePath = result.filePaths[0];
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(content); // Try parsing immediately
        return { error: null, data: jsonData, filePath: path.basename(filePath) };
    } catch (err) {
         console.error("Error reading or parsing file:", err);
         if (err instanceof SyntaxError) {
            return { error: `Error parsing JSON: ${err.message}`, data: null, filePath: path.basename(filePath) };
         } else {
            return { error: `Error reading file: ${err.message}`, data: null, filePath: path.basename(filePath) };
         }
    }
});