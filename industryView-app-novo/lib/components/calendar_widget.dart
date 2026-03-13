import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/core/widgets/custom_widgets.dart' as custom_widgets;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'calendar_model.dart';
export 'calendar_model.dart';

class CalendarWidget extends StatefulWidget {
  const CalendarWidget({
    super.key,
    required this.action,
  });

  final Future Function()? action;

  @override
  State<CalendarWidget> createState() => _CalendarWidgetState();
}

class _CalendarWidgetState extends State<CalendarWidget> {
  late CalendarModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CalendarModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<AppState>();

    return Align(
      alignment: const AlignmentDirectional(0.0, 0.0),
      child: Container(
        width: 300.0,
        decoration: BoxDecoration(
          color: AppTheme.of(context).secondaryBackground,
          borderRadius: BorderRadius.circular(16.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.12),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: double.infinity,
              height: 330.0,
              child: custom_widgets.CalendarCustom(
                width: double.infinity,
                height: 330.0,
                paramDate: AppState().datesPicked,
              ),
            ),
            Padding(
              padding: const EdgeInsetsDirectional.fromSTEB(24.0, 16.0, 24.0, 24.0),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AppButton(
                    onPressed: () async {
                      Navigator.pop(context);
                    },
                    text: AppLocalizations.of(context).getText(
                      'wcz9kw1c' /* Cancelar */,
                    ),
                    options: AppButtonOptions(
                      height: 48.0,
                      padding:
                          const EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                      iconPadding:
                          const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      color: AppTheme.of(context).secondaryBackground,
                      textStyle:
                          AppTheme.of(context).titleSmall.override(
                                font: GoogleFonts.lexend(
                                  fontWeight: AppTheme.of(context)
                                      .titleSmall
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
                                      .titleSmall
                                      .fontStyle,
                                ),
                                color: AppTheme.of(context).primary,
                                letterSpacing: 0.0,
                                fontWeight: AppTheme.of(context)
                                    .titleSmall
                                    .fontWeight,
                                fontStyle: AppTheme.of(context)
                                    .titleSmall
                                    .fontStyle,
                              ),
                      elevation: 0.0,
                      borderRadius: BorderRadius.circular(2.0),
                    ),
                  ),
                  AppButton(
                    onPressed: () async {
                      if (AppState().datesPicked.isNotEmpty) {
                        AppState().filterSprint = true;
                        safeSetState(() {});
                        Navigator.pop(context);
                        return;
                      } else {
                        return;
                      }
                    },
                    text: AppLocalizations.of(context).getText(
                      'f2wzrh3a' /* Ok */,
                    ),
                    options: AppButtonOptions(
                      width: 100.0,
                      height: 48.0,
                      padding:
                          const EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                      iconPadding:
                          const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      color: AppTheme.of(context).primary,
                      textStyle:
                          AppTheme.of(context).titleSmall.override(
                                font: GoogleFonts.lexend(
                                  fontWeight: AppTheme.of(context)
                                      .titleSmall
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
                                      .titleSmall
                                      .fontStyle,
                                ),
                                color: Colors.white,
                                letterSpacing: 0.0,
                                fontWeight: AppTheme.of(context)
                                    .titleSmall
                                    .fontWeight,
                                fontStyle: AppTheme.of(context)
                                    .titleSmall
                                    .fontStyle,
                              ),
                      elevation: 0.0,
                      borderRadius: BorderRadius.circular(14.0),
                    ),
                  ),
                ].divide(const SizedBox(width: 12.0)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
