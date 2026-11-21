# LAUNCHER 59

<p align="center">
  <img src="desktop/build/icon.svg" alt="LAUNCHER 59 official app icon" width="160" />
</p>

لانچر دایره‌ای شناور، مینیمال و شیشه‌ای برای دسکتاپ ویندوز ۱۰ و ۱۱ (Windows 11 Glassmorphism / Acrylic).

- **نسخه فعلی:** `2.1.0`
- **موتور دسکتاپ:** Electron `45.3.4` (Windows x64)
- **صفحه آخرین انتشار:** [GitHub Releases (Latest)](https://github.com/forog1980-star/Lanch59/releases/latest)

---

## دانلود نسخه ویندوز (v2.1.0)

### برای نصب معمولی، دقیقاً این فایل را دانلود و اجرا کنید

**`Launcher59-Setup-2.1.0-x64.exe`**

[دانلود مستقیم Launcher59-Setup-2.1.0-x64.exe](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/Launcher59-Setup-2.1.0-x64.exe)

این فایل، نصب‌کننده مستقل و پیشنهادی برای کاربر عادی است. آن را اجرا کنید و مراحل نصب را ادامه دهید. نصب برای کاربر فعلی ویندوز انجام می‌شود و به دسترسی Administrator نیاز ندارد.

SHA256: `9e025cc691069a257193d97e1dede3a78aae5087b95849ded0d834f191bf0e4a`

### نصب همراه با تنظیمات و میانبرهای از پیش آماده

برای دریافت بسته‌ای که تنظیمات نمونه، میانبرها و آیکون‌های پیکربندی‌شده را نیز در خود دارد، این فایل را دانلود کنید:

**`LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip`**

[دانلود بسته کامل LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip)

پس از استخراج ZIP:
1. فایل داخل بسته با مسیر دقیق `01-Installer\Launcher59-Setup-2.1.0-x64.exe` را نصب کنید.
2. پیش از اولین اجرای لانچر، از ریشه پوشه استخراج‌شده فایل `Import-Launcher59-Configuration.ps1` را اجرا کنید. هنگام واردکردن تنظیمات، لانچر باید کاملاً بسته باشد.
3. پس از پیام موفقیت واردکردن تنظیمات، برنامه را اجرا کنید.

**توجه:** فایل Setup داخل ZIP با فایل مستقل Release نام یکسان دارد، اما باینری متفاوتی است. برای واردکردن تنظیمات این بسته، فقط از فایل `01-Installer\Launcher59-Setup-2.1.0-x64.exe` داخل همان ZIP استفاده کنید؛ فایل مستقل Release را جایگزین آن نکنید. مسیر برنامه‌ها در میانبرهای آماده ممکن است در رایانه مقصد نیاز به اصلاح داشته باشد.

SHA256 بسته ZIP: `f5b8abb2764c0afec07076984d7b1f4fec5b6b77fbeccd5ddc7be8430131eb95`

[فایل کنترل صحت بسته ZIP](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip.sha256.txt)

### اجرای بدون نصب

**`Launcher59-Portable-2.1.0-x64.exe`**

[دانلود Launcher59-Portable-2.1.0-x64.exe](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/Launcher59-Portable-2.1.0-x64.exe)

این فایل نصب‌کننده نیست؛ آن را مستقیماً اجرا کنید تا نسخه قابل‌حمل بدون نصب اجرا شود.

SHA256: `e7c8bddeb522edb8d7c9b9512364669161662806647af69f66aac04dd4d5e34b`

### فایل‌هایی که نباید اجرا شوند

- `SHA256SUMS.txt` و `LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip.sha256.txt` فقط فایل متنی کنترل صحت هستند و نصب‌کننده نیستند.
- لینک‌های `Source code (zip)` و `Source code (tar.gz)` کد منبع پروژه را دریافت می‌کنند و برای نصب کاربر عادی نیستند.

[مشاهده راهنمای کامل نصب با نام دقیق فایل‌ها](docs/INSTALLATION-GUIDE-2.1.0.md)

[مشاهده صفحه انتشار و همه فایل‌های v2.1.0 در GitHub](https://github.com/forog1980-star/Lanch59/releases/tag/v2.1.0)

---

## قابلیت‌های اصلی نسخه 2.1.0

- **گوی مرکزی شیشه‌ای ۵۹ و حلقه شعاعی برنامه‌ها:** طراحی دایره‌ای با هاله نوری آبی، حلقه پیوسته ۳۶۰ درجه و اجرای مستقیم فایل‌های `.exe`، میانبرهای ویندوز، پروتکل‌های سیستمی و وب‌سایت‌ها.
- **اندازه و چیدمان قابل تنظیم:** اندازه پیش‌فرض گوی بسته ۴۲ پیکسل است و می‌توان آن را بین ۳۶ تا ۱۲۸ پیکسل تنظیم کرد؛ اندازه آیکون‌ها و شعاع حلقه نیز مستقل قابل تنظیم است.
- **موقعیت‌یابی پویا ۹گانه و پایداری چندمانیتوره:** قرارگیری سریع در مرکز، لبه‌ها یا چهار گوشه صفحه، جابه‌جایی آزاد با Drag و تطبیق خودکار هنگام تغییر مانیتور یا رزولوشن.
- **بازشدن تطبیقی حلقه (Adaptive Radial Menu):** نزدیک لبه‌ها و گوشه‌ها، حلقه موقتاً به سمت فضای آزاد نمایشگر باز می‌شود تا آیکون‌ها و برچسب‌ها دیده شوند.
- **کاهش شفافیت خودکار در بیکاری (Smart Idle Auto-Fade):** تنظیم شفافیت و زمان انتظار، همراه با بیدارشدن فوری هنگام اشاره یا تعامل با ماوس.
- **کتابخانه مستقل و استخراج آیکون برنامه‌ها:** استخراج آیکون واقعی از فایل‌های اجرایی و میانبرهای ویندوز، پشتیبانی از برنامه‌های شناخته‌شده، بارگذاری آیکون دلخواه و بازگردانی آیکون اصلی.
- **پنل جامع شخصی‌سازی ظاهر:** هفت تم Fluent، پیش‌نمایش زنده، رنگ دلخواه، تنظیم اندازه‌ها، شفافیت شیشه، Blur، بازتاب و سایه.
- **ذخیره‌سازی کاملاً محلی و آفلاین:** تنظیمات و میانبرها در پروفایل محلی کاربر ویندوز (از جمله `%APPDATA%\launcher-59\`) ذخیره می‌شوند و برنامه به سرویس ابری وابستگی ندارد.
- **کنترل از System Tray:** دسترسی سریع به باز و بسته کردن حلقه، تنظیمات، حالت Always on Top و خروج کامل.

---

## نیازمندی‌های نصب و نکته امنیتی

- **سیستم‌عامل:** Windows 10 یا Windows 11 (معماری ۶۴ بیتی `x64`)
- **فضای دیسک موردنیاز:** حدود ۴۰۰ مگابایت برای نصب کامل
- **نکته امضای دیجیتال (Unsigned Build):** فایل‌های اجرایی این انتشار فاقد گواهی امضای دیجیتال تجاری (Code Signing) هستند. در صورت نمایش هشدار Windows SmartScreen، از مسیر **More info → Run anyway** اقدام کرده و پیش از اجرا، مقدار SHA256 فایل دانلودشده را با `SHA256SUMS.txt` مقایسه کنید.

---

# English

A lightweight, floating, circular glassmorphism launcher for Windows 10 and Windows 11 desktops.

- **Current version:** `2.1.0`
- **Desktop runtime:** Electron `45.3.4` (Windows x64)
- **Latest release:** [GitHub Releases](https://github.com/forog1980-star/Lanch59/releases/latest)

---

## Download for Windows (v2.1.0)

### For a normal installation, download and run this exact file

**`Launcher59-Setup-2.1.0-x64.exe`**

[Download Launcher59-Setup-2.1.0-x64.exe](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/Launcher59-Setup-2.1.0-x64.exe)

This is the standalone installer recommended for ordinary users. Run the downloaded EXE and follow the setup wizard. It installs the application for the current Windows user and does not require Administrator privileges.

SHA256: `9e025cc691069a257193d97e1dede3a78aae5087b95849ded0d834f191bf0e4a`

### Installation with preconfigured settings and shortcuts

To receive the starter settings, saved shortcuts, and configured icons, download:

**`LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip`**

[Download LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip)

After extracting the ZIP:
1. Install the bundled file at this exact relative path: `01-Installer\Launcher59-Setup-2.1.0-x64.exe`.
2. Before the first launch, run `Import-Launcher59-Configuration.ps1` from the root of the extracted package. LAUNCHER 59 must be fully closed while settings are imported.
3. Start the application after the import script reports success.

**Important:** The Setup file inside the ZIP has the same filename as the standalone Release installer, but it is a different binary. To import this package's configuration, use only `01-Installer\Launcher59-Setup-2.1.0-x64.exe` from inside the same ZIP. Do not replace it with the standalone Release installer. Some saved application paths may need to be adjusted on the recipient's PC.

ZIP SHA256: `f5b8abb2764c0afec07076984d7b1f4fec5b6b77fbeccd5ddc7be8430131eb95`

[Preconfigured ZIP checksum file](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip.sha256.txt)

### Run without installing

**`Launcher59-Portable-2.1.0-x64.exe`**

[Download Launcher59-Portable-2.1.0-x64.exe](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/Launcher59-Portable-2.1.0-x64.exe)

This is not an installer. Run the EXE directly to use the portable version without installing the application.

SHA256: `e7c8bddeb522edb8d7c9b9512364669161662806647af69f66aac04dd4d5e34b`

### Files that should not be run

- `SHA256SUMS.txt` and `LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip.sha256.txt` are text files used only to verify file integrity. They are not installers.
- `Source code (zip)` and `Source code (tar.gz)` contain project source code and are intended for developers, not ordinary installation.

[Read the complete installation guide with exact filenames](docs/INSTALLATION-GUIDE-2.1.0.md)

[View the v2.1.0 GitHub release and all assets](https://github.com/forog1980-star/Lanch59/releases/tag/v2.1.0)

---

## Key features in version 2.1.0

- **Glassmorphic 59 center orb and radial app ring:** A circular design with a blue glow, a continuous 360-degree ring, and direct launching of `.exe` files, Windows shortcuts, system protocols, and websites.
- **Adjustable size and layout:** The closed orb defaults to 42 px and can be resized from 36 to 128 px. App-icon size and ring radius can also be adjusted independently.
- **Nine-point positioning and multi-monitor resilience:** Quickly place the launcher at the center, edges, or any of the four corners; drag it freely and let it adapt when the monitor or resolution changes.
- **Adaptive Radial Menu:** Near screen edges and corners, the ring temporarily opens toward the available screen space so that icons and labels remain visible.
- **Smart Idle Auto-Fade:** Configure opacity and the idle delay, with immediate wake-up when the pointer moves over or interacts with the launcher.
- **App icon extraction and independent icon library:** Extract actual icons from Windows executables and shortcuts, use recognized app icons, upload custom icons, and restore an app's original icon.
- **Comprehensive appearance settings:** Seven Fluent themes, live preview, custom colors, size controls, glass transparency, blur, reflections, and shadows.
- **Fully local and offline storage:** Settings and shortcuts are stored in the current Windows user's local profile (including `%APPDATA%\launcher-59\`). The application does not depend on a cloud service.
- **System Tray controls:** Quickly open or close the radial menu, access settings, toggle Always on Top, or exit the application.

---

## Installation requirements and security note

- **Operating system:** Windows 10 or Windows 11 (64-bit `x64`)
- **Required disk space:** Approximately 400 MB for a complete installation
- **Digital-signature notice (unsigned build):** The executables in this release are not signed with a commercial code-signing certificate. If Windows SmartScreen displays a warning, select **More info → Run anyway** only after checking the downloaded file's SHA256 value against `SHA256SUMS.txt`.
