import fs from 'node:fs';
import path from 'node:path';

const desktopPkgPath = path.resolve('desktop/package.json');
const sumsPath = path.resolve('release-out/SHA256SUMS.txt');
const outPath = path.resolve('release-out/RELEASE_NOTES.md');

const version = JSON.parse(fs.readFileSync(desktopPkgPath, 'utf8')).version;
const sums = fs.readFileSync(sumsPath, 'utf8').trim();

const body = [
  `## LAUNCHER 59 v${version} — انتشار رسمی دسکتاپ ویندوز (x64)`,
  '',
  '**LAUNCHER 59** یک لانچر دایره‌ای شناور، سبک و شیشه‌ای برای ویندوز ۱۰ و ۱۱ است.',
  '',
  `### قابلیت‌های کلیدی نسخه ${version}`,
  '- **موقعیت‌یابی پویا ۹گانه + جابه‌جایی آزاد (Drag) و پایداری چندمانیتوره** (مرکز، لبه‌ها و ۴ گوشه با تطبیق خودکار هنگام تغییر رزولوشن یا مانیتور)',
  '- **کاهش شفافیت خودکار در بیکاری (Smart Idle Auto-Fade)** با بیدارشدن فوری هنگام اشاره ماوس',
  '- **بازشدن تطبیقی حلقه برنامه‌ها (Adaptive Radial Menu)** برای دید کامل آیکون‌ها و برچسب‌ها در لبه‌ها و گوشه‌ها',
  '- **پشتیبانی کامل از System Tray، اجرای مستقیم برنامه‌ها و ذخیره محلی تنظیمات** (`%APPDATA%\\launcher-59\\`)',
  '- **بخش درباره برنامه (About)** در پنجره تنظیمات و ارتقای موتور به **Electron 45.3.4**',
  '',
  '### راهنمای نصب',
  `- **نسخه نصبی (\`Launcher59-Setup-${version}-x64.exe\`):** نصب استاندارد برای کاربر فعلی بدون نیاز به دسترسی Administrator، همراه با میانبر منوی Start، دسکتاپ و Uninstaller رسمی.`,
  `- **نسخه قابل‌حمل (\`Launcher59-Portable-${version}-x64.exe\`):** اجرای مستقیم بدون نصب؛ مناسب برای تست سریع یا اجرا از حافظه جانبی.`,
  '- **توجه امنیتی (Unsigned Build):** این نسخه فاقد گواهی امضای دیجیتال (Code Signing Certificate) است؛ در صورت نمایش هشدار Windows SmartScreen، از گزینه **More info -> Run anyway** استفاده کنید و صحت فایل را با SHA256 زیر تطبیق دهید.',
  '',
  '---',
  '',
  `## LAUNCHER 59 v${version} — Windows x64 Desktop Release`,
  '',
  'Minimal floating glassmorphic radial launcher for Windows 10 & Windows 11.',
  '',
  '### Highlights',
  '- 9-point quick positioning + free drag + multi-monitor work-area resilience',
  '- Configurable Smart Idle Auto-Fade with instant hover/click wake',
  '- Adaptive Radial Menu & edge-aware tooltips',
  '- Local offline persistence, System Tray controls, Electron 45.3.4 runtime',
  '',
  '### Packages',
  `- **Setup Installer (\`Launcher59-Setup-${version}-x64.exe\`)**: Per-user Windows installer with Start Menu, Desktop shortcut, and uninstaller.`,
  `- **Portable (\`Launcher59-Portable-${version}-x64.exe\`)**: Single self-extracting executable requiring no installation.`,
  '- **Note**: Unsigned build (no Authenticode certificate). Verify downloads against `SHA256SUMS.txt`.',
  '',
  '### SHA256 Checksums',
  '```text',
  sums,
  '```',
].join('\n');

fs.writeFileSync(outPath, `${body}\n`, 'utf8');
console.log(`Generated ${outPath} (${fs.statSync(outPath).size} bytes)`);
