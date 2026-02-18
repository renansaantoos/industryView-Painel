import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'lat_lng.dart';
import 'place.dart';
import 'uploaded_file.dart';
import '/backend/schema/structs/index.dart';
import '/auth/custom_auth/auth_util.dart';

String retornaDiaSemana(String date) {
  DateTime parsedDate = DateTime.parse(date);
  return DateFormat('EEEE', 'pt_BR').format(parsedDate);
}

bool checkVarNameTaksCopy(
  List<HeadersStruct> headers,
  int? sequencia,
) {
  if (sequencia == null) {
    return false;
  }

  for (var header in headers) {
    if (header.sequencia == sequencia) {
      return true;
    }
  }

  return false;
}

int funReturnId(
  int id,
  List<int> myIds,
) {
  // verifica se o id contains no meu myIds se conter retorna o id de acordo
  if (myIds.contains(id)) {
    return id;
  } else {
    return 0;
  }
}

String? numberToAlphabet(String index) {
  int n = int.tryParse(index) ?? -1;
  if (n < 0) return null;

  String result = '';
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = (n ~/ 26) - 1;
  }

  return result;
}

int funRetornaNumeroCaracteres(String? campo) {
  // retorna a quantidade de caracteres do campo
  if (campo != null) {
    return campo.length;
  } else {
    return 0;
  }
}

DateTime funConvertTimestamp(int timestamp) {
  // converta meu timestamp em um datetime, meu timestamp é um microseconds
  DateTime dateTime = DateTime.fromMicrosecondsSinceEpoch(timestamp);
  return dateTime;
}

String funReturnfirst10Characters(String date) {
  // return the first 10 characteres received from my date
  return date.substring(0, 10);
}

int? funReturnStatus(List? status) {
  if (status == null || status.isEmpty) {
    return 1; // Retorna 1 se a lista estiver vazia ou nula
  }

  List<int> statuses = [];

  for (var trackerStruct in status) {
    for (var tracker in trackerStruct.listRowsTrackers ?? []) {
      for (var stake in tracker.stakesList ?? []) {
        statuses.add(stake.stakesStatusesId);
      }
    }
  }

  if (statuses.isEmpty) {
    return 1;
  }

  if (statuses.every((s) => s == 5)) {
    return 5; // Caso TODOS sejam 5, retorna 5
  }
  if (statuses.contains(4)) {
    return 4; // Se houver pelo menos um 4, retorna 4
  }
  if (statuses.contains(3)) {
    return 3; // Se houver pelo menos um 3 (e não houver 4), retorna 3
  }
  if (statuses.every((s) => s == 2)) {
    return 2; // Se todos forem 2, retorna 2
  }

  return 1; // Caso contrário, retorna 1
}

List<dynamic> removeFirstList(List<dynamic> jsonlist) {
  // remove o primeiro index da lista e retorne as demais
  if (jsonlist.isNotEmpty) {
    jsonlist.removeAt(0); // Remove the first index
  }
  return jsonlist; // Return the modified list
}

int funcGetIndex(
  int codigo,
  List<dynamic>? linhas,
) {
  // retornar o índice da linha cujo código seja igual ao código fornecido
  for (int i = 0; i < linhas!.length; i++) {
    if (linhas[i].codigo == codigo) {
      return i;
    }
  }
  return -1;
}

int retornaQtdJson(List<dynamic> jsonlist) {
  // retorna a quantidade de numero da minha lista jsonlist
  return jsonlist.length; // Retorna a quantidade de elementos na lista jsonlist
}

String converteData(String date) {
  // meu date esta vindo nesse formato yyyy-MM-dd preciso que converte para dd/MM/yyyyy
  // Split the input date string by '-'
  List<String> parts = date.split('-');

  // Check if the date has the correct format
  if (parts.length != 3) {
    throw FormatException('Invalid date format');
  }

  // Rearrange the parts to dd/MM/yyyy format
  return '${parts[2]}/${parts[1]}/${parts[0]}';
}

List<dynamic> retornaJsonListDate(List<dynamic> jsonlist) {
  // meu jsonlist retorna uma lista nesse formato yyyy-MM-dd preciso que converta para dd/MM/yyyy
  return jsonlist.map((dateString) {
    DateTime dateTime = DateTime.parse(dateString);
    return DateFormat('dd/MM/yyyy').format(dateTime);
  }).toList();
}

String funReturnLast5characteres(String hour) {
  // return the last 5 characteres received from mu hour
  if (hour.length >= 5) {
    return hour.substring(hour.length - 5);
  } else {
    return hour;
  }
}

String aplicarMascaras(String valor) {
  String apenasNumeros = valor.replaceAll(RegExp(r'\D'), '');

  if (apenasNumeros.length <= 11) {
    return apenasNumeros.replaceAllMapped(
        RegExp(r'^(\d{3})(\d{3})?(\d{3})?(\d{2})?$'),
        (Match m) => '${m[1]}${m[2] != null ? '.${m[2]}' : ''}'
            '${m[3] != null ? '.${m[3]}' : ''}'
            '${m[4] != null ? '-${m[4]}' : ''}');
  } else {
    return apenasNumeros.replaceAllMapped(
        RegExp(r'^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?$'),
        (Match m) => '${m[1]}${m[2] != null ? '.${m[2]}' : ''}'
            '${m[3] != null ? '.${m[3]}' : ''}'
            '${m[4] != null ? '/${m[4]}' : ''}'
            '${m[5] != null ? '-${m[5]}' : ''}');
  }
}

int retornaQtdList(List<dynamic> jsonlist) {
  // retorna a quantidade de numeros da jsonlist
  return jsonlist.length; // Retorna a quantidade de números na lista jsonlist
}

DateTime funDtEnds(int dtEnd) {
  // Converter de milissegundos para DateTime
  DateTime dtEndDateTime = DateTime.fromMillisecondsSinceEpoch(dtEnd);
  DateTime dtEndPlusOneDay = dtEndDateTime.add(Duration(days: 1));

  // Retorna apenas a data sem horas, minutos e segundos (mantendo como DateTime)
  return DateTime(
      dtEndPlusOneDay.year, dtEndPlusOneDay.month, dtEndPlusOneDay.day);
}

Color funColorTable(int index) {
  // de acordo com o meu index pinta de cores sendo #FFFFFFF e #f1f4f8 intercalando como uma tabela
  List<Color> colors = [
    Color(0xFFFFFFFF),
    Color(0xFFF1F4F8),
  ];

  return colors[index % 2];
}

List<String> actJuntaTrackerManufacturers(
  List<String> tracker,
  List<String> manufactures,
) {
  // preciso que junte o index do tracker com o index do manufactures trazendo os 2 juntos
  List<String> combined = [];
  for (int i = 0; i < math.min(tracker.length, manufactures.length); i++) {
    combined.add('${tracker[i]} / ${manufactures[i]}');
  }
  return combined;
}

String? espacamento() {
  // preciso que de um espaçamento de 1 linha
  return '\n'; // Retorna uma string com um espaçamento de linha
}

int? retornaEmpty(List<dynamic>? jsonList) {
  // se meu json retornar null ou vazio retorne 0 agora se retornar algum valor retorne 1
  return (jsonList == null || jsonList.isEmpty) ? 0 : 1;
}

List<dynamic> criarListaAgrupada(List<dynamic> jsonList) {
  //
  final Map<int, Map<String, dynamic>> agrupado = {};
  final List<Map<String, dynamic>> semTemplate = [];

  for (final item in jsonList) {
    final map = Map<String, dynamic>.from(item);
    final int templateId = map['task_template_id'] ?? 0;

    if (templateId == 0) {
      // Mantém os que têm task_template_id = 0 como estão
      semTemplate.add(map);
    } else {
      // Agrupa os demais
      if (!agrupado.containsKey(templateId)) {
        agrupado[templateId] = {
          'task_template_id': templateId,
          'descricao': map['descricao'],
          'quantidade_prevista': map['quantidade_prevista'] ?? 0,
          'quantidade_realizada_total': map['quantidade_realizada_total'] ?? 0,
          'quantidade_realizada_dia': map['quantidade_realizada_dia'] ?? 0,
        };
      } else {
        agrupado[templateId]!['quantidade_prevista'] +=
            map['quantidade_prevista'] ?? 0;
        agrupado[templateId]!['quantidade_realizada_total'] +=
            map['quantidade_realizada_total'] ?? 0;
        agrupado[templateId]!['quantidade_realizada_dia'] +=
            map['quantidade_realizada_dia'] ?? 0;
      }
    }
  }

  // Junta os agrupados com os itens sem template
  final resultado = [...agrupado.values, ...semTemplate];

  return resultado;
}

String? retornaPercentualMovimentacoes(List<dynamic> items) {
  DateTime now = DateTime.now();
  int currentMonth = now.month;
  int currentYear = now.year;

  DateTime? _toDate(dynamic value) {
    if (value == null) return null;
    if (value is String) return DateTime.tryParse(value);
    if (value is int) {
      final isMs = value.toString().length > 10;
      return DateTime.fromMillisecondsSinceEpoch(isMs ? value : value * 1000);
    }
    return null;
  }

  num _extractQty(Map<String, dynamic> item) {
    dynamic v = item['quantity'] ?? 0;
    if (v is num) return v;
    if (v is String) {
      final parsed = num.tryParse(v.replaceAll(',', '.'));
      return parsed ?? 0;
    }
    return 0;
  }

  final validLogs = items
      .where((item) {
        if (item is! Map<String, dynamic>) return false;
        final deleted = item['deleted_at'];
        return deleted == null;
      })
      .cast<Map<String, dynamic>>()
      .toList();

  if (validLogs.isEmpty) return null;

  num totalEntradas = 0;
  num totalSaidas = 0;

  for (final log in validLogs) {
    final createdAt = _toDate(log['created_at']);
    if (createdAt == null) continue;

    if (createdAt.month == currentMonth && createdAt.year == currentYear) {
      final qty = _extractQty(log);
      final isEntrada = log['type'] == true;

      if (isEntrada) {
        totalEntradas += qty;
      } else {
        totalSaidas += qty;
      }
    }
  }

  final totalMovimentado = totalEntradas + totalSaidas;
  if (totalMovimentado == 0) return null;

  final double percEntradas = (totalEntradas / totalMovimentado) * 100.0;
  return '${percEntradas.toStringAsFixed(2)}%';
}

double? retorunDouble(int? all) {
  if (all == null) return null;
  String formatted = all.toString().replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (Match m) => "${m[1]}.");
  return double.tryParse(formatted.replaceAll(',', '.'));
}

String returnDate(String date) {
  // date esta vindo 2025-11-27 retorne 27/11/25
  DateTime parsedDate = DateTime.parse(date);
  return DateFormat('dd/MM/yy').format(parsedDate);
}

bool checkCanConclude(
  List<dynamic> json,
  int idargument,
) {
  for (final item in json) {
    if (item['id'] == idargument) {
      // ✔ Se NÃO existir 'can_conclude', retorna TRUE
      if (!item.containsKey('can_conclude')) {
        return true;
      }

      // ✔ Se existir e for TRUE, retorna TRUE
      if (item['can_conclude'] == true) {
        return true;
      }

      // ✔ Se existir e for FALSE, retorna FALSE
      return false;
    }
  }

  // ID não encontrado → retorna false
  return false;
}

bool? listaDentrodeListasubtask(
  List<dynamic>? listaSubtask,
  List<int> todas,
) {
// Se não tiver subtasks, considero que NÃO está completo
  if (listaSubtask == null || listaSubtask.isEmpty) {
    print('DEBUG: listaSubtask null ou vazia -> false');
    return false;
  }

  final setTodas = todas.toSet();
  print('DEBUG: todas = $todas');
  print(
      'DEBUG: primeiro item de listaSubtask = ${listaSubtask.first} (tipo: ${listaSubtask.first.runtimeType})');

  for (final item in listaSubtask) {
    int? id;

    // Caso seja int direto
    if (item is int) {
      id = item;
    }
    // Caso venha como String
    else if (item is String) {
      id = int.tryParse(item);
    }
    // Caso comum no FF: Map (JsLinkedHashMap)
    else if (item is Map) {
      // Tenta várias chaves possíveis
      if (item['id'] is int) {
        id = item['id'] as int;
      } else if (item['subtask_id'] is int) {
        id = item['subtask_id'] as int;
      } else if (item['subtaskId'] is int) {
        id = item['subtaskId'] as int;
      } else if (item['task_id'] is int) {
        id = item['task_id'] as int;
      }

      print('DEBUG: Map item = $item -> id extraído = $id');
    } else {
      // Qualquer outro tipo (struct, etc)
      print('DEBUG: item com tipo não tratado: $item (${item.runtimeType})');
    }

    // Se não conseguiu extrair id ou não está em 'todas', já falha
    if (id == null || !setTodas.contains(id)) {
      print('DEBUG: id $id não encontrado em "todas" -> false');
      return false;
    }
  }

  print('DEBUG: todos os subtasks estão em "todas" -> true');
  return true;
}

bool jsonVazio(List<dynamic>? subtaskList) {
  // se subtaskList for vazia OU null, retornar false
  return subtaskList == null || subtaskList.isEmpty;
}

bool checkVarNameTaks(
  List<HeadersStruct> headers,
  String varTxt,
) {
  // verifica se meu headers meu field nome contem o vartxt se conter retorna true se nao false
  for (var header in headers) {
    if (header.nome.contains(varTxt)) {
      return true;
    }
  }
  return false;
}

String? checkSequencia(
  List<HeadersStruct> headers,
  int number,
) {
  // verifique se meu number é igual a sequencia do meu headers se for retorne o nome
  for (var header in headers) {
    if (header.sequencia == number) {
      return header.nome;
    }
  }
  return null;
}

String returnNomeHeaders(
  List<HeadersStruct> headers,
  int sequencia,
) {
  // de acordo com a sequencia  for igual ao meu field sequencia que eu passar retorne o nome
  for (var header in headers) {
    if (header.sequencia == sequencia) {
      return header.nome;
    }
  }
  return '';
}

bool checkIsHeaderUsedElsewhere(
  List<HeadersStruct> headers,
  String varText,
  int currentSequencia,
) {
  for (var h in headers) {
    if (h.nome == varText && h.sequencia != currentSequencia) {
      return true;
    }
  }
  return false;
}
