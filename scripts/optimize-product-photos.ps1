# Нормализует и сжимает фото товаров в public/products/.
# Правила:
#   - первый кадр: <N>.jpg  (входной <N>-1.jpg/.png/.webp станет N.jpg);
#   - доп. кадры:  <N>-2.jpg, <N>-3.jpg, <N>-4.jpg;
#   - PNG и WebP конвертируются в JPEG;
#   - ширина ограничена 1000 px, качество JPEG ~78.
# Запуск: pwsh scripts/optimize-product-photos.ps1

$ErrorActionPreference = 'Stop'
$dir = Join-Path (Split-Path $PSScriptRoot -Parent) 'public\products'
$tempRoot = Join-Path $env:TEMP 'dreamrig-photo-opt'

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$MAX_WIDTH = 1000
$QUALITY = 78
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
if (-not $codec) { throw 'JPEG codec not found' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality, [long]$QUALITY)

function Get-ImageKind {
  param([string]$path)
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $n = [math]::Min(12, $bytes.Length - 1)
  $head = -join ($bytes[0..$n] | ForEach-Object { $_.ToString('X2') })
  if ($head.StartsWith('FFD8FF')) { return 'jpeg' }
  if ($head.StartsWith('89504E47')) { return 'png' }
  if ($head.StartsWith('52494646') -and $head -match '57454250') { return 'webp' }
  return 'unknown'
}

function Convert-WebpToPng {
  param([string]$source, [string]$target)
  $stream = [System.IO.File]::OpenRead($source)
  try {
    $bmp = New-Object System.Windows.Media.Imaging.BitmapImage
    $bmp.BeginInit()
    $bmp.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
    $bmp.StreamSource = $stream
    $bmp.EndInit()
  } finally { $stream.Dispose() }
  $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bmp))
  $fs = [System.IO.File]::Create($target)
  try { $encoder.Save($fs) } finally { $fs.Dispose() }
}

function Optimize-ToJpeg {
  param([string]$source, [string]$target)
  $img = [System.Drawing.Image]::FromFile($source)
  try {
    $scale = 1.0
    if ($img.Width -gt $MAX_WIDTH) { $scale = $MAX_WIDTH / $img.Width }
    $w = [int][math]::Round($img.Width * $scale)
    $h = [int][math]::Round($img.Height * $scale)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    try {
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      try {
        $g.SmoothingMode = 'HighQuality'
        $g.InterpolationMode = 'HighQualityBicubic'
        $g.PixelOffsetMode = 'HighQuality'
        $g.Clear([System.Drawing.Color]::White)
        $g.DrawImage($img, 0, 0, $w, $h)
      } finally { $g.Dispose() }
      $bmp.Save($target, $codec, $encoderParams)
    } finally { $bmp.Dispose() }
  } finally { $img.Dispose() }
}

if (Test-Path $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
New-Item -ItemType Directory -Path $tempRoot | Out-Null

$files = Get-ChildItem -LiteralPath $dir -File | Where-Object { $_.Name -match '^(\d+)(?:-(\d+))?\.(jpe?g|png|webp)$' }
$byProduct = @{}
foreach ($file in $files) {
  if ($file.Name -match '^(\d+)(?:-(\d+))?\.(jpe?g|png|webp)$') {
    $n = [int]$Matches[1]
    $shot = if ($Matches[2]) { [int]$Matches[2] } else { 1 }
    if (-not $byProduct.ContainsKey($n)) { $byProduct[$n] = @() }
    $byProduct[$n] += [pscustomobject]@{ Path = $file.FullName; Shot = $shot }
  }
}

$tempOut = Join-Path $tempRoot 'out'
New-Item -ItemType Directory -Path $tempOut | Out-Null

$count = 0
foreach ($entry in ($byProduct.GetEnumerator() | Sort-Object { [int]$_.Key })) {
  $n = [int]$entry.Key
  $photos = @($entry.Value | Sort-Object Shot)
  $written = @()
  foreach ($photo in $photos) {
    $shotOut = if ($photo.Shot -le 1) { 1 } else { $photo.Shot }
    $outName = if ($shotOut -eq 1) { "$n.jpg" } else { "$n-$shotOut.jpg" }
    $outPath = Join-Path $tempOut $outName
    if ($outPath -in $written) { continue }
    $written += $outPath

    $kind = Get-ImageKind -path $photo.Path
    if ($kind -eq 'unknown') { throw "Неподдерживаемый формат: $($photo.Path)" }
    if ($kind -eq 'webp') {
      $pngTemp = Join-Path $tempRoot "$n-$shotOut.png"
      Convert-WebpToPng -source $photo.Path -target $pngTemp
      Optimize-ToJpeg -source $pngTemp -target $outPath
      Remove-Item -LiteralPath $pngTemp -Force
    } else {
      Optimize-ToJpeg -source $photo.Path -target $outPath
    }
    $count++
  }
}

# применение
Get-ChildItem -LiteralPath $dir -File | Where-Object { $_.Name -match '^(\d+)(?:-(\d+))?\.(jpe?g|png|webp)$' } | Remove-Item -Force
Get-ChildItem -LiteralPath $tempOut -File | Move-Item -Destination $dir -Force
Remove-Item -LiteralPath $tempRoot -Recurse -Force

Write-Output "Optimized files: $count"
Get-ChildItem -LiteralPath $dir -File | Sort-Object Name | Select-Object Name, @{n='KB';e={[math]::Round($_.Length/1KB,0)}} | Format-Table -AutoSize
