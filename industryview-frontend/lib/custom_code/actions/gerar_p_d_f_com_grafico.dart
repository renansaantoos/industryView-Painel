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

import 'dart:io';
import 'dart:math';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

Future<void> gerarPDFComGrafico(
  String projetoName,
  String data,
  List<dynamic> dados,
  String? imagePath,
) async {
  final pdf = pw.Document();

  final datas = <String>[];
  final previsto = <double>[];
  final executado = <double>[];

  for (int i = 0; i < dados.length; i++) {
    final item = dados[i];
    final qtdPrevista = (item['quantidade_prevista'] ?? 0).toDouble();
    final qtdAcumulada =
        (item['quantidade_executada_acumulada'] ?? 0).toDouble();

    final avanco = qtdPrevista > 0 ? (qtdAcumulada / qtdPrevista) * 100 : 0;

    // curva logística simulando curva S
    final t = i / max(1, (dados.length - 1));
    final curvaS = 100 / (1 + exp(-12 * (t - 0.5)));

    previsto.add(curvaS);
    executado.add(avanco);
    datas.add(DateTime.fromMillisecondsSinceEpoch((item['created_at'] ?? 0))
        .toString()
        .substring(0, 10));
  }

  pdf.addPage(
    pw.MultiPage(
      margin: const pw.EdgeInsets.all(16),
      pageFormat: PdfPageFormat.a4,
      build: (context) => [
        // Cabeçalho
        pw.Container(
          padding: const pw.EdgeInsets.symmetric(vertical: 8),
          child: pw.Row(
            crossAxisAlignment: pw.CrossAxisAlignment.center,
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              if (imagePath != null && imagePath.isNotEmpty)
                pw.Container(
                  height: 40,
                  child: pw.Image(
                    pw.MemoryImage(File(imagePath).readAsBytesSync()),
                    fit: pw.BoxFit.contain,
                  ),
                ),
              pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.center,
                children: [
                  pw.Text("INFORME DIÁRIO DE PRODUÇÃO",
                      style: pw.TextStyle(
                          fontSize: 16, fontWeight: pw.FontWeight.bold)),
                  pw.Text(projetoName.toUpperCase(),
                      style: pw.TextStyle(
                          fontSize: 12, fontWeight: pw.FontWeight.normal)),
                ],
              ),
              pw.Text(data,
                  style: pw.TextStyle(
                      fontSize: 12,
                      fontWeight: pw.FontWeight.bold,
                      color: PdfColors.blue)),
            ],
          ),
        ),
        pw.Divider(),

        // Tabela
        pw.TableHelper.fromTextArray(
          headers: [
            "ITEM",
            "DESCRIÇÃO",
            "QTDE EXEC. DIA",
            "QTDE EXEC. ACUM.",
            "QTDE PREVISTA TOTAL",
            "AVANÇO %",
            "DATA INÍCIO",
            "DATA CONCLUÍDO",
            "RENDIMENTO MÉDIO",
            "NOTA"
          ],
          headerDecoration: const pw.BoxDecoration(color: PdfColors.blue),
          headerStyle: pw.TextStyle(
              fontSize: 9,
              fontWeight: pw.FontWeight.bold,
              color: PdfColors.white),
          cellStyle: const pw.TextStyle(fontSize: 8),
          rowDecoration: pw.BoxDecoration(
            border: pw.Border.all(color: PdfColors.grey300, width: 0.5),
          ),
          oddRowDecoration: const pw.BoxDecoration(color: PdfColors.grey100),
          data: List.generate(dados.length, (i) {
            final item = dados[i];
            final qtdPrevista = (item['quantidade_prevista'] ?? 0).toDouble();
            final qtdDiaria =
                (item['quantidade_executada_diaria'] ?? 0).toDouble();
            final qtdAcumulada =
                (item['quantidade_executada_acumulada'] ?? 0).toDouble();
            final avanco =
                qtdPrevista > 0 ? (qtdAcumulada / qtdPrevista) * 100 : 0;

            return [
              "${i + 1}",
              item['description'] ?? "",
              qtdDiaria.toStringAsFixed(0),
              qtdAcumulada.toStringAsFixed(0),
              qtdPrevista.toStringAsFixed(0),
              "${avanco.toStringAsFixed(1)}%",
              DateTime.fromMillisecondsSinceEpoch((item['created_at'] ?? 0))
                  .toString()
                  .substring(0, 10),
              DateTime.fromMillisecondsSinceEpoch((item['updated_at'] ?? 0))
                  .toString()
                  .substring(0, 10),
              "",
              ""
            ];
          }),
        ),
        pw.SizedBox(height: 25),

        // Gráfico
        pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          children: [
            pw.Text("Curva S - $projetoName",
                style:
                    pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
            pw.Text("Data: $data",
                style: pw.TextStyle(
                    fontSize: 10,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColors.green)),
          ],
        ),
        pw.SizedBox(height: 10),
        pw.Container(
          height: 220,
          child: pw.Chart(
            grid: pw.CartesianGrid(
              xAxis: pw.FixedAxis.fromStrings(datas, marginStart: 20),
              yAxis: pw.FixedAxis([0, 20, 40, 60, 80, 100]),
            ),
            datasets: [
              pw.LineDataSet(
                legend: "Previsto",
                isCurved: true,
                drawSurface: true,
                color: PdfColors.blue,
                data: List.generate(previsto.length,
                    (i) => pw.PointChartValue(i.toDouble(), previsto[i])),
              ),
              pw.LineDataSet(
                legend: "Executado",
                isCurved: true,
                drawSurface: false,
                color: PdfColors.green,
                data: List.generate(executado.length,
                    (i) => pw.PointChartValue(i.toDouble(), executado[i])),
              ),
            ],
          ),
        ),
      ],
    ),
  );

  // 🔑 Abre o preview nativo
  await Printing.layoutPdf(
    onLayout: (format) async => pdf.save(),
    name: 'Relatorio_${projetoName}_$data.pdf',
  );
}
