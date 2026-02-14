const { app, BrowserWindow, Menu } = require('electron/main');
const path = require('node:path');

function createWindow() {
  // Создаем новое окно браузера с настройками
  const win = new BrowserWindow({
    width: 600,
    height: 600,
    minWidth: 600,
    minHeight: 600,
  });

  // Загружаем собранное Angular приложение
  win.loadFile(path.join(__dirname, 'dist/timer/browser/index.html'));

  // Открыть DevTools (опционально)
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  // Убираем меню полностью
  Menu.setApplicationMenu(null);

  createWindow();

  // Событие для macOS: при клике на иконку в панель Dock, если нет окон - создаем новое
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Когда все окна закрыты (кроме macOS)
app.on('window-all-closed', () => {
  // Для macOS (darwin) приложение обычно не закрывается
  // Для Windows и Linux - закрываем
  if (process.platform !== 'darwin') {
    app.quit(); // Полностью выходим из приложения
  }
});
