// Automatic FlutterFlow imports
import '/backend/schema/structs/index.dart';
import '/actions/actions.dart' as action_blocks;
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom action code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'dart:convert';
import 'package:file_picker/file_picker.dart';

Future<List<dynamic>> csvJson() async {
  final pick = await FilePicker.platform.pickFiles(
    type: FileType.custom,
    allowedExtensions: ['csv'],
    withData: true,
  );

  if (pick == null || pick.files.isEmpty) return [];

  final bytes = pick.files.first.bytes;
  if (bytes == null) return [];

  // Decode (UTF-8 com fallback para Latin1)
  String content;
  try {
    content = utf8.decode(bytes);
  } catch (_) {
    content = latin1.decode(bytes);
  }

  // Normaliza linhas
  final lines = content
      .replaceAll('\r\n', '\n')
      .replaceAll('\r', '\n')
      .split('\n')
      .where((l) => l.trim().isNotEmpty)
      .toList();

  if (lines.isEmpty) return [];

  // Detecta separador (',' ou ';') olhando só o header
  final headerLine = lines.first;
  final commaCount = ','.allMatches(headerLine).length;
  final semiCount = ';'.allMatches(headerLine).length;
  final dotCount = '.'.allMatches(headerLine).length;
  
  String sep = ',';
  if (semiCount > commaCount && semiCount > dotCount) {
    sep = ';';
  } else if (dotCount > commaCount && dotCount > semiCount) {
    sep = '.';
  }

  // Parser de CSV com suporte a aspas e separador variável
  List<String> parseCsvLine(String line, String separator) {
    final out = <String>[];
    final sb = StringBuffer();
    bool inQuotes = false;

    for (int i = 0; i < line.length; i++) {
      final c = line[i];

      if (c == '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] == '"') {
          sb.write('"');
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (c == separator && !inQuotes) {
        out.add(sb.toString().trim());
        sb.clear();
        continue;
      }

      sb.write(c);
    }
    out.add(sb.toString().trim());

    return out.map((v) {
      final t = v.trim();
      if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) {
        return t.substring(1, t.length - 1);
      }
      return t;
    }).toList();
  }

  // Lê cabeçalho original
  final headers = parseCsvLine(lines.first, sep);

  final List<Map<String, dynamic>> items = [];

  for (int i = 1; i < lines.length; i++) {
    final cols = parseCsvLine(lines[i], sep);

    // Ignora linha vazia ou com número de colunas diferente (opcional)
    if (cols.every((c) => c.isEmpty)) continue;

    final Map<String, dynamic> rowMap = {};
    for (int j = 0; j < headers.length; j++) {
      if (j < cols.length) {
        rowMap[headers[j]] = cols[j];
      } else {
        rowMap[headers[j]] = '';
      }
    }
    items.add(rowMap);
  }

  return items;
}
