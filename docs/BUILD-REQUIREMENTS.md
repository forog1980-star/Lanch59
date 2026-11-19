# مستند الزامات و وضعیت بسته‌بندی و ساخت — LAUNCHER 59 (نسخه 2.0.2)

این مستند وضعیت دقیق فایل‌ها، علت شکست اجراهای قبلی GitHub Actions و وضعیت نهایی آمادگی انتشار نسخه `2.0.2` در مخزن `https://github.com/forog1980-star/Lanch59` را ثبت می‌کند.

## علت شکست اجراهای قبلی در GitHub Actions
1. **اجرای `#44469074798` (`34baabb`):**
   - الگوی بدون اسلش `build/` در `.gitignore` کل پوشه `desktop/build/` را نادیده گرفته بود.
   - فایل `package-lock.json` ریشه (تولیدشده روی لینوکس) فاقد باینری‌های اختیاری `win32-x64` بود که باعث شکست Step 6 (`Build renderer bundle`) شد.
   - پلاگین `copy-unbundled-src-assets` در `vite.config.ts` به‌جای `outDir` واقعی، مسیر ثابت `dist` را استفاده می‌کرد.
2. **اجرای `#44477814191` (`925c0b4`):**
   - مراحل `npm ci`، تأمین باینری‌های Vite/Tailwind و `npm --prefix desktop ci` موفق شدند.
   - در Step 7 (`npx tsc --noEmit`)، نسخه TypeScript 7 (`7.0.2`) به باینری نیتیو `@typescript/typescript-win32-x64@7.0.2` نیاز داشت که در `package-lock.json` ثبت نشده بود.
   - همچنین در Push رابط کاربری به GitHub، فایل‌های متنی `desktop/build/icon.svg`، `setup.nsi` و `portable.nsi` ارسال شدند اما باینری‌های `icon.png` و `icon.ico` همگام‌سازی نشدند.
3. **اجرای `#44479351531` (`b4053ca`):**
   - مراحل نصب وابستگی‌ها موفق شدند اما در Step 7 (`ensure-icons.mjs`) اجرای `execFileSync('npm.cmd', ...)` در Node.js 22 روی ویندوز بدون Shell با خطا متوقف شد.
4. **اجرای `#44480420185` (`0e84f3c`):**
   - در Step 3 هنگام ایجاد خودکار تگ پشتیبان `backup-before-release-packaging-20261119` روی کامیت قدیمی‌تر `925c0b4` (که فایل Workflow را نیز تغییر داده بود)، `GITHUB_TOKEN` خطای `Resource not accessible by integration (403)` دریافت کرد و مانع اجرای مراحل ساخت شد.

## نقطه بازگشت ثبت‌شده (Recovery Point)
- **شناسه کامیت (Immutable Git SHA):** `925c0b4e2d740b81fb86a22f02a8fb4e82e7f297`
- **تاریخ ثبت در GitHub:** `2026-11-19T07:12:19Z`
- **آدرس مستقیم در تاریخچه مخزن:** `https://github.com/forog1980-star/Lanch59/commit/925c0b4e2d740b81fb86a22f02a8fb4e82e7f297`
- **وضعیت:** به‌صورت دائمی در تاریخچه Git محفوظ است و در هر زمان قابل بازگشت است. همچنین پشتیبان محلی فایل‌های کلیدی همراه با `SHA256SUMS.txt` در `source-archive/recovery-before-win-ci-fix-20261119/` ذخیره شده است.

## اصلاحات پایدار انجام‌شده (آماده اجرای مجدد Workflow)
1. **گام Recovery Point غیرمسدودکننده:**
   - تلاش خودکار برای ایجاد تگ `backup-before-release-packaging-20261119` در بلوک `try/catch` قرار گرفت تا در صورت محدودیت مجوز `GITHUB_TOKEN (403)`، به‌صورت صادقانه هشدار (`::warning::`) ثبت کند و مانع اجرای مراحل ساخت، بسته‌بندی NSIS و انتشار Release نشود.
2. **اصلاح پایدار و سازگار با `package-lock.json` برای ویندوز و لینوکس:**
   - هر ۶ وابستگی اختیاری نیتیو `win32-x64` با URL و هش `integrity` رسمی npm registry مستقیماً به `package-lock.json` اضافه شدند تا `npm ci --legacy-peer-deps` روی هر دو سیستم‌عامل `linux-x64` و `win32-x64` بدون خطا اجرا شود:
     - `@typescript/typescript-win32-x64@7.0.2`
     - `@rolldown/binding-win32-x64-msvc@1.2.19`
     - `@tailwindcss/oxide-win32-x64-msvc@4.3.5`
     - `lightningcss-win32-x64-msvc@1.33.0`
     - `@esbuild/win32-x64@0.25.12` و نسخه تودرتوی `tsx` (`@esbuild/win32-x64@0.28.2`)
3. **تضمین آیکون‌های اصلی بدون تغییر طراحی (`desktop/build/ensure-icons.mjs`):**
   - فایل‌های `desktop/build/icon.png` (512×512) و `desktop/build/icon.ico` (۷ سایز: 256/128/64/48/32/24/16) در محیط کاری موجودند و در صورت نبود در مخزن، اسکریپت `desktop/build/ensure-icons.mjs` آن‌ها را بدون تغییر در طراحی و به‌صورت ایزوله (در پوشه موقت سیستم با `execSync` سازگار با Node.js 22 ویندوز) از منبع اصلی `desktop/build/icon.svg` تولید می‌کند.

## وضعیت نهایی موارد کلیدی

| مورد بررسی | وضعیت در `34baabb` | وضعیت فعلی | توضیحات فنی |
|---|---|---|---|
| Recovery Point (`925c0b4e2d740b81fb86a22f02a8fb4e82e7f297`) | مفقود و نیازمند تکمیل | موجود و تأییدشده | در تاریخچه Git ثبت و مستند شد؛ گام تگ خودکار در CI به حالت غیرمسدودکننده با هشدار صادقانه تغییر یافت |
| وابستگی‌های نیتیو ویندوز (`package-lock.json`) | مفقود و نیازمند تکمیل | تکمیل‌شده و آزموده‌شده | تمام ۶ پکیج `win32-x64` با `integrity` رسمی در `package-lock.json` ثبت و با `npm ci` آزموده شدند |
| `desktop/build/icon.png` | مفقود و نیازمند تکمیل | تکمیل‌شده و آزموده‌شده | موجود در محیط کاری + تولید خودکار از `desktop/build/icon.svg` توسط `desktop/build/ensure-icons.mjs` (PNG 512×512 RGBA) |
| `desktop/build/icon.ico` | مفقود و نیازمند تکمیل | تکمیل‌شده و آزموده‌شده | موجود در محیط کاری + تولید خودکار ۷ سایز استاندارد از `desktop/build/icon.svg` (سازگار با NSIS و Windows Explorer) |
| `desktop/build/setup.nsi` و `desktop/build/portable.nsi` | مفقود و نیازمند تکمیل | موجود و تأییدشده | ثبت‌شده در GitHub (`925c0b4`) با نسخه `2.0.2` |
| مسیرهای ساخت Renderer (`vite.config.ts`) | مفقود و نیازمند تکمیل | تکمیل‌شده و آزموده‌شده | اصلاح `configResolved` برای پیروی از `build.outDir` |
| Workflow ساخت و انتشار (`.github/workflows/build-windows.yml`) | مفقود و نیازمند تکمیل | تکمیل‌شده (در انتظار Push و اجرای شماره ۵) | پس از ساخت واقعی Setup، Portable و SHA256SUMS، تگ و Release رسمی `v2.0.2` را منتشر و هر ۳ فایل را راستی‌آزمایی می‌کند |
| `README.md` اصلی مخزن و راهنمای دانلود | مفقود و نیازمند تکمیل | موجود و تأییدشده | ثبت‌شده در GitHub (`925c0b4`) شامل راهنما و لینک‌های Release `v2.0.2` |
