import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_info_model.dart';
export 'modal_info_model.dart';

class ModalInfoWidget extends StatefulWidget {
  const ModalInfoWidget({
    super.key,
    required this.title,
    required this.description,
  });

  final String? title;
  final String? description;

  @override
  State<ModalInfoWidget> createState() => _ModalInfoWidgetState();
}

class _ModalInfoWidgetState extends State<ModalInfoWidget> {
  late ModalInfoModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalInfoModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsetsDirectional.fromSTEB(24.0, 0.0, 24.0, 0.0),
      child: Container(
        width: 420.0,
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
        child: Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(28.0, 28.0, 28.0, 28.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.info_outline_rounded,
                size: 32,
                color: AppTheme.of(context).primary,
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisSize: MainAxisSize.max,
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.max,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Align(
                          alignment: const AlignmentDirectional(-1.0, -1.0),
                          child: Text(
                            valueOrDefault<String>(
                              widget.title,
                              ' - ',
                            ),
                            style: AppTheme.of(context)
                                .headlineMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: AppTheme.of(context)
                                        .headlineMedium
                                        .fontWeight,
                                    fontStyle: AppTheme.of(context)
                                        .headlineMedium
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: AppTheme.of(context)
                                      .headlineMedium
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
                                      .headlineMedium
                                      .fontStyle,
                                ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsetsDirectional.fromSTEB(
                              0.0, 4.0, 12.0, 0.0),
                          child: Text(
                            valueOrDefault<String>(
                              widget.description,
                              ' - ',
                            ),
                            style: AppTheme.of(context)
                                .labelMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: AppTheme.of(context)
                                        .labelMedium
                                        .fontWeight,
                                    fontStyle: AppTheme.of(context)
                                        .labelMedium
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: AppTheme.of(context)
                                      .labelMedium
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
                                      .labelMedium
                                      .fontStyle,
                                ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              Container(
                decoration: const BoxDecoration(),
              ),
              Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Expanded(
                    child: Align(
                      alignment: const AlignmentDirectional(1.0, 1.0),
                      child: AppButton(
                        onPressed: () async {
                          Navigator.pop(context);
                        },
                        text: AppLocalizations.of(context).getText(
                          '6m5ttdns' /* OK */,
                        ),
                        options: AppButtonOptions(
                          width: double.infinity,
                          height: 48.0,
                          padding: const EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 16.0, 0.0),
                          iconPadding: const EdgeInsetsDirectional.fromSTEB(
                              0.0, 0.0, 0.0, 0.0),
                          color: AppTheme.of(context).primary,
                          textStyle:
                              AppTheme.of(context).labelMedium.override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FontWeight.w600,
                                      fontStyle: AppTheme.of(context)
                                          .labelMedium
                                          .fontStyle,
                                    ),
                                    color: Colors.white,
                                    fontSize: 15.0,
                                    letterSpacing: 0.0,
                                    fontWeight: FontWeight.w600,
                                    fontStyle: AppTheme.of(context)
                                        .labelMedium
                                        .fontStyle,
                                  ),
                          elevation: 0.0,
                          borderRadius: BorderRadius.circular(14.0),
                        ),
                      ),
                    ),
                  ),
                ].divide(const SizedBox(width: 12.0)),
              ),
            ].divide(const SizedBox(height: 16.0)),
          ),
        ),
      ),
    );
  }
}
