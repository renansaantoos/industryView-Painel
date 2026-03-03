import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';
import 'empty_model.dart';
export 'empty_model.dart';

class EmptyWidget extends StatefulWidget {
  const EmptyWidget({super.key});

  @override
  State<EmptyWidget> createState() => _EmptyWidgetState();
}

class _EmptyWidgetState extends State<EmptyWidget> {
  late EmptyModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => EmptyModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.of(context).secondaryBackground,
      ),
      child: Padding(
        padding: EdgeInsets.all(23.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Animate(
              child: Lottie.asset(
                'assets/jsons/Empty.json',
                width: 120.0,
                height: 120.0,
                fit: BoxFit.contain,
                animate: true,
              ),
            ).fadeIn(duration: 400.ms),
            const SizedBox(height: 8),
            Text(
              AppLocalizations.of(context).getVariableText(
                ptText: 'Nenhuma tarefa encontrada',
                enText: 'No tasks found',
                esText: 'No se encontraron tareas',
              ),
              style: AppTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.lexend(
                      fontWeight: FontWeight.bold,
                      fontStyle:
                          AppTheme.of(context).bodyMedium.fontStyle,
                    ),
                    letterSpacing: 0.0,
                    fontWeight: FontWeight.bold,
                    fontStyle:
                        AppTheme.of(context).bodyMedium.fontStyle,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              AppLocalizations.of(context).getVariableText(
                ptText: 'Tente ajustar os filtros ou aguarde novas tarefas',
                enText: 'Try adjusting filters or wait for new tasks',
                esText: 'Intenta ajustar los filtros o espera nuevas tareas',
              ),
              style: AppTheme.of(context).labelSmall.override(
                    font: GoogleFonts.lexend(
                      fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                      fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                    ),
                    color: AppTheme.of(context).secondaryText,
                    letterSpacing: 0.0,
                    fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                    fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
