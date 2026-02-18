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

import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';

class LineGraph extends StatefulWidget {
  const LineGraph({
    super.key,
    this.width,
    this.height,
    this.date,
    this.reta1,
    this.reta2,
  });

  final double? width;
  final double? height;
  final List<String>? date;
  final List<int>? reta1;
  final List<int>? reta2;

  @override
  State<LineGraph> createState() => _LineGraphState();
}

class _LineGraphState extends State<LineGraph> {
  @override
  Widget build(BuildContext context) {
    // Tratamento de valores nulos usando coalescência
    final dates = widget.date ?? <String>[];
    final accum = widget.reta1 ?? <int>[];
    final rems = widget.reta2 ?? <int>[];

    // Se não houver dados válidos, exibe mensagem
    if (dates.isEmpty || accum.isEmpty || rems.isEmpty) {
      return SizedBox(
        width: widget.width ?? double.infinity,
        height: widget.height ?? 200,
        child: Center(
          child: Text(
            'Sem dados para exibir',
            style: FlutterFlowTheme.of(context).bodyText1,
          ),
        ),
      );
    }

    // Gera pontos de dados
    final spotsreta1 = <FlSpot>[];
    final spotsreta2 = <FlSpot>[];
    for (int i = 0; i < dates.length; i++) {
      if (i < accum.length) {
        spotsreta1.add(FlSpot(i.toDouble(), accum[i].toDouble()));
      }
      if (i < rems.length) {
        spotsreta2.add(FlSpot(i.toDouble(), rems[i].toDouble()));
      }
    }

    // Cálculo de limites do eixo Y
    double minY = 0;
    double maxY = 0;
    for (final s in spotsreta1) {
      if (s.y > maxY) maxY = s.y;
    }
    for (final s in spotsreta2) {
      if (s.y > maxY) maxY = s.y;
    }
    if (maxY == 0) maxY = 10;
    maxY *= 1.1;

    String formatDateString(String dateStr) {
      try {
        final d = DateTime.parse(dateStr);
        return DateFormat('dd/MM').format(d);
      } catch (_) {
        return dateStr;
      }
    }

    return SizedBox(
      width: widget.width ?? double.infinity,
      height: widget.height ?? 200,
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: true,
            horizontalInterval: maxY > 5 ? maxY / 5 : 1,
            getDrawingHorizontalLine: (_) => FlLine(
              color: Colors.grey.withOpacity(0.3),
              strokeWidth: 1,
            ),
            getDrawingVerticalLine: (_) => FlLine(
              color: Colors.grey.withOpacity(0.3),
              strokeWidth: 1,
            ),
          ),
          titlesData: FlTitlesData(
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                interval: 1,
                reservedSize: 30,
                getTitlesWidget: (value, meta) {
                  final idx = value.toInt();
                  if (idx >= 0 && idx < dates.length) {
                    return SideTitleWidget(
                      meta: meta,
                      child: Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          formatDateString(dates[idx]),
                          style: FlutterFlowTheme.of(context)
                              .bodyText2
                              .override(fontSize: 10),
                        ),
                      ),
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                interval: maxY > 5 ? maxY / 5 : 1,
                reservedSize: 40,
                getTitlesWidget: (value, meta) => SideTitleWidget(
                  meta: meta,
                  child: Text(
                    value.toInt().toString(),
                    style: FlutterFlowTheme.of(context)
                        .bodyText2
                        .override(fontSize: 10),
                  ),
                ),
              ),
            ),
            topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          borderData: FlBorderData(
            show: true,
            border: Border.all(
              color: Colors.grey.withOpacity(0.5),
              width: 1,
            ),
          ),
          minX: 0,
          maxX: (dates.length - 1).toDouble(),
          minY: minY,
          maxY: maxY,
          lineBarsData: [
            LineChartBarData(
              spots: spotsreta1,
              isCurved: false,
              barWidth: 3,
              dotData: FlDotData(
                show: true,
                getDotPainter: (spot, percent, bar, idx) => FlDotCirclePainter(
                  radius: 4,
                  color: FlutterFlowTheme.of(context).primaryColor,
                  strokeWidth: 2,
                  strokeColor: Colors.white,
                ),
              ),
              belowBarData: BarAreaData(
                show: true,
                color:
                    FlutterFlowTheme.of(context).primaryColor.withOpacity(0.1),
              ),
              color: FlutterFlowTheme.of(context).primaryColor,
            ),
            LineChartBarData(
              spots: spotsreta2,
              isCurved: false,
              barWidth: 3,
              dotData: FlDotData(
                show: true,
                getDotPainter: (spot, percent, bar, idx) => FlDotCirclePainter(
                  radius: 4,
                  color: FlutterFlowTheme.of(context).tertiaryColor,
                  strokeWidth: 2,
                  strokeColor: Colors.white,
                ),
              ),
              belowBarData: BarAreaData(
                show: true,
                color:
                    FlutterFlowTheme.of(context).tertiaryColor.withOpacity(0.1),
              ),
              color: FlutterFlowTheme.of(context).tertiaryColor,
            ),
          ],
        ),
      ),
    );
  }
}
