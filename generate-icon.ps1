Add-Type -AssemblyName System.Drawing

function Convert-PngToIco {
    param(
        [string]$PngPath,
        [string]$IcoPath
    )
    
    $srcImage = [System.Drawing.Image]::FromFile($PngPath)
    
    # ICO format: we'll embed 256x256, 48x48, 32x32, and 16x16 PNG frames
    $sizes = @(256, 48, 32, 16)
    $pngStreams = @()
    
    foreach ($size in $sizes) {
        $bmp = New-Object System.Drawing.Bitmap $size, $size
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.DrawImage($srcImage, 0, 0, $size, $size)
        $g.Dispose()
        
        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngStreams += ,@($size, $ms.ToArray())
        $ms.Dispose()
        $bmp.Dispose()
    }
    
    $srcImage.Dispose()
    
    # Write ICO file manually (proper multi-size format)
    $fs = New-Object System.IO.FileStream $IcoPath, ([System.IO.FileMode]::Create)
    $bw = New-Object System.IO.BinaryWriter $fs
    
    # ICO Header: reserved(2) + type(2) + count(2)
    $bw.Write([UInt16]0)       # Reserved
    $bw.Write([UInt16]1)       # Type: 1 = ICO
    $bw.Write([UInt16]$sizes.Count)  # Number of images
    
    # Calculate offset: header(6) + entries(16 each)
    $dataOffset = 6 + ($sizes.Count * 16)
    
    # Write directory entries
    foreach ($entry in $pngStreams) {
        $size = $entry[0]
        $data = $entry[1]
        
        $widthByte = if ($size -ge 256) { 0 } else { $size }
        $heightByte = if ($size -ge 256) { 0 } else { $size }
        
        $bw.Write([byte]$widthByte)     # Width (0 = 256)
        $bw.Write([byte]$heightByte)    # Height (0 = 256)
        $bw.Write([byte]0)              # Color palette
        $bw.Write([byte]0)              # Reserved
        $bw.Write([UInt16]1)            # Color planes
        $bw.Write([UInt16]32)           # Bits per pixel
        $bw.Write([UInt32]$data.Length) # Size of image data
        $bw.Write([UInt32]$dataOffset)  # Offset to image data
        
        $dataOffset += $data.Length
    }
    
    # Write image data
    foreach ($entry in $pngStreams) {
        $data = $entry[1]
        $bw.Write($data)
    }
    
    $bw.Close()
    $fs.Close()
}

$projectDir = $PSScriptRoot

# --- Web Version Icon (blue) ---
$webPng = Join-Path $projectDir "Icon\latex_web_icon.png"
$webIco = Join-Path $projectDir "assets\web-icon.ico"
Convert-PngToIco -PngPath $webPng -IcoPath $webIco
Copy-Item $webIco (Join-Path $projectDir "public\favicon.ico") -Force
Write-Host "Web icon created: $webIco (multi-size ICO)"

# --- Native Version Icon (green) ---
$nativePng = Join-Path $projectDir "Icon\latex_native_icon.png"
$nativeIco = Join-Path $projectDir "assets\native-icon.ico"
Convert-PngToIco -PngPath $nativePng -IcoPath $nativeIco
Write-Host "Native icon created: $nativeIco (multi-size ICO)"

# Show file sizes to confirm they're different
Write-Host ""
Write-Host "web-icon.ico size:" (Get-Item $webIco).Length "bytes"
Write-Host "native-icon.ico size:" (Get-Item $nativeIco).Length "bytes"
Write-Host "Done!"
