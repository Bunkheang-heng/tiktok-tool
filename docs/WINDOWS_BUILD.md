# Windows Build & Installer Guide

How to build a standalone production Windows application for Ben10 FX Content Automation.

---

## 1. Local Testing

Before building the installer, verify that all TypeScript checks, tests, and bundling pass:

```powershell
# 1. Typecheck
npm run lint

# 2. Unit & Integration Tests
npm test

# 3. Production Vite Bundle
npm run build
```

---

## 2. Packaging the Windows Installer

Run:
```powershell
npm run package:win
```

This uses `electron-builder` to package:
- The compiled Electron Main process
- Preload script
- Optimized React Renderer UI
- Native SQLite database engine
- Windows desktop shortcut and autostart capabilities

Output executable:
```text
release/Ben10 FX Content Automation Setup 1.0.0.exe
```

The installer can be distributed to any Windows 10/11 64-bit machine and installs into `%LOCALAPPDATA%\Programs\ben10-fx-content-automation`.
