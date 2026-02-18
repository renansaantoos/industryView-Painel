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
import 'dart:typed_data'; // ✅ necessário para Uint8List
import 'package:csv/csv.dart';
import 'package:file_saver/file_saver.dart';

Future<void> exportarDadosParaCsv(List<dynamic> dadosDoXano) async {
  List<List<dynamic>> csvLista = [];

  // Cabeçalho da planilha
  csvLista.add([
    'ID',
    'Colaborador',
    'Cargo',
    'Email',
    'WhatsApp',
    'Tipo Acesso',
    'Nível Acesso'
  ]);

  for (var item in dadosDoXano) {
    final permissions = item['users_permissions'] ?? {};
    final roleData = permissions['users_roles'] ?? {};
    final accessData = permissions['users_system_access'] ?? {};
    final controlData = permissions['users_control_system'] ?? {};

    csvLista.add([
      item['id'] ?? '',
      item['name'] ?? '',
      roleData['role'] ?? '',
      item['email'] ?? '',
      item['phone'] ?? '',
      accessData['env'] ?? '',
      controlData['access_level'] ?? '',
    ]);
  }

  // Converter para CSV com delimitador ";"
  final csvConverter = const ListToCsvConverter(fieldDelimiter: ';');
  final csvString = csvConverter.convert(csvLista);

  // Adicionar BOM (corrige acentos no Excel)
  final bomUtf8 = utf8.encode('\uFEFF');
  final csvBytes = Uint8List.fromList(
      [...bomUtf8, ...utf8.encode(csvString)]); // ✅ conversão correta

  // Nome do arquivo com data
  final dataAgora = DateTime.now();
  final nomeArquivo =
      'colaboradores_${dataAgora.year}-${dataAgora.month.toString().padLeft(2, '0')}-${dataAgora.day.toString().padLeft(2, '0')}';

  await FileSaver.instance.saveFile(
    name: nomeArquivo,
    bytes: csvBytes,
    ext: 'csv',
  );
}
