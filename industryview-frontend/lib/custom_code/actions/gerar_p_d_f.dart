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

import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

Future gerarPDF(
  String? nome,
  String? telefone,
  String? email,
  String? cargo,
  String? tipoAcesso,
  String? nivelAcesso,
  String? qrcodeUrl,
) async {
  final pdf = pw.Document();

  final qrResponse = await http.get(Uri.parse(qrcodeUrl ?? ''));
  final Uint8List qrImageBytes = qrResponse.bodyBytes;

  final fillColor = PdfColor.fromHex('#fafafa');
  final borderColor = PdfColor.fromHex('#dadee6');
  final labelColor = PdfColor.fromHex('#2d323f');
  final radius = 12.0;
  final labelTextStyle = pw.TextStyle(
      fontSize: 12, color: labelColor, fontWeight: pw.FontWeight.bold);
  final valueTextStyle = pw.TextStyle(fontSize: 12, color: PdfColors.black);

  pdf.addPage(
    pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.all(24),
      build: (pw.Context context) {
        return pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.stretch,
          children: [
            campoFull(
              label: 'Nome',
              valor: nome ?? '',
              fillColor: fillColor,
              borderColor: borderColor,
              radius: radius,
              labelStyle: labelTextStyle,
              valueStyle: valueTextStyle,
            ),
            pw.SizedBox(height: 12),
            pw.Row(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Expanded(
                  child: campoFull(
                    label: 'Telefone',
                    valor: telefone ?? '',
                    fillColor: fillColor,
                    borderColor: borderColor,
                    radius: radius,
                    labelStyle: labelTextStyle,
                    valueStyle: valueTextStyle,
                  ),
                ),
                pw.SizedBox(width: 12),
                pw.Expanded(
                  child: campoFull(
                    label: 'Email',
                    valor: email ?? '',
                    fillColor: fillColor,
                    borderColor: borderColor,
                    radius: radius,
                    labelStyle: labelTextStyle,
                    valueStyle: valueTextStyle,
                  ),
                ),
              ],
            ),
            pw.SizedBox(height: 12),
            campoFull(
              label: 'Cargo',
              valor: cargo ?? '',
              fillColor: fillColor,
              borderColor: borderColor,
              radius: radius,
              labelStyle: labelTextStyle,
              valueStyle: valueTextStyle,
            ),
            pw.SizedBox(height: 12),
            pw.Row(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Expanded(
                  child: campoFull(
                    label: 'Tipo de Acesso',
                    valor: tipoAcesso ?? '',
                    fillColor: fillColor,
                    borderColor: borderColor,
                    radius: radius,
                    labelStyle: labelTextStyle,
                    valueStyle: valueTextStyle,
                  ),
                ),
                pw.SizedBox(width: 12),
                pw.Expanded(
                  child: campoFull(
                    label: 'Nível de Acesso',
                    valor: nivelAcesso ?? '',
                    fillColor: fillColor,
                    borderColor: borderColor,
                    radius: radius,
                    labelStyle: labelTextStyle,
                    valueStyle: valueTextStyle,
                  ),
                ),
              ],
            ),
            pw.SizedBox(height: 24),
            pw.Center(
              child: pw.Image(
                pw.MemoryImage(qrImageBytes),
                width: 120,
                height: 120,
              ),
            ),
          ],
        );
      },
    ),
  );

  await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save());
}

pw.Widget campoFull({
  required String label,
  required String valor,
  required PdfColor fillColor,
  required PdfColor borderColor,
  required double radius,
  required pw.TextStyle labelStyle,
  required pw.TextStyle valueStyle,
}) {
  return pw.Column(
    crossAxisAlignment: pw.CrossAxisAlignment.stretch,
    children: [
      pw.Text(label, style: labelStyle),
      pw.SizedBox(height: 4),
      pw.Container(
        padding: const pw.EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: pw.BoxDecoration(
          color: fillColor,
          borderRadius: pw.BorderRadius.circular(radius),
          border: pw.Border.all(color: borderColor, width: 1),
        ),
        child: pw.Text(valor, style: valueStyle),
      ),
    ],
  );
}
