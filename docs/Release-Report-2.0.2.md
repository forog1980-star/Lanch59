# گزارش انتشار LAUNCHER 59 — نسخه 2.0.2

## ۱. مشخصات نسخه
- **نام محصول:** LAUNCHER 59
- **نسخه برنامه:** `2.0.2`
- **شناسه برنامه (App ID):** `com.launcher59.desktop`
- **موتور دسکتاپ:** Electron `45.3.4` | بسته‌بندی: electron-builder `26.18.0` + NSIS `3.08`
- **سازنده / ناشر:** در انتظار تأیید کاربر (قابل ویرایش در `src/data/appMetadata.ts`)
- **ایمیل تماس:** `mahdyabbasy@yahoo.com`
- **سال انتشار:** `2026`

## ۲. ارتقاها و قابلیت‌های نسخه 2.0.2
1. **موقعیت‌یابی پویا ۹گانه، Drag آزاد و پایداری چندمانیتوره:**
   - پشتیبانی از ۹ نقطه استاندارد صفحه (`top-left`, `top`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom`, `bottom-right`) + جابه‌جایی آزاد با ماوس (`custom`) و دکمه «بازگردانی به مرکز».
   - ذخیره موقعیت نسبی (`displayId`, `relX`, `relY`) در `window-state.json` و تطبیق خودکار با رویدادهای `display-metrics-changed`، `display-added` و `display-removed`.
2. **کاهش شفافیت خودکار در بیکاری (Smart Idle Auto-Fade):**
   - پیاده‌سازی مستقل در `src/hooks/useIdleFade.ts` با قابلیت فعال/غیرفعال‌سازی و تنظیم شفافیت (`15%–85%`) و زمان انتظار (`2–30s`).
   - بیدارشدن فوری و نرم هنگام Hover، کلیک، Drag، Focus یا باز شدن حلقه و منوی تنظیمات، بدون از کار افتادن تعامل در حالت محو.
3. **بازشدن تطبیقی حلقه برنامه‌ها (Adaptive Radial Menu):**
   - پیاده‌سازی هندسی مستقل در `src/utils/radialPlacement.ts`.
   - هنگام باز شدن در لبه‌ها یا گوشه‌ها، حلقه به‌صورت موقت به سمت فضای آزاد داخل صفحه جابه‌جا می‌شود تا تمام آیکون‌ها، هاله و Tooltipها کاملاً قابل دید باشند و هنگام بسته‌شدن دقیقاً به موقعیت ذخیره‌شده قبلی بازگردد.
4. **بخش درباره برنامه (About / Metadata):**
   - افزوده‌شدن تب «درباره برنامه» در پنجره تنظیمات (`src/components/modals/RadialManagerModal.tsx`) با قرائت از `src/data/appMetadata.ts` بدون افزودن هیچ عنصر اضافه روی صفحه اصلی.

## ۳. بسته‌های اجرایی نسخه 2.0.2
- `Launcher-59-Release/v2.0.2/Setup/Launcher59-Setup-2.0.2-x64.exe`
  - **حجم:** `119,734,070` بایت
  - **SHA256:** `e5eb3451f94d09b4f497e7f877b33d5a495c1b8c780d4eccca75319fa2c939a1`
- `Launcher-59-Release/v2.0.2/Portable/Launcher59-Portable-2.0.2-x64.exe`
  - **حجم:** `160,146,810` بایت
  - **SHA256:** `fc00722601b27d6e3b6e5aec92703d1545eec6af773a52857f10a88f8c72d6db`

## ۴. حفظ نسخه‌های قبلی
- نسخه `2.0.0` در `Launcher-59-Release/Archive-v2.0.0/` و `Recovery-Points/v2.0.0-radial-backup/` بدون تغییر حفظ شد.
- نسخه `2.0.1` در `Launcher-59-Release/v2.0.1/` و `Recovery-Points/v2.0.1-radial-backup/` بدون تغییر حفظ شد.
- نسخه `1.x` در `Recovery-Points/v1-dashboard-backup/` بدون تغییر حفظ شد.
