import '/core/utils/app_utils.dart';
import 'imagens_widget.dart' show ImagensWidget;
import 'package:flutter/material.dart';

class ImagensModel extends PageModel<ImagensWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for PageView widget.
  PageController? pageViewController;

  int get pageViewCurrentIndex => pageViewController != null &&
          pageViewController!.hasClients &&
          pageViewController!.page != null
      ? pageViewController!.page!.round()
      : 0;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
