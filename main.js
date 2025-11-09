const { app, BrowserWindow, ipcMain, clipboard, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isMonitoring = false;
let lastClipboard = '';

// Complete Arabic character forms mapping (Isolated, Final, Initial, Medial)
const ARABIC_FORMS = {
  'ا': ['ا', 'ﺎ', 'ﺍ', 'ﺎ'],
  'أ': ['أ', 'ﺄ', 'ﺃ', 'ﺄ'],
  'إ': ['إ', 'ﺈ', 'ﺇ', 'ﺈ'],
  'آ': ['آ', 'ﺂ', 'ﺁ', 'ﺂ'],
  'ء': ['ء', 'ء', 'ء', 'ء'],
  'ب': ['ب', 'ﺐ', 'ﺑ', 'ﺒ'],
  'ت': ['ت', 'ﺖ', 'ﺗ', 'ﺘ'],
  'ث': ['ث', 'ﺚ', 'ﺛ', 'ﺜ'],
  'ج': ['ج', 'ﺞ', 'ﺟ', 'ﺠ'],
  'ح': ['ح', 'ﺢ', 'ﺣ', 'ﺤ'],
  'خ': ['خ', 'ﺦ', 'ﺧ', 'ﺨ'],
  'د': ['د', 'ﺪ', 'ﺩ', 'ﺪ'],
  'ذ': ['ذ', 'ﺬ', 'ﺫ', 'ﺬ'],
  'ر': ['ر', 'ﺮ', 'ﺭ', 'ﺮ'],
  'ز': ['ز', 'ﺰ', 'ﺯ', 'ﺰ'],
  'س': ['س', 'ﺲ', 'ﺳ', 'ﺴ'],
  'ش': ['ش', 'ﺶ', 'ﺷ', 'ﺸ'],
  'ص': ['ص', 'ﺺ', 'ﺻ', 'ﺼ'],
  'ض': ['ض', 'ﺾ', 'ﺿ', 'ﻀ'],
  'ط': ['ط', 'ﻂ', 'ﻃ', 'ﻄ'],
  'ظ': ['ظ', 'ﻆ', 'ﻇ', 'ﻈ'],
  'ع': ['ع', 'ﻊ', 'ﻋ', 'ﻌ'],
  'غ': ['غ', 'ﻎ', 'ﻏ', 'ﻐ'],
  'ف': ['ف', 'ﻒ', 'ﻓ', 'ﻔ'],
  'ق': ['ق', 'ﻖ', 'ﻗ', 'ﻘ'],
  'ك': ['ك', 'ﻚ', 'ﻛ', 'ﻜ'],
  'ل': ['ل', 'ﻞ', 'ﻟ', 'ﻠ'],
  'م': ['م', 'ﻢ', 'ﻣ', 'ﻤ'],
  'ن': ['ن', 'ﻦ', 'ﻧ', 'ﻨ'],
  'ه': ['ه', 'ﻪ', 'ﻫ', 'ﻬ'],
  'و': ['و', 'ﻮ', 'ﻭ', 'ﻮ'],
  'ي': ['ي', 'ﻲ', 'ﻳ', 'ﻴ'],
  'ى': ['ى', 'ﻰ', 'ﻯ', 'ﻰ'],
  'ة': ['ة', 'ﺔ', 'ﺓ', 'ﺔ'],
  'ئ': ['ئ', 'ﺊ', 'ﺋ', 'ﺌ'],
  'ؤ': ['ؤ', 'ﺆ', 'ﺅ', 'ﺆ']
};

// Lam-Alef ligatures
const LAM_ALEF_LIGATURES = {
  'لا': { isolated: 'ﻻ', final: 'ﻼ' },
  'لأ': { isolated: 'ﻷ', final: 'ﻸ' },
  'لإ': { isolated: 'ﻹ', final: 'ﻺ' },
  'لآ': { isolated: 'ﻵ', final: 'ﻶ' }
};

// Characters that don't connect to the right
const NON_CONNECTORS_RIGHT = new Set([
  'ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ء', 'ة'
]);

function isArabic(char) {
  const code = char.charCodeAt(0);
  return (code >= 0x0600 && code <= 0x06FF) || (code >= 0xFE70 && code <= 0xFEFF);
}

function isDiacritic(char) {
  const code = char.charCodeAt(0);
  return (code >= 0x064B && code <= 0x0652) || 
         (code >= 0x0653 && code <= 0x0655) ||
         code === 0x0670;
}

function stripDiacritics(text) {
  return Array.from(text).filter(char => !isDiacritic(char)).join('');
}

function isArabicLetter(char) {
  return ARABIC_FORMS.hasOwnProperty(char);
}

function canConnectToLeft(char) {
  return isArabicLetter(char);
}

function canConnectToRight(char) {
  return isArabicLetter(char) && !NON_CONNECTORS_RIGHT.has(char);
}

function shapeArabicWord(word) {
  if (!word || word.trim() === '') return word;
  
  const chars = [];
  const diacritics = [];
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (isDiacritic(char)) {
      diacritics[chars.length - 1] = (diacritics[chars.length - 1] || '') + char;
    } else {
      chars.push(char);
      diacritics.push('');
    }
  }
  
  const shaped = [];
  let i = 0;
  
  while (i < chars.length) {
    const current = chars[i];
    
    if (current === 'ل' && i + 1 < chars.length) {
      const next = chars[i + 1];
      const ligatureKey = current + next;
      const ligature = LAM_ALEF_LIGATURES[ligatureKey];
      
      if (ligature) {
        const prev = i > 0 ? chars[i - 1] : null;
        const connectsToLeft = prev && canConnectToRight(prev);
        shaped.push(connectsToLeft ? ligature.final : ligature.isolated);
        i += 2;
        continue;
      }
    }
    
    if (!isArabicLetter(current)) {
      shaped.push(current);
      i++;
      continue;
    }
    
    const prev = i > 0 ? chars[i - 1] : null;
    const next = i < chars.length - 1 ? chars[i + 1] : null;
    
    const prevWasLamInLigature = prev === 'ل' && LAM_ALEF_LIGATURES.hasOwnProperty(prev + current);
    if (prevWasLamInLigature) {
      i++;
      continue;
    }
    
    const connectsToLeft = prev && canConnectToRight(prev) && canConnectToLeft(current);
    const connectsToRight = next && canConnectToLeft(next) && canConnectToRight(current);
    
    let formIndex = 0;
    if (connectsToLeft && connectsToRight) {
      formIndex = 3;
    } else if (connectsToLeft) {
      formIndex = 1;
    } else if (connectsToRight) {
      formIndex = 2;
    }
    
    const forms = ARABIC_FORMS[current];
    let shapedChar = current;
    if (forms && forms[formIndex]) {
      shapedChar = forms[formIndex];
    }
    
    if (diacritics[i]) {
      shapedChar += diacritics[i];
    }
    
    shaped.push(shapedChar);
    i++;
  }
  
  return shaped.join('');
}

function processArabicText(text) {
  if (!text || text.trim() === '') return text;
  
  const lines = text.split('\n');
  
  return lines.map(line => {
    const words = line.split(' ');
    const shapedWords = words.map(word => shapeArabicWord(word));
    const reversedWords = shapedWords.reverse();
    const mirroredWords = reversedWords.map(word => {
      return Array.from(word).reverse().join('');
    });
    
    return mirroredWords.join(' ');
  }).join('\n');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: true,
    resizable: true,
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFRSURBVFhH7ZaxSsNQFIYTBwcHQRDB1UEQXBx8AQdxcXVx8QkcfAIHX8DBURcXBx/AwVEQBEEQBEEQBEEQBEEQBEEQhH+jqmq0Wi3RbDZFs9kUzWZTNBoN0Wg0RL1eF7VaTVSrVVGpVES5XBalUkkUi0VRKBREPp8XuVxOZLNZkclkRDqdFqlUSkSTSRGNRkUkEhHhcFiEQiERDAZFIBAQfr9f+Hw+4fV6hcfjEW63W7hcLuF0OoXD4RB2u13YbDZhtVqFxWIRZrNZmEwmYTQahcFgEHq9Xuh0OqHVaoVGoxFqtVqoVCqhVCqFQqEQCoVCyOVyIZPJhFQqFRKJREgkEiEWi4VYLBYikUiIRCIhFAqFUCgUAp/P5/N5PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6P97cQRfkCxYZfhX5OWAUAAAAASUVORK5CYII=');
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Toggle Monitoring',
      click: () => {
        isMonitoring = !isMonitoring;
        mainWindow.webContents.send('monitoring-changed', isMonitoring);
      }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Arabic Fixer - Monitoring: OFF');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.show();
  });
}

function startClipboardMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  tray.setToolTip('Arabic Fixer - Monitoring: ON');
  
  const checkClipboard = () => {
    if (!isMonitoring) return;
    
    try {
      const current = clipboard.readText();
      
      if (current && current !== lastClipboard && current.trim() !== '') {
        if (Array.from(current).some(isArabic)) {
          const processed = processArabicText(current);
          
          lastClipboard = processed;
          clipboard.writeText(processed);
          
          if (mainWindow && !mainWindow.isMinimized()) {
            mainWindow.webContents.send('text-processed', {
              original: current,
              processed: processed
            });
          }
        } else {
          lastClipboard = current;
        }
      }
    } catch (error) {
      console.error('Clipboard error:', error);
    }
    
    setTimeout(checkClipboard, 1000);
  };
  
  checkClipboard();
}

function stopClipboardMonitoring() {
  isMonitoring = false;
  tray.setToolTip('Arabic Fixer - Monitoring: OFF');
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    if (isMonitoring) {
      stopClipboardMonitoring();
    } else {
      startClipboardMonitoring();
    }
    mainWindow.webContents.send('monitoring-changed', isMonitoring);
  });
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.on('toggle-monitoring', () => {
  if (isMonitoring) {
    stopClipboardMonitoring();
  } else {
    startClipboardMonitoring();
  }
  mainWindow.webContents.send('monitoring-changed', isMonitoring);
});

ipcMain.on('process-text', (event, text) => {
  const processed = processArabicText(text);
  event.reply('text-processed', {
    original: text,
    processed: processed
  });
  clipboard.writeText(processed);
});

ipcMain.on('get-monitoring-status', (event) => {
  event.reply('monitoring-changed', isMonitoring);
});
