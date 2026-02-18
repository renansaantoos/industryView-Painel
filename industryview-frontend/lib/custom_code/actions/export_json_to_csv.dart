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

import 'package:universal_html/html.dart' as html;
import 'package:flutter/foundation.dart' show kIsWeb;

Future exportJsonToCsv(List<dynamic> jsonItem) async {
  try {
    if (jsonItem.isEmpty) {
      print('⚠️ Lista JSON vazia.');
      return;
    }

    // Garante que o item é um Map
    if (jsonItem.first is! Map) {
      print('❌ Formato inválido, esperado List<Map<String, dynamic>>.');
      return;
    }

    // Cabeçalhos exatamente como você pediu
    const separator = ';'; // Excel PT-BR usa ; como separador
    final headers = <String>[
      'Código',
      'Produto',
      'Fabricante',
      'Categoria',
      'Especificações',
      'Qtd Estoque',
      'Qtd mínima',
      'Status',
    ];

    // Função para escapar texto em CSV
    String csvEscape(dynamic value) {
      final s = (value ?? '').toString();
      final cleaned = s
          .replaceAll('"', '""') // escapa aspas
          .replaceAll('\n', ' ')
          .replaceAll('\r', ' ');
      return '"$cleaned"';
    }

    final rows = <String>[];

    // Linha de cabeçalho
    rows.add(headers.map(csvEscape).join(separator));

    // Linhas de dados
    for (final raw in jsonItem) {
      final map = Map<String, dynamic>.from(raw as Map);

      final lineValues = <dynamic>[
        map['code'],
        map['product'],
        map['manufacturer'],
        map['equipament'],
        map['specifications'],
        map['inventory_quantity'],
        map['min_quantity'],
        map['status'],
      ];

      rows.add(lineValues.map(csvEscape).join(separator));
    }

    // Monta o conteúdo final
    final csvContent = rows.join('\n');

    // Adiciona BOM para Excel reconhecer UTF-8
    final contentWithBom = '\uFEFF$csvContent';

    if (kIsWeb) {
      // Cria o blob a partir da STRING (sem mexer com bytes)
      final blob = html.Blob([contentWithBom], 'text/csv;charset=utf-8');
      final url = html.Url.createObjectUrlFromBlob(blob);

      final anchor = html.AnchorElement(href: url)
        ..setAttribute('download', 'Relatorio_Estoque.csv')
        ..style.display = 'none';

      html.document.body?.append(anchor);
      anchor.click();
      anchor.remove();
      html.Url.revokeObjectUrl(url);
    } else {
        print('⚠️ Exportação direta para CSV via navegador não suportada nesta plataforma.');
    }

    print('✅ CSV gerado com sucesso.');
  } catch (e) {
    print('❌ Erro ao exportar CSV: $e');
  }
}
