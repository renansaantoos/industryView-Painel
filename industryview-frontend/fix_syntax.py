
import os

file_path = r'c:\Users\resaa\Downloads\IndustryView\IndustryView\industryview-frontend\lib\flows\projeto\sprint\modal_add_tarefas_sprint02\modal_add_tarefas_sprint02_widget.dart'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix subtasks loops (replace ! and .length with safe access)
# The pattern is: getJsonField(...\n...\n...\n...\n)! .length;
# and: getJsonField(...\n...\n...\n)! [loop1Index];

import re

# 1. Loop length check
content = re.sub(
    r'getJsonField\(\s*listItemsItem,\s*r\'\'\'\$.subtasks\'\'\',\s*true,\s*\)!\s*\.length',
    r'((getJsonField(listItemsItem, r\'\'\'$.subtasks\'\'\', true) as List?)?.length ?? 0)',
    content
)

# 2. Loop index access
content = re.sub(
    r'getJsonField\(\s*listItemsItem,\s*r\'\'\'\$.subtasks\'\'\',\s*true,\s*\)!\[loop1Index\]',
    r'(getJsonField(listItemsItem, r\'\'\'$.subtasks\'\'\', true) as List?)?[loop1Index]',
    content
)

# 3. Another variant found in view_file (with different indentation/newlines)
# We use a broad regex for any getJsonField(... subtasks ...)!
content = re.sub(
    r'getJsonField\(\s*listItemsItem,\s*r\'\'\'\$.subtasks\'\'\',[^)]*\)!\s*\.length',
    r'((getJsonField(listItemsItem, r\'\'\'$.subtasks\'\'\', true) as List?)?.length ?? 0)',
    content
)

content = re.sub(
    r'getJsonField\(\s*listItemsItem,\s*r\'\'\'\$.subtasks\'\'\',[^)]*\)!\[loop1Index\]',
    r'(getJsonField(listItemsItem, r\'\'\'$.subtasks\'\'\', true) as List?)?[loop1Index]',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
