# راهنمای ساخت محلی LAUNCHER 59 (نسخه 2.0.2) روی ویندوز

این راهنما مراحل دقیق ساخت دو فایل اجرایی نهایی (**Setup** و **Portable**) را مستقیماً روی کامپیوتر ویندوزی شما، پس از دانلود فایل ZIP پروژه از Google AI Studio شرح می‌دهد.

---

## ۱. پیش‌نیازها روی کامپیوتر ویندوزی
1. **سیستم‌عامل:** Windows 10 یا Windows 11 نسخه **64-bit (x64)**.
2. **Node.js و npm:** نصب نسخه **Node.js 22 LTS (x64)** (حداقل `v20.19+`) از [nodejs.org](https://nodejs.org/).
3. **اتصال اینترنت در اولین اجرا:** برای دریافت پکیج‌های npm، باینری `Electron 45.3.4` و ابزارهای داخلی `electron-builder 26.18.0` (شامل NSIS داخلی؛ نیازی به نصب جداگانه NSIS نیست).
4. **مجوز ایجاد Symbolic Link برای ثبت آیکون در EXE (توصیه مهم):**
   - ابزار `electron-builder` هنگام ثبت آیکون اختصاصی روی فایل‌های EXE، بسته داخلی `winCodeSign` را استخراج می‌کند.
   - برای جلوگیری از خطای `Cannot create symbolic link` در ویندوز، **یکی از این دو کار** را انجام دهید:
     - **روش پیشنهادی:** در تنظیمات ویندوز مسیر `Settings -> System -> For developers -> Developer Mode` را روشن کنید (در ویندوز ۱۰: `Settings -> Update & Security -> For developers`).
     - **یا:** پنجره PowerShell را با کلیک راست و گزینه **Run as administrator** باز کنید.
   - *توجه:* خود فایل نصبی نهایی (`Setup`) برای کاربر فعلی (`per-user`) تنظیم شده و هنگام نصب روی ویندوز **نیازی به دسترسی Administrator ندارد**.

---

## ۲. مراحل اجرا پس از دریافت ZIP از AI Studio
1. در Google AI Studio از گزینه **Export / Download ZIP** پروژه را دانلود کنید.
2. فایل ZIP را در یک مسیر ساده و کوتاه (بدون کاراکترهای خاص) استخراج کنید؛ مثلاً:
   ```text
   C:\Builds\Launcher59
   ```
3. در ریشه پوشه استخراج‌شده (جایی که فایل `BUILD-LAUNCHER59-WINDOWS.ps1` قرار دارد)، پنجره **Windows PowerShell** باز کنید.
4. دستور زیر را اجرا کنید:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\BUILD-LAUNCHER59-WINDOWS.ps1
   ```

---

## ۳. کارهایی که اسکریپت به‌صورت خودکار انجام می‌دهد (۱۲ مرحله)
1. بررسی ویندوز ۶۴بیتی و نسخه‌های `Node.js` و `npm`.
2. نصب وابستگی‌های ریشه (`npm ci --legacy-peer-deps`) با پشتیبانی کامل از باینری‌های `win32-x64`.
3. نصب وابستگی‌های دسکتاپ (`Electron 45.3.4` و `electron-builder 26.18.0`).
4. بررسی و تضمین وجود آیکون‌های اصلی `desktop/build/icon.png` و `desktop/build/icon.ico` از طریق `desktop/build/ensure-icons.mjs`.
5. اجرای بررسی تایپ‌ها (`npx tsc --noEmit`).
6. بررسی نحوی `desktop/electron/main.cjs` و `desktop/electron/preload.cjs`.
7. ساخت Renderer با `ELECTRON_BUILD=true` در مسیر `desktop/renderer`.
8. اجرای `electron-builder` با Targetهای داخلی `nsis` و `portable` برای معماری `x64` در یک اجرا.
9. بررسی وجود `LAUNCHER 59.exe` و `resources\app.asar` در خروجی `win-unpacked`.
10. بررسی وجود و غیرصفر بودن حجم هر دو فایل EXE نهایی.
11. محاسبه هش `SHA256` واقعی برای هر دو فایل.
12. کپی خروجی‌های نهایی و `SHA256SUMS.txt` در پوشه `release-out`.

در صورت بروز خطا در هر مرحله، اسکریپت فوراً متوقف می‌شود و نام مرحله و علت خطا را به‌صورت واضح نمایش می‌دهد.

---

## ۴. فایل‌های خروجی نهایی در پوشه `release-out`
پس از اتمام موفق، سه فایل زیر در پوشه `release-out` در ریشه پروژه آماده نصب و تست خواهند بود:

- `release-out\Launcher59-Setup-2.0.2-x64.exe`
  - نصب‌کننده استاندارد برای کاربر فعلی بدون نیاز به Administrator، دارای انتخاب مسیر نصب، میانبر Desktop، میانبر Start Menu، Uninstaller رسمی و آیکون اصلی LAUNCHER 59.
- `release-out\Launcher59-Portable-2.0.2-x64.exe`
  - فایل اجرایی تک‌فایلی قابل‌حمل بدون نیاز به نصب، با آیکون اصلی LAUNCHER 59.
- `release-out\SHA256SUMS.txt`
  - هش `SHA256` واقعی هر دو فایل برای راستی‌آزمایی.

---

## ۵. عیب‌یابی سریع
- **خطای `Cannot create symbolic link` در مرحله ۸:**
  1. کش ناقص قبلی را پاک کنید:
     ```powershell
     Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -ErrorAction SilentlyContinue
     ```
  2. حالت **Developer Mode** ویندوز را فعال کنید یا PowerShell را با **Run as administrator** باز کنید و اسکریپت را دوباره اجرا نمایید.
- **هشدار Windows SmartScreen هنگام اجرای فایل EXE:**
  - چون بیلد محلی فاقد گواهی امضای دیجیتال تجاری (Code Signing Certificate) است، در صورت نمایش پنجره SmartScreen گزینه **More info -> Run anyway** را انتخاب کنید.
- **راستی‌آزمایی دستی SHA256 در PowerShell:**
  ```powershell
  Get-FileHash -Algorithm SHA256 .\release-out\*.exe
  Get-Content .\release-out\SHA256SUMS.txt
  ```
