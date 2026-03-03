import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';
import 'loading_copy_model.dart';
export 'loading_copy_model.dart';

class LoadingCopyWidget extends StatefulWidget {
  const LoadingCopyWidget({super.key});

  @override
  State<LoadingCopyWidget> createState() => _LoadingCopyWidgetState();
}

class _LoadingCopyWidgetState extends State<LoadingCopyWidget> {
  late LoadingCopyModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LoadingCopyModel());

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
      height: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.of(context).secondaryBackground,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Lottie.asset(
            'assets/jsons/Solar_Panel.json',
            width: 200.0,
            height: 200.0,
            fit: BoxFit.contain,
            animate: true,
          ),
        ],
      ),
    );
  }
}
