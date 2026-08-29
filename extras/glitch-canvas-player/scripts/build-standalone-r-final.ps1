param(
    [string]$RepoRoot = (Get-Location).Path,
    [string]$OutputDir = "extras\glitch-canvas-player\dist",
    [int]$TargetMaxMb = 75,
    [int]$HardFailMb = 100,
    [string]$SigningCertificateThumbprint = $env:SRF_SIGNING_CERT_THUMBPRINT,
    [string]$SigningCertificatePath = $env:SRF_SIGNING_CERT_PATH,
    [string]$SigningCertificatePassword = $env:SRF_SIGNING_CERT_PASSWORD,
    [string]$SignToolPath = $env:SRF_SIGNTOOL_PATH
)

$ErrorActionPreference = "Stop"

function Invoke-AuthenticodeSigning {
    param([Parameter(Mandatory = $true)][string]$FilePath)

    if (-not [string]::IsNullOrWhiteSpace($SigningCertificateThumbprint)) {
        $certificate = Get-ChildItem -Path "Cert:\CurrentUser\My\$SigningCertificateThumbprint" -ErrorAction SilentlyContinue
        if (-not $certificate -or -not $certificate.HasPrivateKey) {
            throw "Code-signing certificate not found in Cert:\CurrentUser\My: $SigningCertificateThumbprint"
        }

        $signature = Set-AuthenticodeSignature -FilePath $FilePath -Certificate $certificate -HashAlgorithm SHA256
        if ($signature.Status -ne "Valid") {
            throw "Certificate-store signing failed for ${FilePath}: $($signature.Status)"
        }
        Write-Host "Authenticode publisher verified: $($certificate.Subject)"
        return
    }

    if ([string]::IsNullOrWhiteSpace($SigningCertificatePath)) {
        Write-Host "Authenticode signing skipped: configure SRF_SIGNING_CERT_THUMBPRINT or SRF_SIGNING_CERT_PATH."
        return
    }

    if (-not (Test-Path $SigningCertificatePath)) {
        throw "Signing certificate not found: $SigningCertificatePath"
    }

    if ([string]::IsNullOrWhiteSpace($SignToolPath)) {
        $signTool = Get-Command signtool.exe -ErrorAction SilentlyContinue
        if ($signTool) {
            $SignToolPath = $signTool.Source
        }
    }

    if ([string]::IsNullOrWhiteSpace($SignToolPath) -or -not (Test-Path $SignToolPath)) {
        throw "signtool.exe is required to sign releases. Set SRF_SIGNTOOL_PATH to its full path."
    }

    $signArguments = @("sign", "/fd", "SHA256", "/tr", "http://timestamp.digicert.com", "/td", "SHA256", "/f", $SigningCertificatePath)
    if (-not [string]::IsNullOrWhiteSpace($SigningCertificatePassword)) {
        $signArguments += @("/p", $SigningCertificatePassword)
    }
    $signArguments += $FilePath
    & $SignToolPath @signArguments
    if ($LASTEXITCODE -ne 0) {
        throw "Authenticode signing failed for $FilePath."
    }

    $signature = Get-AuthenticodeSignature -FilePath $FilePath
    if ($signature.Status -ne "Valid") {
        throw "Signature verification failed for ${FilePath}: $($signature.Status)"
    }
    Write-Host "Authenticode publisher verified: $($signature.SignerCertificate.Subject)"
}

function Export-LocalPublisherCertificate {
    param([Parameter(Mandatory = $true)][string]$DestinationPath)

    if ([string]::IsNullOrWhiteSpace($SigningCertificateThumbprint)) {
        return
    }

    $certificate = Get-ChildItem -Path "Cert:\CurrentUser\My\$SigningCertificateThumbprint" -ErrorAction SilentlyContinue
    if (-not $certificate) {
        throw "Code-signing certificate not found in Cert:\CurrentUser\My: $SigningCertificateThumbprint"
    }
    Export-Certificate -Cert $certificate -FilePath $DestinationPath -Force | Out-Null
}

$webUiRoot = Join-Path $RepoRoot "extras\glitch-canvas-player\webui"
$webUiHtml = Join-Path $webUiRoot "glitch-canvas-youtube.html"
$rootHtml = Join-Path $RepoRoot "glitch-canvas-youtube.html"
$rootCss = Join-Path $RepoRoot "glitch-canvas-youtube.css"
$rootJs = Join-Path $RepoRoot "revision-r-final-engine.js"
$vSyncHtml = Join-Path $RepoRoot "glitch-canvas-v-sync.html"
$vSyncCss = Join-Path $RepoRoot "glitch-canvas-v-sync.css"
$useRootWebUiFallback = $false

if (-not (Test-Path $webUiHtml)) {
    if ((Test-Path $rootHtml) -and (Test-Path $rootCss) -and (Test-Path $rootJs) -and (Test-Path $vSyncHtml) -and (Test-Path $vSyncCss)) {
        $useRootWebUiFallback = $true
        Write-Host "webui folder not found; using repo-root web files as fallback."
    }
    else {
        throw "Missing web UI root: $webUiRoot"
    }
}

$resolvedOutputDir = Join-Path $RepoRoot $OutputDir
New-Item -ItemType Directory -Force -Path $resolvedOutputDir | Out-Null

$zipArtifactName = "standalone-revision-R-final-1.0-package.zip"
$zipArtifactPath = Join-Path $resolvedOutputDir $zipArtifactName
$exeArtifactName = "standalone-revision-R-final-1.0-installer.exe"
$exeArtifactPath = Join-Path $resolvedOutputDir $exeArtifactName

$stagingRoot = Join-Path $env:TEMP ("srf1_" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $stagingRoot | Out-Null
$installerPayloadPath = $null

try {
    $payloadRoot = Join-Path $stagingRoot "payload"
    New-Item -ItemType Directory -Force -Path $payloadRoot | Out-Null

    $shellProject = Join-Path $RepoRoot "shell\StandaloneRevisionRFinal.csproj"
    if (-not (Test-Path $shellProject)) {
        throw "Native shell project not found: $shellProject"
    }

    $payloadApp = Join-Path $payloadRoot "app"
    & dotnet publish $shellProject --configuration Release --runtime win-x64 --self-contained false --output $payloadApp
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path (Join-Path $payloadApp "StandaloneRevisionRFinal.exe"))) {
        throw "Native shell publish failed."
    }
    Invoke-AuthenticodeSigning -FilePath (Join-Path $payloadApp "StandaloneRevisionRFinal.exe")

    $payloadWebUi = Join-Path $payloadRoot "webui"
    New-Item -ItemType Directory -Force -Path $payloadWebUi | Out-Null

    if ($useRootWebUiFallback) {
        Copy-Item -Path $rootHtml -Destination (Join-Path $payloadWebUi "glitch-canvas-youtube.html") -Force
        Copy-Item -Path $rootCss -Destination (Join-Path $payloadWebUi "glitch-canvas-youtube.css") -Force
        Copy-Item -Path $rootJs -Destination (Join-Path $payloadWebUi "revision-r-final-engine.js") -Force
        Copy-Item -Path $vSyncHtml -Destination (Join-Path $payloadWebUi "glitch-canvas-v-sync.html") -Force
        Copy-Item -Path $vSyncCss -Destination (Join-Path $payloadWebUi "glitch-canvas-v-sync.css") -Force
    }
    else {
        Copy-Item -Path $webUiRoot -Destination $payloadWebUi -Recurse -Force
    }

    $authorsPath = Join-Path $RepoRoot "AUTHORS.TXT"
    if (Test-Path $authorsPath) {
        Copy-Item -Path $authorsPath -Destination (Join-Path $payloadRoot "AUTHORS.TXT") -Force
    }

    $manifest = @{
        name = "standalone revision-R final 1.0"
        publisherLegalName = "River Lyle Reuveni"
        publisherGitHub = "TheImortalimp"
        baseline = "r2"
        subtleLayers = @("r1", "r3", "r4")
        generatedAtUtc = [DateTime]::UtcNow.ToString("o")
        targetMaxMb = $TargetMaxMb
        hardFailMb = $HardFailMb
    } | ConvertTo-Json -Depth 4

    Set-Content -Path (Join-Path $payloadRoot "build-manifest.json") -Value $manifest -Encoding UTF8
    Export-LocalPublisherCertificate -DestinationPath (Join-Path $payloadRoot "publisher.cer")

    $launcherName = "Launch-Standalone-Revision-R-Final.cmd"
    $launcherLines = @(
        "@echo off",
        "setlocal",
        "set APP=%~dp0app\StandaloneRevisionRFinal.exe",
        'if not exist "%APP%" (',
        "  echo Application files are missing: %APP%",
        "  exit /b 1",
        ")",
        'start "" "%APP%"'
    )
    Set-Content -Path (Join-Path $payloadRoot $launcherName) -Value $launcherLines -Encoding ASCII

    $installScriptPath = Join-Path $payloadRoot "install.ps1"
    $installScript = @'
param(
        [string]$InstallRoot = (Join-Path ([Environment]::GetFolderPath("Desktop")) "standalone-revision-R-final-1.0")
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null

$sourceRoot = Split-Path -Parent $PSCommandPath
$files = @(
    "AUTHORS.TXT",
    "build-manifest.json",
    "Launch-Standalone-Revision-R-Final.cmd"
)

foreach ($file in $files) {
    $src = Join-Path $sourceRoot $file
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination (Join-Path $InstallRoot $file) -Force
    }
}

$webuiTarget = Join-Path $InstallRoot "webui"
New-Item -ItemType Directory -Force -Path $webuiTarget | Out-Null
Copy-Item -Path (Join-Path $sourceRoot "webui\*") -Destination $webuiTarget -Recurse -Force

$appTarget = Join-Path $InstallRoot "app"
New-Item -ItemType Directory -Force -Path $appTarget | Out-Null
Copy-Item -Path (Join-Path $sourceRoot "app\*") -Destination $appTarget -Recurse -Force

Write-Host "Installed to: $InstallRoot"
'@
    Set-Content -Path $installScriptPath -Value $installScript -Encoding UTF8

    Compress-Archive -Path (Join-Path $payloadRoot "*") -DestinationPath $zipArtifactPath -Force

    $zipSizeBytes = (Get-Item $zipArtifactPath).Length
    $zipSizeMb = [Math]::Round($zipSizeBytes / 1MB, 2)

    $installerProject = Join-Path $RepoRoot "installer\StandaloneRevisionRFinalInstaller.csproj"
    if (-not (Test-Path $installerProject)) {
        throw "Installer project not found: $installerProject"
    }

    $installerPayloadPath = Join-Path (Split-Path -Parent $installerProject) "payload.zip"
    Copy-Item -Path $zipArtifactPath -Destination $installerPayloadPath -Force

    $installerOutput = Join-Path $stagingRoot "installer"
    & dotnet publish $installerProject --configuration Release --output $installerOutput
    if ($LASTEXITCODE -ne 0) {
        throw "Installer publish failed with exit code $LASTEXITCODE."
    }

    $publishedInstaller = Join-Path $installerOutput "StandaloneRevisionRFinalInstaller.exe"
    if (-not (Test-Path $publishedInstaller)) {
        throw "Published installer EXE was not created: $publishedInstaller"
    }
    Copy-Item -Path $publishedInstaller -Destination $exeArtifactPath -Force
    Invoke-AuthenticodeSigning -FilePath $exeArtifactPath

    $exeSizeBytes = (Get-Item $exeArtifactPath).Length
    $exeSizeMb = [Math]::Round($exeSizeBytes / 1MB, 2)

    Write-Host "ZIP artifact: $zipArtifactPath"
    Write-Host "ZIP size: $zipSizeMb MB"
    Write-Host "EXE artifact: $exeArtifactPath"
    Write-Host "EXE size: $exeSizeMb MB"

    if ($zipSizeMb -gt $HardFailMb) {
        throw "ZIP package is $zipSizeMb MB, above hard fail limit of $HardFailMb MB."
    }

    if ($zipSizeMb -gt $TargetMaxMb) {
        throw "ZIP package is $zipSizeMb MB, above target limit of $TargetMaxMb MB."
    }

    if ($exeSizeMb -gt $HardFailMb) {
        throw "EXE package is $exeSizeMb MB, above hard fail limit of $HardFailMb MB."
    }

    if ($exeSizeMb -gt $TargetMaxMb) {
        throw "EXE package is $exeSizeMb MB, above target limit of $TargetMaxMb MB."
    }

    Write-Host "Build successful within cap ($TargetMaxMb MB) for ZIP and EXE."
}
finally {
    if ($installerPayloadPath -and (Test-Path $installerPayloadPath)) {
        Remove-Item -Path $installerPayloadPath -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path $stagingRoot) {
        Remove-Item -Path $stagingRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
