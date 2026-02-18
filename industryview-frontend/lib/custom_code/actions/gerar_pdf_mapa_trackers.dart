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

import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';

Future<void> gerarPdfMapaTrackers(
  List<dynamic> sectionJsonList,
  String projectName,
  String nomeCampo,
) async {
  final pdf = pw.Document();

  final solarIconUrl =
      'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/parque-solar-jeei7f/assets/j0ln9g7yuat9/Imagem_do_WhatsApp_de_2025-09-16_%C3%A0(s)_16.11.56_26af574d.jpg';
  final logoUrl =
      'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/parque-solar-jeei7f/assets/xhaa7b4nrfeu/IndustriView_(2).png';

  final pw.ImageProvider solarImageProvider = await networkImage(solarIconUrl);
  final pw.ImageProvider logoImageProvider = await networkImage(logoUrl);

  Map<String, dynamic> _getStatusData(int statusId) {
    if (statusId == 1) {
      return {
        'text': 'Aguardando estacas',
        'bg': PdfColor.fromInt(0xFFD7E6E6),
        'border': PdfColor.fromInt(0xFF76787D),
        'textColor': PdfColor.fromInt(0xFF76787D),
      };
    }
    if (statusId == 2) {
      return {
        'text': 'Problema, mas liberado para montagem',
        'bg': PdfColor.fromInt(0xFFFCF5EF),
        'border': PdfColor.fromInt(0xFFEB7039),
        'textColor': PdfColor.fromInt(0xFFEB7039),
      };
    }
    if (statusId == 3) {
      return {
        'text': 'Impedido para montagem',
        'bg': PdfColor.fromInt(0xFFFAE2E3),
        'border': PdfColor.fromInt(0xFFE65454),
        'textColor': PdfColor.fromInt(0xFFE65454),
      };
    }
    if (statusId == 4) {
      return {
        'text': 'Liberado para montagem',
        'bg': PdfColor.fromInt(0xFFF0F3FC),
        'border': PdfColor.fromInt(0xFF1D5CC6),
        'textColor': PdfColor.fromInt(0xFF1D5CC6),
      };
    }
    if (statusId == 5) {
      return {
        'text': 'Tracker e módulos instalados',
        'bg': PdfColor.fromInt(0xFFF4FEF9),
        'border': PdfColor.fromInt(0xFF028F58),
        'textColor': PdfColor.fromInt(0xFF028F58),
      };
    }
    return {
      'text': 'Aguardando estacas',
      'bg': PdfColor.fromInt(0xFFD7E6E6),
      'border': PdfColor.fromInt(0xFF76787D),
      'textColor': PdfColor.fromInt(0xFF76787D),
    };
  }

  Map<String, dynamic> _getStakeStyle(int stakesTypesId, int stakesStatusesId) {
    PdfColor color;
    PdfColor? borderColor;
    pw.BorderRadius borderRadius;
    borderRadius = pw.BorderRadius.circular(2);

    switch (stakesTypesId) {
      case 1:
        switch (stakesStatusesId) {
          case 1:
            color = PdfColor.fromHex('#76787d');
            break;
          case 2:
            color = PdfColor.fromHex('#1d5cc6');
            break;
          case 3:
            color = PdfColor.fromHex('#eb7039');
            break;
          case 4:
            color = PdfColor.fromHex('#e65454');
            break;
          case 5:
            color = PdfColor.fromHex('#028f58');
            break;
          default:
            color = PdfColor.fromHex('#76787d');
        }
        borderColor = color;
        break;
      case 2:
        switch (stakesStatusesId) {
          case 1:
            color = PdfColor.fromHex('#dadee6');
            borderColor = PdfColor.fromHex('#76787d');
            break;
          case 2:
            color = PdfColor.fromHex('#f0f3fc');
            borderColor = PdfColor.fromHex('#1d5cc6');
            break;
          case 3:
            color = PdfColor.fromHex('#fcf5ef');
            borderColor = PdfColor.fromHex('#eb7039');
            break;
          case 4:
            color = PdfColor.fromHex('#fae2e3');
            borderColor = PdfColor.fromHex('#e65454');
            break;
          case 5:
            color = PdfColor.fromHex('#f4fef9');
            borderColor = PdfColor.fromHex('#028f58');
            break;
          default:
            color = PdfColor.fromHex('#76787d');
            borderColor = PdfColor.fromHex('#76787d');
        }
        break;
      case 3:
        switch (stakesStatusesId) {
          case 1:
            color = PdfColor.fromHex('#dadee6');
            break;
          case 2:
            color = PdfColor.fromHex('#f0f3fc');
            break;
          case 3:
            color = PdfColor.fromHex('#fcf5ef');
            break;
          case 4:
            color = PdfColor.fromHex('#fae2e3');
            break;
          case 5:
            color = PdfColor.fromHex('#f4fef9');
            break;
          default:
            color = PdfColor.fromHex('#76787d');
        }
        borderColor = PdfColors.grey400;
        break;
      case 4:
        borderRadius = pw.BorderRadius.circular(6);
        switch (stakesStatusesId) {
          case 1:
            color = PdfColor.fromHex('#dadee6');
            break;
          case 2:
            color = PdfColor.fromHex('#f0f3fc');
            break;
          case 3:
            color = PdfColor.fromHex('#fcf5ef');
            break;
          case 4:
            color = PdfColor.fromHex('#fae2e3');
            break;
          case 5:
            color = PdfColor.fromHex('#f4fef9');
            break;
          default:
            color = PdfColor.fromHex('#76787d');
        }
        borderColor = PdfColors.grey400;
        break;
      case 5:
        borderRadius = pw.BorderRadius.circular(6);
        switch (stakesStatusesId) {
          case 1:
            color = PdfColor.fromHex('#dadee6');
            borderColor = PdfColor.fromHex('#76787d');
            break;
          case 2:
            color = PdfColor.fromHex('#f0f3fc');
            borderColor = PdfColor.fromHex('#1d5cc6');
            break;
          case 3:
            color = PdfColor.fromHex('#fcf5ef');
            borderColor = PdfColor.fromHex('#eb7039');
            break;
          case 4:
            color = PdfColor.fromHex('#fae2e3');
            borderColor = PdfColor.fromHex('#e65454');
            break;
          case 5:
            color = PdfColor.fromHex('#f4fef9');
            borderColor = PdfColor.fromHex('#028f58');
            break;
          default:
            color = PdfColor.fromHex('#76787d');
            borderColor = PdfColor.fromHex('#76787d');
        }
        break;
      case 6:
        borderRadius = pw.BorderRadius.circular(6);
        switch (stakesStatusesId) {
          case 1:
            color = PdfColor.fromHex('#76787d');
            break;
          case 2:
            color = PdfColor.fromHex('#1d5cc6');
            break;
          case 3:
            color = PdfColor.fromHex('#eb7039');
            break;
          case 4:
            color = PdfColor.fromHex('#e65454');
            break;
          case 5:
            color = PdfColor.fromHex('#028f58');
            break;
          default:
            color = PdfColor.fromHex('#76787d');
        }
        borderColor = null;
        break;
      default:
        color = PdfColor.fromHex('#76787d');
        borderColor = PdfColor.fromHex('#76787d');
        borderRadius = pw.BorderRadius.circular(2);
    }
    return {
      'color': color,
      'borderColor': borderColor,
      'borderRadius': borderRadius,
    };
  }

  final String formattedDate =
      DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now());

  pdf.addPage(
    pw.MultiPage(
      pageFormat: PdfPageFormat.a4.landscape,
      margin: const pw.EdgeInsets.all(20),
      build: (context) {
        return [
          pw.Center(
            child: pw.Image(logoImageProvider, width: 150),
          ),
          pw.SizedBox(height: 30),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Row(
                crossAxisAlignment: pw.CrossAxisAlignment.center,
                children: [
                  pw.Image(solarImageProvider, width: 24, height: 24),
                  pw.SizedBox(width: 8),
                  pw.Text(
                    'Mapa de Trackers',
                    style: pw.TextStyle(
                        fontSize: 20, fontWeight: pw.FontWeight.bold),
                  ),
                ],
              ),
              pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.end,
                children: [
                  pw.Text(
                    'Projeto: $projectName',
                    style: pw.TextStyle(fontSize: 10),
                  ),
                  pw.SizedBox(height: 4),
                  pw.Text(
                    'Data: $formattedDate',
                    style: pw.TextStyle(fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
          pw.SizedBox(height: 8),
          pw.Divider(color: PdfColor.fromHex('#dadee6')),
          pw.SizedBox(height: 8),
          pw.Text(
            'Nome do campo: $nomeCampo',
            style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold),
          ),
          pw.SizedBox(height: 16),
          ...sectionJsonList.map<pw.Widget>((section) {
            final rows = List.from(section['rows_of_sections'] ?? []);
            final isLastSection = section == sectionJsonList.last;

            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(
                  'Seção: ${section['section_number'] ?? 'N/A'}',
                  style: pw.TextStyle(
                      fontSize: 16, fontWeight: pw.FontWeight.bold),
                ),
                pw.SizedBox(height: 8),
                ...rows.map<pw.Widget>((row) {
                  final trackers = List.from(row['list_row_tracker'] ?? [])
                      .where((t) =>
                          t['deleted_at'] == null || t['deleted_at'] == 0)
                      .toList();

                  return pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        'Fileira: ${row['row_number'] ?? 'N/A'}',
                        style: pw.TextStyle(
                            fontSize: 14, fontWeight: pw.FontWeight.bold),
                      ),
                      pw.SizedBox(height: 8),
                      trackers.isEmpty
                          ? pw.Text('Nenhum tracker configurado',
                              style: pw.TextStyle(
                                  color: PdfColors.grey600, fontSize: 10))
                          : pw.Wrap(
                              spacing: 8,
                              runSpacing: 12,
                              children: trackers.map<pw.Widget>((tracker) {
                                final trackerType = tracker['trackers']
                                        ?['trackers_types']?['type'] ??
                                    'N/A';
                                final manufacturer = tracker['trackers']
                                        ?['manufacturers']?['name'] ??
                                    'N/A';
                                final List stakes =
                                    tracker['list_trackers_stakes'] ?? [];
                                final bool hasStakes = stakes.any((stake) =>
                                    stake['stakes'] != null &&
                                    stake['stakes']['position'] != null &&
                                    stake['stakes']['position']
                                        .toString()
                                        .isNotEmpty);
                                final trackerPos = tracker['position'] ?? 'N/A';
                                final statusId =
                                    tracker['rows_trackers_statuses_id'] ?? 0;
                                final statusData = _getStatusData(statusId);

                                return pw.Container(
                                  width: 250,
                                  decoration: pw.BoxDecoration(
                                    color: PdfColor.fromHex('#FAFAFA'),
                                    border: pw.Border.all(
                                        color: PdfColor.fromInt(0xFFDADEE6)),
                                    borderRadius: pw.BorderRadius.circular(8),
                                  ),
                                  padding: pw.EdgeInsets.all(12),
                                  child: pw.Column(
                                    mainAxisAlignment:
                                        pw.MainAxisAlignment.start,
                                    crossAxisAlignment:
                                        pw.CrossAxisAlignment.start,
                                    children: [
                                      pw.Row(
                                        crossAxisAlignment:
                                            pw.CrossAxisAlignment.center,
                                        children: [
                                          pw.Container(
                                            width: 16,
                                            height: 16,
                                            decoration: pw.BoxDecoration(
                                              color:
                                                  PdfColor.fromInt(0xFFFFFFFF),
                                              border: pw.Border.all(
                                                  color: PdfColor.fromInt(
                                                      0xFFDADEE6)),
                                              borderRadius:
                                                  pw.BorderRadius.circular(8),
                                            ),
                                            child: pw.Center(
                                              child: pw.Text(
                                                trackerPos,
                                                style: pw.TextStyle(
                                                    fontSize: 8,
                                                    fontWeight:
                                                        pw.FontWeight.bold),
                                              ),
                                            ),
                                          ),
                                          pw.SizedBox(width: 4),
                                          pw.Text(
                                            '$trackerType | $manufacturer',
                                            style: pw.TextStyle(fontSize: 7),
                                            maxLines: 1,
                                            overflow: pw.TextOverflow.clip,
                                          ),
                                          pw.SizedBox(width: 8),
                                          pw.Container(
                                            padding: pw.EdgeInsets.symmetric(
                                                horizontal: 6, vertical: 3),
                                            decoration: pw.BoxDecoration(
                                              color: statusData['bg'],
                                              border: pw.Border.all(
                                                  color: statusData['border']!),
                                              borderRadius:
                                                  pw.BorderRadius.circular(6),
                                            ),
                                            child: pw.Text(
                                              statusData['text'],
                                              style: pw.TextStyle(
                                                  fontSize: 6,
                                                  color:
                                                      statusData['textColor']),
                                            ),
                                          ),
                                        ],
                                      ),
                                      pw.SizedBox(height: 6),
                                      if (hasStakes)
                                        pw.Wrap(
                                          spacing: 4,
                                          children: stakes
                                              .where((stake) =>
                                                  (stake['stakes']
                                                          ?['position'] !=
                                                      null) &&
                                                  (stake['stakes']['position']
                                                      .toString()
                                                      .isNotEmpty))
                                              .map<pw.Widget>((stake) {
                                            final stakeTypeId = stake['stakes']
                                                    ?['stakes_types_id'] ??
                                                0;
                                            final stakeStatusId =
                                                stake['stakes_statuses_id'] ??
                                                    0;
                                            final stakePos = stake['stakes']
                                                    ?['position'] ??
                                                '';
                                            final stakeStyle = _getStakeStyle(
                                                stakeTypeId, stakeStatusId);

                                            return pw.Column(
                                              children: [
                                                pw.Container(
                                                  width: 12,
                                                  height: 12,
                                                  decoration: pw.BoxDecoration(
                                                    color: stakeStyle['color'],
                                                    border: stakeStyle[
                                                                'borderColor'] !=
                                                            null
                                                        ? pw.Border.all(
                                                            color: stakeStyle[
                                                                'borderColor'])
                                                        : null,
                                                    borderRadius: stakeStyle[
                                                        'borderRadius'],
                                                  ),
                                                ),
                                                pw.Text(
                                                  stakePos,
                                                  style: pw.TextStyle(
                                                      fontSize: 5,
                                                      color: PdfColors.black),
                                                ),
                                              ],
                                            );
                                          }).toList(),
                                        )
                                      else
                                        pw.Text('Não possui estacas',
                                            style: pw.TextStyle(
                                                fontSize: 8,
                                                color: PdfColors.grey600)),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ),
                      pw.SizedBox(height: 20),
                    ],
                  );
                }).toList(),
                if (!isLastSection) ...[
                  pw.SizedBox(height: 10),
                  pw.Divider(color: PdfColors.grey),
                  pw.SizedBox(height: 10),
                ]
              ],
            );
          }).toList(),
        ];
      },
    ),
  );

  await Printing.layoutPdf(
    name: 'mapa_tracker.pdf',
    onLayout: (format) async => pdf.save(),
  );
}

