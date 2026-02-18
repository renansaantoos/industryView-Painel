
$path = 'c:\Users\resaa\Downloads\IndustryView\IndustryView\industryview-frontend\lib\flows\projeto\sprint\modal_add_tarefas_sprint02\modal_add_tarefas_sprint02_widget.dart'
$content = [System.IO.File]::ReadAllText($path)

# Regex for loop length check
$pattern1 = 'getJsonField\s*\(\s*listItemsItem,\s*r\x27\x27\x27\$.subtasks\x27\x27\x27,\s*true,\s*\)!\s*\.length'
$replace1 = '((getJsonField(listItemsItem, r\x27\x27\x27$.subtasks\x27\x27\x27, true) as List?)?.length ?? 0)'
$content = [regex]::Replace($content, $pattern1, $replace1)

# Regex for loop index access
$pattern2 = 'getJsonField\s*\(\s*listItemsItem,\s*r\x27\x27\x27\$.subtasks\x27\x27\x27,\s*true,\s*\)!\[loop1Index\]'
$replace2 = '(getJsonField(listItemsItem, r\x27\x27\x27$.subtasks\x27\x27\x27, true) as List?)?[loop1Index]'
$content = [regex]::Replace($content, $pattern2, $replace2)

[System.IO.File]::WriteAllText($path, $content)
Write-Host "Replacement complete."
