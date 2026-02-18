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

import '/custom_code/actions/index.dart';
import '/flutter_flow/custom_functions.dart';
// DO NOT REMOVE ABOVE

import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

/// ----------------------------------------------------
/// HELPERS
/// ----------------------------------------------------

List<dynamic> _asList(dynamic v) {
  if (v == null) return const [];
  if (v is List) return v;
  if (v is Map) return [v];
  if (v is String) {
    try {
      final decoded = jsonDecode(v);
      if (decoded is List) return decoded;
      if (decoded is Map) return [decoded];
    } catch (_) {}
  }
  return const [];
}

String _stakeAlpha(dynamic position) {
  if (position == null) return '-';
  final p = int.tryParse(position.toString());
  if (p == null || p <= 0) return '-';
  if (p >= 1 && p <= 26) return String.fromCharCode(64 + p);
  return position.toString();
}

String _buildLocation(Map<String, dynamic> pb) {
  final field = pb['fields']?['name'] ?? '-';
  final section = pb['sections']?['section_number']?.toString() ?? '-';
  final row = pb['rows']?['row_number']?.toString() ?? '-';

  final tracker = pb['rows_trackers']?['position']?.toString() ??
      pb['trackers_id']?.toString() ??
      '-';

  final estaca = _stakeAlpha(
    pb['rows_stakes']?['position'],
  );

  return "Campo $field > Seção $section > Fileira $row > Tracker $tracker > Estaca $estaca";
}

String _extractScheduleDate(List data) {
  for (final d in data) {
    if (d is Map && d['schedule_date'] != null) {
      return d['schedule_date'].toString();
    }
  }
  final now = DateTime.now();
  return "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
}

/// ----------------------------------------------------
/// PDF GENERATOR
/// ----------------------------------------------------

Future<String> generateRdoPdf(dynamic jsonData) async {
  final List<dynamic> data = _asList(jsonData);
  final extractedDate = _extractScheduleDate(data);
  final fileName = "RDO_$extractedDate.pdf";

  final pdf = pw.Document();

  pdf.addPage(
    pw.MultiPage(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.all(24),
      build: (context) {
        final widgets = <pw.Widget>[];

        for (final raw in data) {
          if (raw is! Map) continue;
          final item = Map<String, dynamic>.from(raw);

          // ---------------------------------------------------
          // CABEÇALHO DO RELATÓRIO
          // ---------------------------------------------------
          final sprint = item['sprints'] ?? {};
          final sprintTitle = sprint['title'] ?? '-';
          final sprintObjective = sprint['objective'] ?? '-';
          final sprintProgress = sprint['progress_percentage'] ?? 0;

          final team = (item['teams_leaders'] as List?)?.first?['teams'];
          final teamName = team?['name'] ?? '-';

          // Líderes
          final leaders = (item['teams_leaders'] as List? ?? [])
              .map((e) => e['user']?['name'] ?? '-')
              .join(', ');

          widgets.add(
            pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(
                  "Relatório Diário de Obras",
                  style: pw.TextStyle(
                      fontSize: 20, fontWeight: pw.FontWeight.bold),
                ),
                pw.SizedBox(height: 4),
                pw.Text("Data: $extractedDate"),
                pw.Text("Time: $teamName"),
                pw.Text("Líder(es): $leaders"),
                pw.SizedBox(height: 8),
                pw.Text("Sprint: $sprintTitle"),
                pw.Text("Objetivo: $sprintObjective"),
                pw.Text(
                    "Progresso: ${(sprintProgress * 100).toStringAsFixed(0)}%"),
                pw.Divider(),
                pw.SizedBox(height: 10),
              ],
            ),
          );

          // ---------------------------------------------------
          // TAREFAS
          // ---------------------------------------------------

          final tasks = item['sprints_tasks_id'] ?? [];

          if (tasks.isEmpty) {
            widgets.add(
              pw.Text("Nenhuma tarefa registrada."),
            );
            continue;
          }

          for (final t in tasks) {
            final st = t['sprint_task'];
            if (st == null) continue;

            final id = st['id'];
            final status = st['sprints_tasks_statuses']?['status'] ?? '-';

            final pb = st['projects_backlogs'] ?? {};
            final desc = pb['description'] ?? '-';

            // Equipamento – AGORA SEMPRE PEGA O NOME CERTO
            final equipType = pb['equipaments_types']?['type'] ?? '-';

            // Quantidade + unidade
            final qty = pb['quantity']?.toString() ?? '-';
            final unity = pb['unity']?['unity'] ?? '';

            // Localização
            final location = _buildLocation(pb);

            // ---------------------------------------------------
            // BLOCO PREMIUM
            // ---------------------------------------------------
            widgets.add(
              pw.Container(
                margin: const pw.EdgeInsets.only(bottom: 18),
                padding: const pw.EdgeInsets.all(10),
                decoration: pw.BoxDecoration(
                  border: pw.Border.all(color: PdfColors.grey600, width: 0.4),
                  borderRadius: pw.BorderRadius.circular(6),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      "Tarefa #$id",
                      style: pw.TextStyle(
                        fontSize: 14,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text("Descrição:",
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    pw.Text(desc),
                    pw.SizedBox(height: 6),
                    pw.Text("Equipamento:",
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    pw.Text(equipType),
                    pw.SizedBox(height: 6),
                    pw.Text("Quantidade:",
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    pw.Text("$qty ${unity ?? ''}"),
                    pw.SizedBox(height: 6),
                    pw.Text("Localização:",
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    pw.Text(location),
                    pw.SizedBox(height: 6),
                    pw.Text("Status:",
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    pw.Text(status),
                  ],
                ),
              ),
            );
          }

          // ---------------------------------------------------
          // IMAGENS
          // ---------------------------------------------------
          final imgs = item['images'] ?? [];
          if (imgs.isNotEmpty) {
            widgets.add(pw.SizedBox(height: 20));
            widgets.add(pw.Text(
              "Imagens:",
              style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold),
            ));
            widgets.add(pw.SizedBox(height: 10));

            for (final img in imgs) {
              final url = img['url'];
              if (url != null) {
                widgets.add(
                  pw.Padding(
                    padding: const pw.EdgeInsets.only(bottom: 10),
                    child: pw.Text(url),
                  ),
                );
              }
            }
          }
        }

        return widgets;
      },
    ),
  );

  // ----------------------------------------------------
  // RETURN
  // ----------------------------------------------------
  final bytes = Uint8List.fromList(await pdf.save());

  if (kIsWeb) {
    final blob = html.Blob([bytes], 'application/pdf');
    final url = html.Url.createObjectUrlFromBlob(blob);
    final anchor = html.AnchorElement(href: url)
      ..download = fileName
      ..style.display = 'none';
    html.document.body?.append(anchor);
    anchor.click();
    anchor.remove();
    html.Url.revokeObjectUrl(url);
    return "OK";
  }

  return 'data:application/pdf;base64,${base64Encode(bytes)}';
}
