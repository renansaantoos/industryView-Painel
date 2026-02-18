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
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:flutter/foundation.dart' show kIsWeb;

Future exportJsonToPdf(List<dynamic> jsonItem) async {
  try {
    if (jsonItem.isEmpty) {
      print('⚠️ Lista JSON vazia.');
      return;
    }

    final pdf = pw.Document();

    // Cabeçalhos (igual ao CSV)
    final headers = [
      'Código',
      'Produto',
      'Fabricante',
      'Categoria',
      'Especificações',
      'Qtd Estoque',
      'Qtd mínima',
      'Status',
    ];

    // Linhas da tabela
    final data = jsonItem.map((item) {
      final map = Map<String, dynamic>.from(item as Map);
      return [
        map['code'] ?? '',
        map['product'] ?? '',
        map['manufacturer'] ?? '',
        map['equipament'] ?? '',
        map['specifications'] ?? '',
        map['inventory_quantity']?.toString() ?? '',
        map['min_quantity']?.toString() ?? '',
        map['status'] ?? '',
      ];
    }).toList();

    // Página formatada
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4.landscape,
        margin: const pw.EdgeInsets.all(24),
        build: (context) => [
          pw.Center(
            child: pw.Text(
              'RELATÓRIO DE ESTOQUE',
              style: pw.TextStyle(
                fontSize: 18,
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.blueGrey900,
              ),
            ),
          ),
          pw.SizedBox(height: 16),
          pw.Table.fromTextArray(
            headers: headers,
            data: data,
            border: pw.TableBorder.all(width: 0.5, color: PdfColors.grey500),
            headerStyle: pw.TextStyle(
              fontWeight: pw.FontWeight.bold,
              color: PdfColors.white,
              fontSize: 11,
            ),
            headerDecoration: pw.BoxDecoration(
              color: PdfColors.blueGrey700,
            ),
            cellStyle: const pw.TextStyle(fontSize: 9),
            cellAlignment: pw.Alignment.centerLeft,
            columnWidths: {
              0: const pw.FixedColumnWidth(65), // Código
              1: const pw.FlexColumnWidth(2), // Produto
              2: const pw.FixedColumnWidth(80), // Fabricante
              3: const pw.FixedColumnWidth(80), // Categoria
              4: const pw.FlexColumnWidth(3), // Especificações
              5: const pw.FixedColumnWidth(70), // Qtd Estoque
              6: const pw.FixedColumnWidth(70), // Qtd mínima
              7: const pw.FixedColumnWidth(90), // Status
            },
          ),
          pw.SizedBox(height: 12),
          pw.Align(
            alignment: pw.Alignment.centerRight,
            child: pw.Text(
              'Gerado em: ${DateTime.now().day.toString().padLeft(2, '0')}/${DateTime.now().month.toString().padLeft(2, '0')}/${DateTime.now().year}',
              style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600),
            ),
          ),
        ],
      ),
    );

    // Gera e baixa o PDF
    final pdfBytes = await pdf.save();
    
    if (kIsWeb) {
      final blob = html.Blob([pdfBytes], 'application/pdf');
      final url = html.Url.createObjectUrlFromBlob(blob);
      final anchor = html.AnchorElement(href: url)
        ..setAttribute('download', 'Relatorio_Estoque.pdf')
        ..click();
      html.Url.revokeObjectUrl(url);
    } else {
       print('⚠️ Impressão direta PDF via navegador não suportada nesta plataforma.'); 
    }

    print('✅ PDF gerado com sucesso!');
  } catch (e) {
    print('❌ Erro ao gerar PDF: $e');
  }
}
