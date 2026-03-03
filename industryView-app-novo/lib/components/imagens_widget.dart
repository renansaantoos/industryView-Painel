import '/core/widgets/app_expanded_image.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import 'package:smooth_page_indicator/smooth_page_indicator.dart'
    as smooth_page_indicator;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:page_transition/page_transition.dart';
import 'package:provider/provider.dart';
import 'imagens_model.dart';
export 'imagens_model.dart';

class ImagensWidget extends StatefulWidget {
  const ImagensWidget({
    super.key,
    this.images,
  });

  final List<dynamic>? images;

  @override
  State<ImagensWidget> createState() => _ImagensWidgetState();
}

class _ImagensWidgetState extends State<ImagensWidget> {
  late ImagensModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ImagensModel());

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
      padding: EdgeInsetsDirectional.fromSTEB(24.0, 0.0, 24.0, 0.0),
      child: Container(
        width: MediaQuery.sizeOf(context).width * 1.0,
        height: 420.0,
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
          padding: EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Align(
                alignment: AlignmentDirectional(1.0, -1.0),
                child: AppIconButton(
                  borderColor: AppTheme.of(context).primary,
                  borderRadius: 8.0,
                  buttonSize: 32.0,
                  fillColor: AppTheme.of(context).secondary,
                  icon: Icon(
                    Icons.close,
                    color: AppTheme.of(context).primary,
                    size: 16.0,
                  ),
                  onPressed: () async {
                    Navigator.pop(context);
                  },
                ),
              ),
              Align(
                alignment: AlignmentDirectional(-1.0, -1.0),
                child: Text(
                  AppLocalizations.of(context).getText(
                    'ebebloke' /* Galeria de fotos */,
                  ),
                  style: AppTheme.of(context).titleLarge.override(
                        font: GoogleFonts.lexend(
                          fontWeight: AppTheme.of(context)
                              .titleLarge
                              .fontWeight,
                          fontStyle:
                              AppTheme.of(context).titleLarge.fontStyle,
                        ),
                        letterSpacing: 0.0,
                        fontWeight:
                            AppTheme.of(context).titleLarge.fontWeight,
                        fontStyle:
                            AppTheme.of(context).titleLarge.fontStyle,
                      ),
                ),
              ),
              Align(
                alignment: AlignmentDirectional(-1.0, -1.0),
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 16.0),
                  child: Text(
                    AppLocalizations.of(context).getText(
                      'c9xelgdm' /* Veja as fotos registradas ness... */,
                    ),
                    style: AppTheme.of(context).labelMedium.override(
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
              ),
              Expanded(
                child: Builder(
                  builder: (context) {
                    final listImages = widget!.images?.toList() ?? [];

                    return Container(
                      width: double.infinity,
                      height: 690.0,
                      child: Stack(
                        children: [
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 0.0, 0.0, 40.0),
                            child: PageView.builder(
                              controller: _model.pageViewController ??=
                                  PageController(
                                      initialPage: max(
                                          0, min(0, listImages.length - 1))),
                              scrollDirection: Axis.horizontal,
                              itemCount: listImages.length,
                              itemBuilder: (context, listImagesIndex) {
                                final listImagesItem =
                                    listImages[listImagesIndex];
                                return Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      0.0, 0.0, 0.0, 16.0),
                                  child: InkWell(
                                    splashColor: Colors.transparent,
                                    focusColor: Colors.transparent,
                                    hoverColor: Colors.transparent,
                                    highlightColor: Colors.transparent,
                                    onTap: () async {
                                      await Navigator.push(
                                        context,
                                        PageTransition(
                                          type: PageTransitionType.fade,
                                          child: AppExpandedImageView(
                                            image: Image.network(
                                              valueOrDefault<String>(
                                                getJsonField(
                                                  listImagesItem,
                                                  r'''$.url''',
                                                )?.toString(),
                                                'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg',
                                              ),
                                              fit: BoxFit.contain,
                                            ),
                                            allowRotation: true,
                                            tag: valueOrDefault<String>(
                                              getJsonField(
                                                listImagesItem,
                                                r'''$.url''',
                                              )?.toString(),
                                              'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg' +
                                                  '$listImagesIndex',
                                            ),
                                            useHeroAnimation: true,
                                          ),
                                        ),
                                      );
                                    },
                                    child: Hero(
                                      tag: valueOrDefault<String>(
                                        getJsonField(
                                          listImagesItem,
                                          r'''$.url''',
                                        )?.toString(),
                                        'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg' +
                                            '$listImagesIndex',
                                      ),
                                      transitionOnUserGestures: true,
                                      child: ClipRRect(
                                        borderRadius:
                                            BorderRadius.circular(8.0),
                                        child: Image.network(
                                          valueOrDefault<String>(
                                            getJsonField(
                                              listImagesItem,
                                              r'''$.url''',
                                            )?.toString(),
                                            'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg',
                                          ),
                                          width: double.infinity,
                                          height: double.infinity,
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                          Align(
                            alignment: AlignmentDirectional(0.0, 1.0),
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 16.0),
                              child: smooth_page_indicator.SmoothPageIndicator(
                                controller: _model.pageViewController ??=
                                    PageController(
                                        initialPage: max(
                                            0, min(0, listImages.length - 1))),
                                count: listImages.length,
                                axisDirection: Axis.horizontal,
                                onDotClicked: (i) async {
                                  await _model.pageViewController!
                                      .animateToPage(
                                    i,
                                    duration: Duration(milliseconds: 500),
                                    curve: Curves.ease,
                                  );
                                  safeSetState(() {});
                                },
                                effect: smooth_page_indicator.SlideEffect(
                                  spacing: 8.0,
                                  radius: 8.0,
                                  dotWidth: 8.0,
                                  dotHeight: 8.0,
                                  dotColor:
                                      AppTheme.of(context).accent1,
                                  activeDotColor:
                                      AppTheme.of(context).primary,
                                  paintStyle: PaintingStyle.fill,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
