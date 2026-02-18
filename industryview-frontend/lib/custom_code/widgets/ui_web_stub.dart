
// Stub file to run on non-web platforms (Android, iOS, Desktop)
// This avoids "dart:ui_web not found" errors.

class PlatformViewRegistry {
  /// Shim for registerViewFactory
  void registerViewFactory(String viewId, dynamic cb) {}
}

final platformViewRegistry = PlatformViewRegistry();
