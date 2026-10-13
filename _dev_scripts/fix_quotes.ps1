$htmlFiles = Get-ChildItem -Filter *.html
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix dropped quotes for css
    $content = [regex]::Replace($content, 'href="css/([^"\s>]+) ', 'href="css/$1" ')
    $content = [regex]::Replace($content, 'href="css/([^"\s>]+)>', 'href="css/$1">')
    
    # Fix dropped quotes for js
    $content = [regex]::Replace($content, 'src="js/([^"\s>]+) ', 'src="js/$1" ')
    $content = [regex]::Replace($content, 'src="js/([^"\s>]+)>', 'src="js/$1">')
    
    # Fix dropped quotes for images
    $content = [regex]::Replace($content, 'src="images/([^"\s>]+) ', 'src="images/$1" ')
    $content = [regex]::Replace($content, 'src="images/([^"\s>]+)>', 'src="images/$1">')

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}
Write-Host "Fixed dropped quotes."
