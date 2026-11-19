# گزارش نهایی نسخه نگهداری و امنیتی LAUNCHER 59 — نسخه 2.0.1

## ۱. خلاصه تغییرات فنی و امنیتی
- **ارتقای Electron به شاخه تحت پشتیبانی رسمی:** از `35.7.5` (EOL) به **`45.3.4`** (ثبت دقیق بدون `^` در `desktop/package.json` و هماهنگ‌سازی کامل در `desktop/package-lock.json` با نسخه برنامه `2.0.1`).
- **حفظ `electron-builder`:** بدون تغییر روی نسخه **`26.18.0`**.
- **امنیت ناوبری (`will-navigate`):** در `desktop/electron/main.cjs` کنترل `will-navigate` اضافه شد تا ناوبری داخلی فقط به فایل محلی `renderer/index.html` محدود شود، لینک‌های `http:`/`https:` به مرورگر پیش‌فرض (`shell.openExternal`) هدایت شوند و سایر پروتکل‌ها مسدود گردند. `setWindowOpenHandler`، `contextIsolation: true`، `nodeIntegration: false` و `sandbox: true` عیناً حفظ شدند.
- **تک‌منبع بودن `Always on Top`:** وضعیت `alwaysOnTop` به‌طور انحصاری از `%APPDATA%\launcher-59\settings.json` خوانده و ذخیره می‌شود؛ تغییر از داخل تنظیمات یا System Tray بلافاصله روی پنجره اعمال، در `settings.json` ذخیره و در رابط React همگام‌سازی می‌شود.

## ۲. بسته‌های خروجی نسخه 2.0.1 (مسیر مستقل)
- **Setup:** `Launcher-59-Release/v2.0.1/Setup/Launcher59-Setup-2.0.1-x64.exe`
  - حجم دقیق: `119,731,111` بایت (`~114.2 MB`)
  - نوع: `PE32 executable (GUI) Intel 80386, for MS Windows, Nullsoft Installer self-extracting archive` (درون‌ریزی باینری `win32-x64`)
  - SHA256: `acd3a4dd4ca67a11a8b2341fb61ff7f21ba123a9b6708892b2bf4fd9971f7387`
- **Portable:** `Launcher-59-Release/v2.0.1/Portable/Launcher59-Portable-2.0.1-x64.exe`
  - حجم دقیق: `160,142,886` بایت (`~152.7 MB`)
  - نوع: `PE32 executable (GUI) Intel 80386, for MS Windows, Nullsoft Installer self-extracting archive`
  - SHA256: `1a6476177a28df583c4a257821bd75ab966d3ba2aa6b148885cccfdb6ce7c2b2`
- **وضعیت امضای دیجیتال:** هر دو فایل **Unsigned** هستند.

## ۳. وضعیت نسخه 2.0.0
- نسخه `2.0.0` بدون هیچ تغییری در `Recovery-Points/v2.0.0-radial-backup/` و `Launcher-59-Release/Archive-v2.0.0/` حفظ شده است.

## ۴. آزمون‌ها
- **تأییدشده در محیط ساخت:** `tsc --noEmit`، `compile_applet`، `node --check` برای `main.cjs` و `preload.cjs`، بیلد آفلاین Vite، بررسی وجود `/build/icon.png` و `"version": "2.0.1"` در `app.asar`، تولید دو فایل `.exe` و تطبیق کامل `SHA256`.
- **نیازمند آزمایش روی ویندوز واقعی ۱۰/۱۱:** نصب Setup، عبور از SmartScreen، عملکرد شفافیت پنجره و System Tray با Electron `45.3.4`، آزمون تداوم `Always on Top` پس از بستن و اجرای مجدد، آزمون `will-navigate` و اجرای میانبرهای محلی ویندوز.
