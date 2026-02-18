
$path = 'c:\Users\resaa\Downloads\IndustryView\IndustryView\industryview-frontend\lib\flows\projeto\sprint\modal_add_tarefas_sprint02\modal_add_tarefas_sprint02_widget.dart'
$content = [System.IO.File]::ReadAllText($path)

# Fix common patterns in filters
$content = $content -replace '\(_model\.dropCampoValue\)\!(\.isNotEmpty)', '(_model.dropCampoValue?.isNotEmpty ?? false)'
$content = $content -replace '\(_model\.dropSecaoValue\)\!(\.isNotEmpty)', '(_model.dropSecaoValue?.isNotEmpty ?? false)'
$content = $content -replace '\(_model\.dropFileiraValue\)\!(\.isNotEmpty)', '(_model.dropFileiraValue?.isNotEmpty ?? false)'
$content = $content -replace '\(_model\.dropTrackerValue\)\!(\.isNotEmpty)', '(_model.dropTrackerValue?.isNotEmpty ?? false)'
$content = $content -replace '\(_model\.dropFileiraValue\)\!', '(_model.dropFileiraValue ?? [])'

# Fix line 862 and 887 (API return fields)
$content = $content -replace 'ProjectsGroup\.filtraOsCamposCall\s*\.sections\(\s*filtersFiltraOsCamposResponse\s*\.jsonBody,\s*\)\!', '(ProjectsGroup.filtraOsCamposCall.sections(filtersFiltraOsCamposResponse.jsonBody) ?? [])'
$content = $content -replace 'ProjectsGroup\.filtraOsCamposCall\s*\.sections\(\s*filtersFiltraOsCamposResponse\s*\.jsonBody\s*\)\!', '(ProjectsGroup.filtraOsCamposCall.sections(filtersFiltraOsCamposResponse.jsonBody) ?? [])'

[System.IO.File]::WriteAllText($path, $content)
Write-Host "Filters fix complete."
