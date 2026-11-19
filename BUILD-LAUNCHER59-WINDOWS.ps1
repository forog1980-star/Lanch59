<#
.SYNOPSIS
  Local Windows x64 build script for LAUNCHER 59 (Setup NSIS + Portable EXE).

.DESCRIPTION
  Runs all 12 verified steps from the project root using Electron 45.3.4 and
  electron-builder 26.18.0 internal NSIS & Portable targets, then outputs:
    - release-out\Launcher59-Setup-<version>-x64.exe
    - release-out\Launcher59-Portable-<version>-x64.exe
    - release-out\SHA256SUMS.txt

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\BUILD-LAUNCHER59-WINDOWS.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$CurrentStep = "0 - Initialization"

function Write-StepHeader {
    param(
        [int]$Number,
        [string]$Title
    )
    $script:CurrentStep = "Step $Number - $Title"
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "[$Number/12] $Title" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Invoke-CheckedCommand {
    param(
        [string]$CommandLabel,
        [scriptblock]$Action
    )
    $global:LASTEXITCODE = 0
    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code ${LASTEXITCODE}: $CommandLabel"
    }
}

function Test-WindowsAdmin {
    try {
        $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($identity)
        return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    } catch {
        return $false
    }
}

function Test-WindowsDeveloperMode {
    try {
        $regPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock"
        if (Test-Path $regPath) {
            $props = Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue
            if ($null -ne $props -and $props.AllowDevelopmentWithoutDevLicense -eq 1) {
                return $true
            }
        }
    } catch {
        return $false
    }
    return $false
}

Push-Location $ProjectRoot
try {
    # =========================================================================
    # STEP 1: Verify Windows OS, Node.js, and npm
    # =========================================================================
    Write-StepHeader -Number 1 -Title "Check Windows OS, Node.js, and npm"

    $isWinOs = ([System.Environment]::OSVersion.Platform -eq [System.PlatformID]::Win32NT)
    if (-not $isWinOs) {
        throw "This script must be executed on Windows (detected platform: $([System.Environment]::OSVersion.Platform))."
    }
    Write-Host "OS: $([System.Environment]::OSVersion.VersionString) (64-bit OS: $([System.Environment]::Is64BitOperatingSystem))"

    if (-not [System.Environment]::Is64BitOperatingSystem) {
        throw "64-bit Windows (x64) is required to build LAUNCHER 59 x64 packages."
    }

    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
    if ($null -eq $nodeCmd) {
        throw "Node.js is not installed or not in PATH. Install Node.js 22 LTS (x64) from https://nodejs.org/ and reopen PowerShell."
    }
    if ($null -eq $npmCmd) {
        throw "npm is not installed or not in PATH. Reinstall Node.js 22 LTS (x64)."
    }

    $nodeVersionRaw = (& node -v).Trim()
    $npmVersionRaw = (& npm -v).Trim()
    Write-Host "Node.js: $nodeVersionRaw ($($nodeCmd.Source))"
    Write-Host "npm:     v$npmVersionRaw ($($npmCmd.Source))"

    if ($nodeVersionRaw -match '^v(\d+)\.(\d+)\.(\d+)') {
        $nodeMajor = [int]$Matches[1]
        $nodeMinor = [int]$Matches[2]
        if ($nodeMajor -lt 20 -or ($nodeMajor -eq 20 -and $nodeMinor -lt 19)) {
            throw "Node.js v20.19+ (recommended: v22 LTS) is required. Detected: $nodeVersionRaw"
        }
    } else {
        throw "Could not parse Node.js version string: $nodeVersionRaw"
    }

    $desktopPkgPath = Join-Path $ProjectRoot "desktop\package.json"
    if (-not (Test-Path $desktopPkgPath)) {
        throw "Missing desktop\package.json. Run this script from the LAUNCHER 59 project root."
    }
    $desktopPkg = Get-Content -Path $desktopPkgPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $AppVersion = [string]$desktopPkg.version
    if ([string]::IsNullOrWhiteSpace($AppVersion)) {
        throw "Could not read application version from desktop\package.json."
    }
    Write-Host "Target Version: LAUNCHER 59 v$AppVersion"
    Write-Host "Electron: $($desktopPkg.devDependencies.electron) | electron-builder: $($desktopPkg.devDependencies.'electron-builder')"

    $isAdmin = Test-WindowsAdmin
    $isDevMode = Test-WindowsDeveloperMode
    if (-not $isAdmin -and -not $isDevMode) {
        Write-Host ""
        Write-Host "NOTE: Neither Administrator privileges nor Windows Developer Mode is enabled." -ForegroundColor Yellow
        Write-Host "      electron-builder extracts 'winCodeSign' to embed the custom LAUNCHER 59 icon." -ForegroundColor Yellow
        Write-Host "      If Step 8 fails with 'Cannot create symbolic link', enable Developer Mode in" -ForegroundColor Yellow
        Write-Host "      Windows Settings (System -> For developers) or run PowerShell as Administrator." -ForegroundColor Yellow
    }

    # =========================================================================
    # STEP 2: Install root dependencies
    # =========================================================================
    Write-StepHeader -Number 2 -Title "Install root dependencies (npm ci --legacy-peer-deps)"
    Invoke-CheckedCommand -CommandLabel "npm ci --legacy-peer-deps" -Action {
        & npm ci --legacy-peer-deps --no-audit --no-fund
    }

    # =========================================================================
    # STEP 3: Install desktop (Electron) dependencies
    # =========================================================================
    Write-StepHeader -Number 3 -Title "Install Electron dependencies (npm --prefix desktop ci --legacy-peer-deps)"
    Invoke-CheckedCommand -CommandLabel "npm --prefix desktop ci --legacy-peer-deps" -Action {
        & npm --prefix desktop ci --legacy-peer-deps --no-audit --no-fund
    }

    # =========================================================================
    # STEP 4: Ensure authentic PNG and ICO icons
    # =========================================================================
    Write-StepHeader -Number 4 -Title "Ensure authentic LAUNCHER 59 icons (PNG and ICO)"
    $ensureIconsScript = Join-Path $ProjectRoot "desktop\build\ensure-icons.mjs"
    if (-not (Test-Path $ensureIconsScript)) {
        throw "Missing icon script: $ensureIconsScript"
    }
    Invoke-CheckedCommand -CommandLabel "node desktop/build/ensure-icons.mjs" -Action {
        & node desktop/build/ensure-icons.mjs
    }

    $iconPng = Join-Path $ProjectRoot "desktop\build\icon.png"
    $iconIco = Join-Path $ProjectRoot "desktop\build\icon.ico"
    foreach ($iconFile in @($iconPng, $iconIco)) {
        if (-not (Test-Path $iconFile)) {
            throw "Required icon file is missing after ensure-icons.mjs: $iconFile"
        }
        $iconBytes = (Get-Item $iconFile).Length
        if ($iconBytes -le 0) {
            throw "Required icon file is empty (0 bytes): $iconFile"
        }
        Write-Host "Verified icon: $iconFile ($iconBytes bytes)"
    }

    # =========================================================================
    # STEP 5: TypeScript type-check
    # =========================================================================
    Write-StepHeader -Number 5 -Title "Run TypeScript check (npx tsc --noEmit)"
    Invoke-CheckedCommand -CommandLabel "npx tsc --noEmit" -Action {
        & npx tsc --noEmit
    }
    Write-Host "TypeScript check passed with 0 errors."

    # =========================================================================
    # STEP 6: Electron main & preload syntax checks
    # =========================================================================
    Write-StepHeader -Number 6 -Title "Verify Electron main.cjs and preload.cjs syntax"
    $mainCjs = Join-Path $ProjectRoot "desktop\electron\main.cjs"
    $preloadCjs = Join-Path $ProjectRoot "desktop\electron\preload.cjs"
    foreach ($jsFile in @($mainCjs, $preloadCjs)) {
        if (-not (Test-Path $jsFile)) {
            throw "Missing Electron script: $jsFile"
        }
        Invoke-CheckedCommand -CommandLabel "node --check $jsFile" -Action {
            & node --check $jsFile
        }
        Write-Host "Syntax OK: $jsFile"
    }

    # =========================================================================
    # STEP 7: Build Vite Renderer into desktop/renderer
    # =========================================================================
    Write-StepHeader -Number 7 -Title "Build Renderer bundle (ELECTRON_BUILD=true -> desktop/renderer)"
    $previousElectronBuild = $env:ELECTRON_BUILD
    try {
        $env:ELECTRON_BUILD = "true"
        Invoke-CheckedCommand -CommandLabel "npx vite build --outDir desktop/renderer --emptyOutDir" -Action {
            & npx vite build --outDir desktop/renderer --emptyOutDir
        }
    } finally {
        if ($null -eq $previousElectronBuild) {
            Remove-Item Env:ELECTRON_BUILD -ErrorAction SilentlyContinue
        } else {
            $env:ELECTRON_BUILD = $previousElectronBuild
        }
    }

    $rendererIndex = Join-Path $ProjectRoot "desktop\renderer\index.html"
    if (-not (Test-Path $rendererIndex)) {
        throw "Renderer build did not produce desktop\renderer\index.html"
    }
    Write-Host "Verified renderer bundle: $rendererIndex"

    # =========================================================================
    # STEP 8: Run electron-builder (internal NSIS + Portable, x64)
    # =========================================================================
    Write-StepHeader -Number 8 -Title "Package Windows x64 Setup (nsis) and Portable via electron-builder"
    $releaseDistDir = Join-Path $ProjectRoot "desktop\release-dist"
    if (Test-Path $releaseDistDir) {
        Write-Host "Cleaning previous desktop\release-dist directory..."
        Remove-Item -Path $releaseDistDir -Recurse -Force
    }

    $previousCscAuto = $env:CSC_IDENTITY_AUTO_DISCOVERY
    try {
        # Unsigned local build: skip Windows certificate store auto-discovery while keeping icon/resource editing active.
        $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
        Invoke-CheckedCommand -CommandLabel "npm --prefix desktop run dist:win" -Action {
            & npm --prefix desktop run dist:win
        }
    } finally {
        if ($null -eq $previousCscAuto) {
            Remove-Item Env:CSC_IDENTITY_AUTO_DISCOVERY -ErrorAction SilentlyContinue
        } else {
            $env:CSC_IDENTITY_AUTO_DISCOVERY = $previousCscAuto
        }
    }

    # =========================================================================
    # STEP 9: Verify unpacked Electron executable and app.asar
    # =========================================================================
    Write-StepHeader -Number 9 -Title "Verify unpacked Electron executable and app.asar"
    $unpackedExe = Join-Path $releaseDistDir "win-unpacked\LAUNCHER 59.exe"
    $unpackedAsar = Join-Path $releaseDistDir "win-unpacked\resources\app.asar"

    if (-not (Test-Path $unpackedExe)) {
        throw "Missing unpacked Electron executable: $unpackedExe"
    }
    if (-not (Test-Path $unpackedAsar)) {
        throw "Missing unpacked Electron app archive: $unpackedAsar"
    }
    $exeSize = (Get-Item $unpackedExe).Length
    $asarSize = (Get-Item $unpackedAsar).Length
    if ($exeSize -le 0 -or $asarSize -le 0) {
        throw "Unpacked Electron executable or app.asar has zero size (exe=$exeSize, asar=$asarSize)."
    }
    Write-Host "Verified executable: $unpackedExe ($exeSize bytes)"
    Write-Host "Verified app.asar:   $unpackedAsar ($asarSize bytes)"

    # =========================================================================
    # STEP 10: Locate and verify both final EXE outputs (Setup & Portable)
    # =========================================================================
    Write-StepHeader -Number 10 -Title "Verify both final EXE outputs (Setup and Portable)"

    $expectedSetupName = "Launcher59-Setup-$AppVersion-x64.exe"
    $expectedPortableName = "Launcher59-Portable-$AppVersion-x64.exe"

    $setupCandidate = Join-Path $releaseDistDir $expectedSetupName
    $portableCandidate = Join-Path $releaseDistDir $expectedPortableName

    $topLevelExes = @(Get-ChildItem -Path $releaseDistDir -Filter "*.exe" -File | Sort-Object Name)
    if ($topLevelExes.Count -lt 2) {
        $foundList = ($topLevelExes | ForEach-Object { $_.Name }) -join ", "
        throw "Expected at least 2 final .exe files in desktop\release-dist, found $($topLevelExes.Count): [$foundList]"
    }

    if (-not (Test-Path $setupCandidate)) {
        $matchedSetup = @($topLevelExes | Where-Object { $_.Name -match '(?i)(setup|installer)' })
        if ($matchedSetup.Count -eq 1) {
            $setupCandidate = $matchedSetup[0].FullName
            Write-Host "Detected Setup output under default name: $($matchedSetup[0].Name)"
        } else {
            throw "Could not unambiguously locate NSIS Setup installer in desktop\release-dist."
        }
    }

    if (-not (Test-Path $portableCandidate)) {
        $matchedPortable = @($topLevelExes | Where-Object {
            $_.FullName -ne $setupCandidate -and $_.Name -notmatch '(?i)^uninstall'
        })
        if ($matchedPortable.Count -eq 1) {
            $portableCandidate = $matchedPortable[0].FullName
            Write-Host "Detected Portable output under default name: $($matchedPortable[0].Name)"
        } else {
            throw "Could not unambiguously locate Portable executable in desktop\release-dist."
        }
    }

    $minValidExeBytes = 10485760 # 10 MB sanity floor for packaged Electron x64 app
    foreach ($labelAndPath in @(
        @{ Label = "Setup Installer"; Path = $setupCandidate },
        @{ Label = "Portable Executable"; Path = $portableCandidate }
    )) {
        if (-not (Test-Path $labelAndPath.Path)) {
            throw "$($labelAndPath.Label) not found: $($labelAndPath.Path)"
        }
        $bytes = (Get-Item $labelAndPath.Path).Length
        if ($bytes -lt $minValidExeBytes) {
            throw "$($labelAndPath.Label) is unexpectedly small ($bytes bytes): $($labelAndPath.Path)"
        }
        $mb = [Math]::Round($bytes / 1MB, 2)
        Write-Host "Verified $($labelAndPath.Label): $($labelAndPath.Path) ($bytes bytes / $mb MB)"
    }

    # =========================================================================
    # STEP 11 & STEP 12: Copy final EXEs to release-out & compute SHA256SUMS.txt
    # =========================================================================
    Write-StepHeader -Number 11 -Title "Compute real SHA256 checksums for Setup and Portable"
    $setupHash = (Get-FileHash -Algorithm SHA256 -Path $setupCandidate).Hash.ToLowerInvariant()
    $portableHash = (Get-FileHash -Algorithm SHA256 -Path $portableCandidate).Hash.ToLowerInvariant()
    Write-Host "SHA256 ($expectedSetupName):    $setupHash"
    Write-Host "SHA256 ($expectedPortableName): $portableHash"

    Write-StepHeader -Number 12 -Title "Copy final packages and SHA256SUMS.txt to release-out"
    $releaseOutDir = Join-Path $ProjectRoot "release-out"
    if (-not (Test-Path $releaseOutDir)) {
        New-Item -ItemType Directory -Path $releaseOutDir -Force | Out-Null
    }

    $finalSetupPath = Join-Path $releaseOutDir $expectedSetupName
    $finalPortablePath = Join-Path $releaseOutDir $expectedPortableName
    $finalSumsPath = Join-Path $releaseOutDir "SHA256SUMS.txt"

    Copy-Item -Path $setupCandidate -Destination $finalSetupPath -Force
    Copy-Item -Path $portableCandidate -Destination $finalPortablePath -Force

    # Verify copied files match original SHA256 hashes
    $copiedSetupHash = (Get-FileHash -Algorithm SHA256 -Path $finalSetupPath).Hash.ToLowerInvariant()
    $copiedPortableHash = (Get-FileHash -Algorithm SHA256 -Path $finalPortablePath).Hash.ToLowerInvariant()
    if ($copiedSetupHash -ne $setupHash -or $copiedPortableHash -ne $portableHash) {
        throw "SHA256 mismatch detected after copying final executables to release-out."
    }

    $sumsLines = @(
        "$copiedPortableHash  $expectedPortableName",
        "$copiedSetupHash  $expectedSetupName"
    )
    # Write clean ASCII / UTF-8 without BOM
    [System.IO.File]::WriteAllText($finalSumsPath, ($sumsLines -join "`r`n") + "`r`n", (New-Object System.Text.UTF8Encoding($false)))

    foreach ($outPath in @($finalSetupPath, $finalPortablePath, $finalSumsPath)) {
        if (-not (Test-Path $outPath) -or (Get-Item $outPath).Length -le 0) {
            throw "Expected final output missing or empty in release-out: $outPath"
        }
    }

    $finalSetupMB = [Math]::Round((Get-Item $finalSetupPath).Length / 1MB, 2)
    $finalPortableMB = [Math]::Round((Get-Item $finalPortablePath).Length / 1MB, 2)

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "BUILD SUCCEEDED - LAUNCHER 59 v$AppVersion (Windows x64)" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "Output directory: $releaseOutDir"
    Write-Host "  1. $expectedSetupName ($finalSetupMB MB)"
    Write-Host "     SHA256: $copiedSetupHash"
    Write-Host "  2. $expectedPortableName ($finalPortableMB MB)"
    Write-Host "     SHA256: $copiedPortableHash"
    Write-Host "  3. SHA256SUMS.txt"
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "BUILD FAILED at: $CurrentStep" -ForegroundColor Red
    Write-Host "Reason: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    if ($_.Exception.Message -match 'Cannot create symbolic link') {
        Write-Host "Tip: Delete '$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign', then either" -ForegroundColor Yellow
        Write-Host "     enable Windows Developer Mode or run PowerShell as Administrator and retry." -ForegroundColor Yellow
    }
    exit 1
} finally {
    Pop-Location
}
