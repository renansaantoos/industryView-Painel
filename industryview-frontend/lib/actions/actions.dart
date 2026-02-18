import '/backend/api_requests/api_calls.dart';
import '/backend/api_requests/api_manager.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/custom_code/actions/index.dart' as actions;
import 'package:flutter/material.dart';

Future aPiLeaders(BuildContext context) async {
  ApiCallResponse? aPiLeaders;

  FFAppState().user0 = [];
  FFAppState().loading = true;
  FFAppState().update(() {});
  await Future.delayed(
    Duration(
      milliseconds: 1000,
    ),
  );
  aPiLeaders =
      await UserGroup.aPIQueBuscaUsuariosQuePodemSerLideresDeEquipeCall.call(
    projectsId: FFAppState().projectsInfo.id,
    bearerAuth: FFAppState().token,
    teamsId: FFAppState().id,
  );

  if ((aPiLeaders?.succeeded ?? true)) {
    FFAppState().user0 = User1Struct.maybeFromMap((aPiLeaders?.jsonBody ?? ''))!
        .items
        .toList()
        .cast<User2Struct>();
    FFAppState().page = 1;
    FFAppState().perPage = 10;
    FFAppState().nextPage = valueOrDefault<int>(
      UserGroup.aPIQueBuscaUsuariosQuePodemSerLideresDeEquipeCall.nextPage(
        (aPiLeaders?.jsonBody ?? ''),
      ),
      0,
    );
    FFAppState().prevPage = valueOrDefault<int>(
      UserGroup.aPIQueBuscaUsuariosQuePodemSerLideresDeEquipeCall.prevPage(
        (aPiLeaders?.jsonBody ?? ''),
      ),
      0,
    );
    FFAppState().itemsReceived = valueOrDefault<int>(
      UserGroup.aPIQueBuscaUsuariosQuePodemSerLideresDeEquipeCall.itemsReceived(
        (aPiLeaders?.jsonBody ?? ''),
      ),
      0,
    );
    FFAppState().itemsTotal = valueOrDefault<int>(
      UserGroup.aPIQueBuscaUsuariosQuePodemSerLideresDeEquipeCall.itemsTotal(
        (aPiLeaders?.jsonBody ?? ''),
      ),
      0,
    );
    FFAppState().loading = false;
    FFAppState().update(() {});
    await actions.actBoolean(
      FFAppState().setIds.toList(),
      FFAppState().user0.toList(),
    );
    return;
  } else {
    await showDialog(
      context: context,
      builder: (dialogContext) {
        return Dialog(
          elevation: 0,
          insetPadding: EdgeInsets.zero,
          backgroundColor: Colors.transparent,
          alignment: AlignmentDirectional(0.0, 0.0)
              .resolve(Directionality.of(context)),
          child: ModalInfoWidget(
            title: 'Erro!',
            description: getJsonField(
              (aPiLeaders?.jsonBody ?? ''),
              r'''$.message''',
            ).toString(),
          ),
        );
      },
    );

    FFAppState().loading = false;
    FFAppState().update(() {});
    return;
  }
}

Future aPiUsers0(BuildContext context) async {}
