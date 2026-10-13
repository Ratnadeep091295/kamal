$htmlFiles = Get-ChildItem -Filter *.html
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $content = [regex]::Replace($content, 'href="(?!http|css/|assets/|fonts/)([^"]+\.css[^"]*)"', 'href="css/$1')
    $content = [regex]::Replace($content, 'src="(?!http|js/|assets/|images/)([^"]+\.js[^"]*)"', 'src="js/$1')
    $content = [regex]::Replace($content, 'src="(?!http|images/|assets/)([^"]+\.jpg[^"]*)"', 'src="images/$1')
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

$cssFiles = Get-ChildItem -Path css -Filter *.css
foreach ($file in $cssFiles) {
    $content = Get-Content $file.FullName -Raw
    $content = [regex]::Replace($content, 'url\((["'']?)fonts/', 'url($1../fonts/')
    $content = [regex]::Replace($content, 'url\((["'']?)assets/', 'url($1../assets/')
    $content = [regex]::Replace($content, 'url\((["'']?)([^/]+)\.jpg', 'url($1../images/$2.jpg')
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "Updated HTML and CSS files successfully."
