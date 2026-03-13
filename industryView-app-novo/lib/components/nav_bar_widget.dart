import '/backend/schema/structs/index.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '/widgets/sync_indicator_widget.dart';
import 'nav_bar_model.dart';
export 'nav_bar_model.dart';

class NavBarWidget extends StatefulWidget {
  const NavBarWidget({
    super.key,
    required this.page,
    this.totalSprints,
    this.concluidasSprints,
  });

  final int? page;
  final int? totalSprints;
  final int? concluidasSprints;

  @override
  State<NavBarWidget> createState() => _NavBarWidgetState();
}

class _NavBarWidgetState extends State<NavBarWidget> {
  late NavBarModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => NavBarModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: const AlignmentDirectional(0.0, 1.0),
      child: Container(
        width: double.infinity,
        height: 60.0,
        decoration: BoxDecoration(
          color: AppTheme.of(context).secondaryBackground,
          boxShadow: const [
            BoxShadow(
              blurRadius: 8.0,
              color: Color(0x12000000),
              offset: Offset(0, -2),
            )
          ],
        ),
        child: Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(24.0, 4.0, 24.0, 4.0),
          child: Row(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppIconButton(
                    borderRadius: 50.0,
                    buttonSize: 44.0,
                    icon: Icon(
                      Icons.task,
                      color: widget.page == 1
                          ? AppTheme.of(context).primary
                          : AppTheme.of(context).secondaryText,
                      size: widget.page == 1 ? 24.0 : 22.0,
                    ),
                    onPressed: () async {
                      if (widget.page == 1) {
                        return;
                      }

                      AppState().filters = 0;
                      AppState().filterSprint = false;
                      AppState().filterSprint01 = FiltersStruct();
                      AppState().taskslist = [];
                      safeSetState(() {});

                      context.pushNamed(
                        HomePageTarefasWidget.routeName,
                        extra: <String, dynamic>{
                          kTransitionInfoKey: const TransitionInfo(
                            hasTransition: true,
                            transitionType: PageTransitionType.fade,
                            duration: Duration(milliseconds: 250),
                          ),
                        },
                      );

                      return;
                    },
                  ),
                  // Active tab indicator
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: widget.page == 1 ? 20 : 0,
                    height: 3,
                    margin: const EdgeInsets.only(top: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.of(context).primary,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ],
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppIconButton(
                    borderRadius: 50.0,
                    buttonSize: 44.0,
                    icon: Icon(
                      Icons.read_more,
                      color: widget.page == 2
                          ? AppTheme.of(context).primary
                          : AppTheme.of(context).secondaryText,
                      size: widget.page == 2 ? 24.0 : 22.0,
                    ),
                    onPressed: () async {
                      if (widget.page == 2) {
                        return;
                      }

                      AppState().filters = 0;
                      AppState().filterSprint = false;
                      AppState().filterSprint01 = FiltersStruct();
                      AppState().taskslist = [];
                      safeSetState(() {});

                      context.pushNamed(
                        RdoWidget.routeName,
                        extra: <String, dynamic>{
                          kTransitionInfoKey: const TransitionInfo(
                            hasTransition: true,
                            transitionType: PageTransitionType.fade,
                            duration: Duration(milliseconds: 250),
                          ),
                        },
                      );

                      return;
                    },
                  ),
                  // Active tab indicator
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: widget.page == 2 ? 20 : 0,
                    height: 3,
                    margin: const EdgeInsets.only(top: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.of(context).primary,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ],
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppIconButton(
                    borderRadius: 50.0,
                    buttonSize: 44.0,
                    icon: Icon(
                      Icons.group,
                      color: widget.page == 3
                          ? AppTheme.of(context).primary
                          : AppTheme.of(context).secondaryText,
                      size: widget.page == 3 ? 24.0 : 22.0,
                    ),
                    onPressed: () async {
                      if (widget.page == 3) {
                        return;
                      }

                      AppState().filters = 0;
                      AppState().filterSprint = false;
                      AppState().filterSprint01 = FiltersStruct();
                      AppState().taskslist = [];
                      safeSetState(() {});

                      context.pushNamed(
                        EscalaWidget.routeName,
                        extra: <String, dynamic>{
                          kTransitionInfoKey: const TransitionInfo(
                            hasTransition: true,
                            transitionType: PageTransitionType.fade,
                            duration: Duration(milliseconds: 250),
                          ),
                        },
                      );

                      return;
                    },
                  ),
                  // Active tab indicator
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: widget.page == 3 ? 20 : 0,
                    height: 3,
                    margin: const EdgeInsets.only(top: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.of(context).primary,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ],
              ),
              const SyncIndicatorWidget(
                showText: false,
                size: 18.0,
              ),
            ].divide(const SizedBox(width: 24.0)),
          ),
        ),
      ),
    );
  }
}
