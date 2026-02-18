// Automatic FlutterFlow imports
import '/backend/schema/structs/index.dart';
import '/actions/actions.dart' as action_blocks;
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom widgets
import '/custom_code/actions/index.dart'; // Imports custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'package:fl_chart/fl_chart.dart' as fl;
import 'package:intl/intl.dart';
import 'dart:math';

class Chats extends StatefulWidget {
  const Chats({
    super.key,
    this.width,
    this.height,
    required this.dados,
  });

  final double? width;
  final double? height;
  final List<dynamic> dados;

  @override
  State<Chats> createState() => _ChatsState();
}

class _ChatsState extends State<Chats> {
  /// Função logística (curva S) em t (0..1)
  double _logistica(double t) {
    return 1 / (1 + exp(-10 * (t - 0.5)));
  }

  /// Gera uma curva logística (S) normalizada 0..1 com resolução `pontos`.
  List<fl.FlSpot> _gerarCurvaS(double maxIndex, {int pontos = 120}) {
    final curva = <fl.FlSpot>[];
    for (int i = 0; i <= pontos; i++) {
      final t = i / pontos; // 0..1
      final x = t * maxIndex; // espalha sobre 0..maxIndex
      final y = _logistica(t);
      curva.add(fl.FlSpot(x, y));
    }
    return curva;
  }

  @override
  Widget build(BuildContext context) {
    if (widget.dados.isEmpty) {
      return const Center(child: Text('Sem dados'));
    }

    // 1) Calcula o total previsto
    final double totalPrevisto = widget.dados.fold<double>(
      0.0,
      (s, e) => s + (e['quantidade_prevista'] ?? 0).toDouble(),
    );
    final basePrevisto = totalPrevisto > 0 ? totalPrevisto : 1.0;

    // 2) Constrói pontos com base nas tarefas (sem datas)
    final List<fl.FlSpot> pontosExecutado = [];
    final Map<int, String> labelsByIndex = {};

    double acumulado = 0.0;

    for (int i = 0; i < widget.dados.length; i++) {
      final item = widget.dados[i];
      final double previsto = (item['quantidade_prevista'] ?? 0).toDouble();
      final double realizado =
          (item['quantidade_realizada_total'] ?? 0).toDouble();

      acumulado += realizado;

      final progresso = (acumulado / basePrevisto).clamp(0.0, 1.0);
      pontosExecutado.add(fl.FlSpot(i.toDouble(), progresso));
      labelsByIndex[i] = item['descricao'] ?? 'Tarefa ${i + 1}';
    }

    // Define range X baseado na quantidade de tarefas
    final int n = max(1, widget.dados.length);
    final double maxIndex = (n - 1).toDouble();

    // 3) Curva prevista (azul)
    final curvaPrevista = _gerarCurvaS(maxIndex, pontos: max(60, n * 6));

    // 4) Percentuais
    final double executadoAtual =
        pontosExecutado.isNotEmpty ? pontosExecutado.last.y : 0.0;
    final String executadoStr = '${(executadoAtual * 100).toStringAsFixed(1)}%';

    // 5) Ajuste dos labels (para não poluir)
    final int maxLabels = 6;
    final int step = max(1, (n / maxLabels).ceil());

    Widget bottomTitleWidgets(double value, fl.TitleMeta meta) {
      final int idx = value.round();
      if (labelsByIndex.containsKey(idx) &&
          (idx == 0 || idx == maxIndex.toInt() || idx % step == 0)) {
        return SizedBox(
          width: 60,
          child: Text(
            labelsByIndex[idx]!,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 10, color: Colors.black54),
            overflow: TextOverflow.ellipsis,
          ),
        );
      }
      return const SizedBox.shrink();
    }

    // 6) Altura mínima do gráfico
    final double chartHeight =
        (widget.height != null && widget.height! > 0) ? widget.height! : 150;

    // 7) Render
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // LEGEND + current %
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 6.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // legenda (Previsto + Executado)
              Row(
                children: [
                  Container(width: 14, height: 8, color: Colors.blue),
                  const SizedBox(width: 6),
                  const Text('Previsto', style: TextStyle(fontSize: 13)),
                  const SizedBox(width: 16),
                  Container(width: 14, height: 8, color: Colors.green),
                  const SizedBox(width: 6),
                  const Text('Executado', style: TextStyle(fontSize: 13)),
                ],
              ),
              // Percentual atual à direita
              Text('Atual: $executadoStr',
                  style: const TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w600)),
            ],
          ),
        ),

        // GRÁFICO
        SizedBox(
          width: widget.width ?? double.infinity,
          height: chartHeight,
          child: fl.LineChart(
            fl.LineChartData(
              lineTouchData: fl.LineTouchData(
                enabled: true,
                handleBuiltInTouches: true,
                touchTooltipData: fl.LineTouchTooltipData(
                  getTooltipItems: (List<fl.LineBarSpot> touchedSpots) {
                    return touchedSpots.map((spot) {
                      final String label = labelsByIndex[
                              spot.x.round().clamp(0, maxIndex.toInt())] ??
                          '';
                      final String percent =
                          '${(spot.y * 100).toStringAsFixed(1)}%';
                      final String title =
                          spot.barIndex == 0 ? 'Previsto' : 'Executado';
                      return fl.LineTooltipItem(
                        '$title\n$label\n$percent',
                        const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w500),
                      );
                    }).toList();
                  },
                ),
              ),
              gridData: fl.FlGridData(
                show: true,
                drawVerticalLine: true,
                horizontalInterval: 0.1,
                getDrawingHorizontalLine: (value) => fl.FlLine(
                  color: Colors.grey.withOpacity(0.18),
                  strokeWidth: 1,
                ),
                getDrawingVerticalLine: (value) => fl.FlLine(
                  color: Colors.grey.withOpacity(0.12),
                  strokeWidth: 1,
                ),
              ),
              titlesData: fl.FlTitlesData(
                bottomTitles: fl.AxisTitles(
                  sideTitles: fl.SideTitles(
                    showTitles: true,
                    interval: 1,
                    reservedSize: 42,
                    getTitlesWidget: bottomTitleWidgets,
                  ),
                ),
                leftTitles: fl.AxisTitles(
                  sideTitles: fl.SideTitles(
                    showTitles: true,
                    interval: 0.2,
                    reservedSize: 36,
                    getTitlesWidget: (value, meta) {
                      return Text('${(value * 100).toInt()}%',
                          style: const TextStyle(fontSize: 10));
                    },
                  ),
                ),
                rightTitles: const fl.AxisTitles(
                    sideTitles: fl.SideTitles(showTitles: false)),
                topTitles: const fl.AxisTitles(
                    sideTitles: fl.SideTitles(showTitles: false)),
              ),
              borderData: fl.FlBorderData(
                show: true,
                border: Border.all(color: Colors.black.withOpacity(0.12)),
              ),
              minX: 0,
              maxX: maxIndex > 0 ? maxIndex : 1,
              minY: 0,
              maxY: 1,
              lineBarsData: [
                // Linha azul (previsto)
                fl.LineChartBarData(
                  spots: curvaPrevista,
                  isCurved: true,
                  curveSmoothness: 0.8,
                  barWidth: 3,
                  color: Colors.blue,
                  dotData: const fl.FlDotData(show: false),
                  belowBarData: fl.BarAreaData(
                    show: true,
                    color: Colors.blue.withOpacity(0.15),
                  ),
                ),

                // Linha verde (executado acumulado)
                fl.LineChartBarData(
                  spots: pontosExecutado,
                  isCurved: false,
                  barWidth: 3,
                  color: Colors.green,
                  dotData: fl.FlDotData(
                    show: true,
                    getDotPainter: (spot, percent, bar, index) {
                      final isLast = index == pontosExecutado.length - 1;
                      return fl.FlDotCirclePainter(
                        radius: isLast ? 5 : 2.5,
                        color: Colors.green,
                        strokeWidth: isLast ? 2 : 0.5,
                        strokeColor: Colors.white,
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
