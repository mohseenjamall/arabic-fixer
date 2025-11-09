# Arabic Fixer

> Fix Arabic text rendering issues in Affinity Designer, Photo, and Publisher

![Arabic Fixer](https://img.shields.io/badge/status-beta-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey)
![License](https://img.shields.io/badge/license-Proprietary-red)

## 🎯 The Problem

Affinity suite (Designer, Photo, Publisher) doesn't properly support Arabic text rendering:
- ❌ Letters don't connect properly
- ❌ Text direction is wrong (LTR instead of RTL)
- ❌ Diacritics (تشكيل) display incorrectly
- ❌ Ligatures like لا don't form

This creates a **major barrier** for Arabic-speaking designers.

## ✨ The Solution

**Arabic Fixer** is a desktop app that automatically fixes Arabic text for Affinity:

1. **Auto-fix mode**: Copy any Arabic text → Paste in Affinity → It works!
2. **Manual mode**: Paste text → Process → Copy → Use anywhere
3. **Smart processing**: Handles letter shaping, RTL reversal, ligatures, and diacritics

## 🚀 Features

- ✅ **Automatic clipboard monitoring**
- ✅ **Proper letter connection** (isolated, initial, medial, final forms)
- ✅ **RTL text reversal** for LTR rendering
- ✅ **Lam-Alef ligatures** (لا، لأ، لإ، لآ)
- ✅ **Diacritics support** (Quran text, etc.)
- ✅ **System tray integration**
- ✅ **Global hotkey** (Ctrl+Shift+A)
- ✅ **Minimalist UI** with IBM Plex Sans Arabic
- ✅ **Cross-platform** (Windows & macOS)

## 📦 Installation

### Windows

1. Download the latest release from [Releases](https://github.com/mohseenjamall/arabic-fixer/releases)
2. Extract and run `Arabic-Fixer.exe`
3. No installation required!

### macOS

1. Download the latest `.dmg` from [Releases](https://github.com/mohseenjamall/arabic-fixer/releases)
2. Drag to Applications folder
3. Open and grant permissions

### From Source

```bash
# Clone repository
git clone https://github.com/mohseenjamall/arabic-fixer.git
cd arabic-fixer

# Install dependencies
npm install

# Run
npm start
```

## 🎮 How to Use

### Auto-Fix Mode (Recommended)

1. Click **"Enable Auto-Fix"** in the app
2. Copy any Arabic text from anywhere
3. Paste directly into Affinity Designer/Photo/Publisher
4. ✨ Text appears correctly!

### Manual Mode

1. Paste Arabic text into the text editor
2. Click **"Process Text"**
3. Click **"Copy to Clipboard"**
4. Paste into Affinity

### Keyboard Shortcut

Press `Ctrl+Shift+A` (Windows) or `Cmd+Shift+A` (Mac) to toggle auto-fix on/off

## 🔧 Technical Details

### How It Works

1. **Text Shaping**: Applies contextual Arabic letter forms
   - Isolated: `ب`
   - Final: `ـب`
   - Initial: `بـ`
   - Medial: `ـبـ`

2. **Ligature Formation**: Combines lam + alef
   - `ل` + `ا` → `ﻻ`

3. **RTL Reversal**: Mirrors text for LTR rendering engines
   - Input: `مرحباً`
   - Output: Shaped & reversed for Affinity

4. **Diacritics Preservation**: Keeps harakat intact
   - Supports Quranic text fully

### Built With

- **Electron** - Cross-platform desktop framework
- **Node.js** - Backend logic
- **IBM Plex Sans Arabic** - Typography
- **Custom Arabic shaping engine** - No external dependencies

## 🎨 Screenshots

![Main Interface](screenshots/main.png)
*Clean, minimalist interface*

![Auto-fix Mode](screenshots/auto-fix.png)
*Automatic clipboard monitoring*

![Manual Processing](screenshots/manual.png)
*Manual text processing*

## 🗺️ Roadmap

### Current (v1.0 - POC)
- ✅ Basic Arabic shaping
- ✅ Clipboard monitoring
- ✅ Desktop app (Windows/Mac)

### Planned (v1.1)
- [ ] Batch file processing (.txt, .docx)
- [ ] Custom font support
- [ ] Settings panel (auto-start, hotkey customization)
- [ ] Multi-language support (English/Arabic UI)

### Future (v2.0)
- [ ] Affinity plugin (if API becomes available)
- [ ] Cloud sync for settings
- [ ] Template library for common designs
- [ ] Commercial licensing

## 🤝 Contributing

This is currently a **closed-source** project during beta. Contributions are welcome after public release!

## 📄 License

**Proprietary** - All rights reserved.

Free for personal use during beta. Commercial licensing coming soon.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/mohseenjamall/arabic-fixer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mohseenjamall/arabic-fixer/discussions)
- **Email**: support@arabicfixer.com

## 🙏 Acknowledgments

- Inspired by the Arabic design community's struggle with Affinity
- Built for designers, by designers
- Special thanks to all beta testers

## 📊 Stats

![GitHub Stars](https://img.shields.io/github/stars/mohseenjamall/arabic-fixer)
![GitHub Forks](https://img.shields.io/github/forks/mohseenjamall/arabic-fixer)
![GitHub Issues](https://img.shields.io/github/issues/mohseenjamall/arabic-fixer)

---

**Made with ❤️ for the Arabic design community**

🌟 If this helped you, please star the repo!