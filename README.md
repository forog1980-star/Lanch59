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

**بسته آماده نصب همراه با تنظیمات نمونه و میانبرهای از پیش پیکربندی‌شده:**
- [دانلود بسته کامل LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip)
- [فایل کنترل صحت همین بسته (SHA256)](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip.sha256.txt)

برای استفاده از بسته آماده، ابتدا ZIP را استخراج کنید، فایل Setup داخل پوشه `01-Installer` را نصب کنید و پیش از اولین اجرای برنامه، اسکریپت `Import-Launcher59-Configuration.ps1` را از پوشه اصلی بسته اجرا کنید. لانچر باید هنگام واردکردن تنظیمات بسته باشد. میانبرها و مسیر برنامه‌ها مطابق رایانه‌ای هستند که بسته در آن پیکربندی شده‌اند؛ ممکن است در رایانه مقصد لازم باشد مسیر بعضی برنامه‌ها را اصلاح کنید.

**نصب‌کننده مستقل و نسخه قابل‌حمل:**
- **نسخه نصبی (Setup):** [دانلود Launcher59-Setup-2.1.0-x64.exe](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/Launcher59-Setup-2.1.0-x64.exe)
- **نسخه قابل‌حمل (Portable):** [دانلود Launcher59-Portable-2.1.0-x64.exe](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/Launcher59-Portable-2.1.0-x64.exe)
- **فایل بررسی اصالت (SHA256):** [دانلود SHA256SUMS.txt](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/SHA256SUMS.txt)
- **صفحه همه فایل‌های انتشار:** [مشاهده دارایی‌های انتشار v2.1.0 در GitHub](https://github.com/forog1980-star/Lanch59/releases/tag/v2.1.0)

### تفاوت نسخه Setup و Portable

- **Setup (`Launcher59-Setup-2.1.0-x64.exe`):** برنامه را برای کاربر فعلی ویندوز نصب می‌کند؛ به دسترسی Administrator نیاز ندارد، میانبر منوی Start و دسکتاپ می‌سازد و در بخش حذف برنامه‌های ویندوز (Uninstall) ثبت می‌شود.
- **Portable (`Launcher59-Portable-2.1.0-x64.exe`):** بدون نصب، مستقیماً اجرا می‌شود و برای آزمایش سریع یا اجرا از فلش و پوشه دلخواه مناسب است.

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

**Preconfigured package with a starter profile and saved shortcuts:**
- [Download the complete LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip package](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip)
- [Download this package's SHA256 checksum file](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip.sha256.txt)

To use the preconfigured package, extract the ZIP, install the Setup file in `01-Installer`, and—before launching the app for the first time—run `Import-Launcher59-Configuration.ps1` from the package's root folder. Keep LAUNCHER 59 closed while importing. The saved shortcuts and application paths reflect the computer on which this package was configured; some paths may need to be updated on another PC.

**Standalone installer and portable version:**
- **Setup installer:** [Download Launcher59-Setup-2.1.0-x64.exe](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/Launcher59-Setup-2.1.0-x64.exe)
- **Portable version:** [Download Launcher59-Portable-2.1.0-x64.exe](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/Launcher59-Portable-2.1.0-x64.exe)
- **File integrity checksums (SHA256):** [Download SHA256SUMS.txt](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/SHA256SUMS.txt)
- **All release assets:** [View the v2.1.0 GitHub release](https://github.com/forog1980-star/Lanch59/releases/tag/v2.1.0)

### Setup vs. Portable

- **Setup (`Launcher59-Setup-2.1.0-x64.exe`):** Installs the application for the current Windows user. Administrator privileges are not required. It creates Start Menu and Desktop shortcuts and registers an uninstaller in Windows.
- **Portable (`Launcher59-Portable-2.1.0-x64.exe`):** Runs directly without installation and is suitable for quick testing or running from a USB drive or a chosen folder.

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
