# مستند الزامات و وضعیت بسته‌بندی و ساخت — LAUNCHER 59 (نسخه 2.0.2)

این مستند وضعیت دقیق فایل‌ها، علت شکست اجراهای قبلی GitHub Actions و وضعیت نهایی آمادگی انتشار نسخه `2.0.2` در مخزن `https://github.com/forog1980-star/Lanch59` را ثبت می‌کند.

## علت شکست اجراهای قبلی در GitHub Actions
1. **اجرای `#44469074798` (`34baabb`):**
   - الگوی بدون اسلش `build/` در `.gitignore` کل پوشه `desktop/build/` را نادیده گرفته بود.
   - فایل `package-lock.json` ریشه (تولیدشده روی لینوکس) فاقد باینری‌های اختیاری `win32-x64` بود که باعث شکست Step 6 (`Build renderer bundle`) شد.
   - پلاگین `copy-unbundled-src-assets` در `vite.config.ts` به‌جای `outDir` واقعی، مسیر ثابت `dist` را استفاده می‌کرد.
2. **اجرای `#44477814191` (`925c0b4`):**
   - مراحل `npm ci`، تأمین باینری‌های Vite/Tailwind و `npm --prefix desktop ci` موفق شدند.
   - در Step 7 (`npx tsc --noEmit`)، نسخه TypeScript 7 (`7.0.2`) به باینری نیتیو `@typescript/typescript-win32-x64@7.0.2` نیاز داشت که در فهرست باینری‌های ویندوز اضافه نشده بود.
   - همچنین در Push رابط کاربری به GitHub، فایل‌های `desktop/build/icon.svg`، `setup.nsi` و `portable.nsi` ارسال شدند اما باینری‌های `icon.png` و `icon.ico` همگام‌سازی نشدند؛ بنابراین اسکریپت `desktop/build/ensure-icons.mjs` برای ساخت خودکار و دقیق `icon.png` (512×512) و `icon.ico` (۶ سایز) از روی آیکون وکتور اصلی `desktop/build/icon.svg` در زمان نبود آن‌ها اضافه و آزموده شد.

## وضعیت نهایی موارد کلیدی

| مورد بررسی | وضعیت در `34baabb` | وضعیت فعلی | توضیحات فنی |
|---|---|---|---|
| `desktop/build/icon.png` | مفقود و نیازمند تکمیل | تکمیل‌شده و آزموده‌شده | موجود در محیط کاری + تولید خودکار از `desktop/build/icon.svg` توسط `desktop/build/ensure-icons.mjs` در CI (تأییدشده: PNG 512×512 RGBA) |
| `desktop/build/icon.ico` | مفقود و نیازمند تکمیل | تکمیل‌شده و آزموده‌شده | موجود در محیط کاری + تولید خودکار ۶ سایز از `desktop/build/icon.svg` توسط `desktop/build/ensure-icons.mjs` در CI (تأییدشده: MS Windows icon resource - 6 icons) |
| `desktop/build/setup.nsi` | مفقود و نیازمند تکمیل | موجود و تأییدشده | ثبت‌شده در GitHub (`925c0b4`) با نسخه `2.0.2` |
| `desktop/build/portable.nsi` | مفقود و نیازمند تکمیل | موجود و تأییدشده | ثبت‌شده در GitHub (`925c0b4`) برای بسته پرتابل `2.0.2` |
| مسیرهای ساخت Renderer (`vite.config.ts`) | مفقود و نیازمند تکمیل | تکمیل‌شده و آزموده‌شده | اصلاح `configResolved` برای پیروی از `build.outDir`؛ آزموده‌شده با وجود `desktop/renderer/index.html` و `desktop/renderer/src/assets/images/` |
| فرایند تولید خروجی Setup و Portable | مفقود و نیازمند تکمیل | تکمیل‌شده (در انتظار اجرای نهایی `windows-latest`) | بسته‌بندی `Electron 45.3.4` (`pack:dir`) و بررسی `app.asar` در کانتینر با موفقیت آزموده شد؛ تولید نهایی `.exe` پس از Push روی `windows-latest` انجام می‌شود |
| Workflow انتشار GitHub Release (`.github/workflows/build-windows.yml`) | مفقود و نیازمند تکمیل | تکمیل‌شده (در انتظار Push و اجرای نهایی) | شامل تمام ۵ باینری `win32-x64` (از جمله `@typescript/typescript-win32-x64`)، `ensure-icons.mjs`، تولید Setup+Portable+SHA256، آپلود Artifact و انتشار غیرتخریبی خودکار تگ `v2.0.2` روی اولین Push بدون تداخل |
| `README.md` اصلی مخزن و راهنمای دانلود | مفقود و نیازمند تکمیل | موجود و تأییدشده | ثبت‌شده در GitHub (`925c0b4`) شامل معرفی، قابلیت‌ها، تفاوت Setup و Portable و لینک‌های مستقیم Release `v2.0.2` |
