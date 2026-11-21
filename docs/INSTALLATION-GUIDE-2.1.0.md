# LAUNCHER 59 v2.1.0 — Installation Guide
# راهنمای انتخاب فایل و نصب لانچر ۵۹

This guide explains exactly which release file to download and how to install LAUNCHER 59 v2.1.0 on Windows 10 or Windows 11 (64-bit x64).

این راهنما مشخص می‌کند برای نصب LAUNCHER 59 نسخه ۲.۱.۰ کدام فایل باید دانلود شود و هرکدام از فایل‌های موجود در صفحه انتشار چه کاربردی دارند.

---

## 1. Which file should a normal user install?
## ۱. کاربر عادی باید کدام فایل را نصب کند؟

**Recommended for a normal installation — download and run this exact file:**

**نام دقیق فایل نصب برای کاربر عادی:**

`Launcher59-Setup-2.1.0-x64.exe`

[Download Launcher59-Setup-2.1.0-x64.exe](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/Launcher59-Setup-2.1.0-x64.exe)

This is the standalone Windows installer published as a v2.1.0 Release asset. Run the downloaded EXE and follow the setup wizard. It installs the app for the current Windows user; Administrator privileges are not required. It creates Start Menu and Desktop shortcuts and registers an uninstaller.

این همان نصب‌کننده مستقل ویندوز است که در بخش دارایی‌های انتشار نسخه ۲.۱.۰ قرار دارد. فایل را اجرا کنید و مراحل نصب را ادامه دهید. نصب برای کاربر فعلی ویندوز انجام می‌شود و به دسترسی Administrator نیاز ندارد؛ میانبرهای Start و Desktop و برنامه حذف نصب نیز ایجاد می‌شوند.

**SHA256:** `9e025cc691069a257193d97e1dede3a78aae5087b95849ded0d834f191bf0e4a`

---

## 2. If you want the preconfigured shortcuts and icons
## ۲. اگر می‌خواهید میانبرها و آیکون‌های از پیش تنظیم‌شده را هم دریافت کنید

Download this complete package:

`LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip`

[Download LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip)

Then follow these steps in order:

1. Extract `LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip` to a normal folder.
2. Install the Setup file located **inside the extracted package** at this exact relative path:
   `01-Installer\Launcher59-Setup-2.1.0-x64.exe`
3. Do not start LAUNCHER 59 yet. If the installer offers to launch the application when setup finishes, leave that option unchecked. If the application opens, close it completely.
4. From the root of the extracted package, run:
   `Import-Launcher59-Configuration.ps1`
5. When the script reports that configuration import has completed, start LAUNCHER 59.

این مراحل را به‌ترتیب انجام دهید:

1. فایل `LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip` را در یک پوشه معمولی استخراج کنید.
2. فایل Setup **داخل همان بسته استخراج‌شده** را از این مسیر اجرا و نصب کنید:
   `01-Installer\Launcher59-Setup-2.1.0-x64.exe`
3. هنوز لانچر را اجرا نکنید. اگر نصب‌کننده گزینه اجرای برنامه پس از نصب را نشان داد، آن گزینه را غیرفعال کنید. اگر برنامه باز شد، آن را کاملاً ببندید.
4. از ریشه پوشه استخراج‌شده، فایل زیر را اجرا کنید:
   `Import-Launcher59-Configuration.ps1`
5. پس از نمایش پیام پایان موفق واردکردن تنظیمات، LAUNCHER 59 را اجرا کنید.

**Important — the two Setup files have the same filename but are not the same binary.**

The standalone Release installer named `Launcher59-Setup-2.1.0-x64.exe` has SHA256:

`9e025cc691069a257193d97e1dede3a78aae5087b95849ded0d834f191bf0e4a`

The customized Setup included inside the preconfigured ZIP at `01-Installer\Launcher59-Setup-2.1.0-x64.exe` has SHA256:

`935c4284f5406cfdfc8e19369b4184b170dd0b23bcf966c0c404a8c6293e6fec`

Use the Setup **inside the ZIP** when importing the ZIP's configuration. Do not replace it with the standalone Release installer: the configuration-import script is designed for the profile used by the Setup bundled in that package.

**مهم — دو فایل Setup نام یکسان دارند، اما محتوای آن‌ها یکسان نیست.**

هش فایل مستقل Release با نام `Launcher59-Setup-2.1.0-x64.exe`:

`9e025cc691069a257193d97e1dede3a78aae5087b95849ded0d834f191bf0e4a`

هش فایل سفارشی داخل ZIP در مسیر `01-Installer\Launcher59-Setup-2.1.0-x64.exe`:

`935c4284f5406cfdfc8e19369b4184b170dd0b23bcf966c0c404a8c6293e6fec`

برای واردکردن تنظیمات همین ZIP، فقط از Setup داخل خود ZIP استفاده کنید. نصب‌کننده مستقل Release را جایگزین آن نکنید؛ اسکریپت انتقال تنظیمات برای پروفایل نصب‌کننده داخل بسته آماده تنظیم شده است.

The saved application paths and custom shortcuts reflect the computer on which the package was configured. On another PC, some application paths may need to be edited to match that PC's installed software.

مسیر نرم‌افزارها و میانبرهای ذخیره‌شده مطابق رایانه‌ای هستند که بسته روی آن پیکربندی شده است؛ بنابراین ممکن است در رایانه مقصد لازم باشد مسیر بعضی برنامه‌ها را متناسب با محل نصب همان رایانه اصلاح کنید.

**SHA256 of the complete preconfigured ZIP:**

`f5b8abb2764c0afec07076984d7b1f4fec5b6b77fbeccd5ddc7be8430131eb95`

[Preconfigured ZIP checksum file](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip.sha256.txt)

---

## 3. Portable version — runs without installation
## ۳. نسخه قابل‌حمل — بدون نصب اجرا می‌شود

`Launcher59-Portable-2.1.0-x64.exe`

[Download Launcher59-Portable-2.1.0-x64.exe](https://github.com/forog1980-star/Lanch59/releases/download/v2.1.0/Launcher59-Portable-2.1.0-x64.exe)

This is not the installer. Run the EXE directly when you want to use the portable version without installing it.

این فایل نصب‌کننده نیست. برای استفاده از نسخه قابل‌حمل، فایل EXE را مستقیماً اجرا کنید؛ نیازی به نصب برنامه ندارد.

**SHA256:** `e7c8bddeb522edb8d7c9b9512364669161662806647af69f66aac04dd4d5e34b`

---

## 4. Checksum files — do not run them
## ۴. فایل‌های کنترل صحت — این فایل‌ها اجرا نمی‌شوند

- `SHA256SUMS.txt`: contains the SHA256 checksums for the standalone Setup and Portable EXE files. It is a text file, not an installer.
- `LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip.sha256.txt`: contains the checksum for the preconfigured ZIP. It is also a text file, not an installer.

- فایل `SHA256SUMS.txt` هش‌های فایل‌های مستقل Setup و Portable را نگه می‌دارد؛ فایل متنی است و اجرا یا نصب نمی‌شود.
- فایل `LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip.sha256.txt` هش بسته ZIP آماده را نگه می‌دارد؛ این فایل نیز فقط برای کنترل صحت است.

---

## 5. Source code archives — for developers
## ۵. آرشیوهای کد منبع — مخصوص توسعه‌دهندگان

The GitHub **Source code (zip)** and **Source code (tar.gz)** links contain project source files. They are not ready-to-install application packages. A normal user should not download these to install LAUNCHER 59.

لینک‌های **Source code (zip)** و **Source code (tar.gz)** حاوی فایل‌های کد منبع پروژه هستند و بسته نصب آماده کاربر عادی نیستند. برای نصب لانچر، این دو فایل را دانلود نکنید.

---

## Quick answer
## پاسخ سریع

- **Normal installation:** `Launcher59-Setup-2.1.0-x64.exe`
- **Install with the bundled preconfigured shortcuts/icons:** extract `LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip`, install `01-Installer\Launcher59-Setup-2.1.0-x64.exe` from inside it, then run `Import-Launcher59-Configuration.ps1` before the first app launch.
- **Run without installation:** `Launcher59-Portable-2.1.0-x64.exe`

- **نصب معمولی:** `Launcher59-Setup-2.1.0-x64.exe`
- **نصب همراه تنظیمات و میانبرهای آماده:** فایل `LAUNCHER59-v2.1.0-Preconfigured-Windows-x64.zip` را استخراج کنید، فایل `01-Installer\Launcher59-Setup-2.1.0-x64.exe` داخل آن را نصب کنید و پیش از اولین اجرای برنامه، `Import-Launcher59-Configuration.ps1` را اجرا کنید.
- **اجرا بدون نصب:** `Launcher59-Portable-2.1.0-x64.exe`
