/// API Configuration for IndustryView
///
/// This file contains the base URLs for connecting to the Node.js backend.
/// The URLs can be configured via environment variables or use default values.
///
/// To use a different URL at compile time:
/// flutter run --dart-define=API_BASE_URL=https://your-api-url.com/api/v1
library;

class ApiConfig {
  /// Base URL for API requests
  /// Reads from environment variable API_BASE_URL, defaults to localhost development server
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api/v1',
  );

  /// Production API URL
  static const String productionUrl = 'https://api.industryview.com/api/v1';

  /// Development API URL (local Node.js server)
  static const String developmentUrl = 'http://localhost:3000/api/v1';

  /// Staging API URL (if needed)
  static const String stagingUrl = 'https://staging-api.industryview.com/api/v1';

  // === API Group Base Paths ===
  // These are appended to baseUrl to form complete endpoint URLs

  /// Authentication endpoints: login, signup, me
  static String get authPath => '$baseUrl/auth';

  /// User management endpoints
  static String get usersPath => '$baseUrl/users';

  /// Projects management endpoints
  static String get projectsPath => '$baseUrl/projects';

  /// Sprints management endpoints
  static String get sprintsPath => '$baseUrl/sprints';

  /// Tasks management endpoints
  /// NOTE: The frontend expects these endpoints which need to be created in the backend:
  /// - /tasks (CRUD for task templates)
  /// - /tasks_list (POST - list with filters)
  /// - /tasks_priorities (CRUD)
  /// - /unity (CRUD)
  /// - /discipline (CRUD)
  /// TODO: Create /api/v1/tasks module in backend or update frontend calls
  static String get tasksPath => '$baseUrl/tasks';

  /// Reports endpoints: dashboard, daily reports, burndown
  static String get reportsPath => '$baseUrl/reports';

  /// Inventory management endpoints
  static String get inventoryPath => '$baseUrl/inventory';

  /// Manufacturers endpoints
  static String get manufacturersPath => '$baseUrl/manufacturers';

  /// AI Agents endpoints
  static String get agentsPath => '$baseUrl/agents';

  /// Stripe payment endpoints
  static String get stripePath => '$baseUrl/stripe';

  /// Teams management endpoints
  static String get teamsPath => '$baseUrl/teams';

  /// Trackers management endpoints
  static String get trackersPath => '$baseUrl/trackers';

  // === Static Assets ===

  /// Default placeholder image for users without profile picture
  /// Previously hosted on Xano Vault, now using a CDN or local asset
  static const String noPhotoPlaceholder =
      'https://ui-avatars.com/api/?background=cccccc&color=666666&name=User&size=256';

  /// Alternative: Use a publicly accessible placeholder image
  static const String noPhotoPlaceholderAlt =
      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
}
