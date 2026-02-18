
$path = 'c:\Users\resaa\Downloads\IndustryView\IndustryView\industryview-frontend\lib\flows\projeto\sprint\modal_add_tarefas_sprint02\modal_add_tarefas_sprint02_widget.dart'
$content = [System.IO.File]::ReadAllText($path)

# Fix backslashed single quotes from previous script
$content = $content.Replace('\x27\x27\x27', "'''")

[System.IO.File]::WriteAllText($path, $content)
Write-Host "Cleanup complete."
