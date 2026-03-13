import '/backend/api_requests/api_calls.dart';
import '/core/utils/app_utils.dart';
import 'confirmdialog_r_d_o_widget.dart' show ConfirmdialogRDOWidget;
import 'package:flutter/material.dart';

class ConfirmdialogRDOModel extends PageModel<ConfirmdialogRDOWidget> {
  ///  Local state fields for this component.

  int contador = 0;

  List<UploadedFile> img = [];
  void addToImg(UploadedFile item) => img.add(item);
  void removeFromImg(UploadedFile item) => img.remove(item);
  void removeAtIndexFromImg(int index) => img.removeAt(index);
  void insertAtIndexInImg(int index, UploadedFile item) =>
      img.insert(index, item);
  void updateImgAtIndex(int index, Function(UploadedFile) updateFn) =>
      img[index] = updateFn(img[index]);

  ///  State fields for stateful widgets in this component.

  bool isDataUploading_uploadDataYq1 = false;
  List<UploadedFile> uploadedLocalFiles_uploadDataYq1 = [];

  // Stores action output result for [Backend Call - API (add imagens)] action in Button widget.
  ApiCallResponse? editImages;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
