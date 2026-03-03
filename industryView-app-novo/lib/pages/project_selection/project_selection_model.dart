import '/core/base/page_model.dart';
import '/backend/api_requests/api_calls.dart';
import 'project_selection_widget.dart';

class ProjectSelectionModel extends PageModel<ProjectSelectionWidget> {
  ApiCallResponse? projectsResponse;
  bool isLoading = true;
  int? selectedProjectId;

  @override
  void initState(context) {}

  @override
  void dispose() {}
}
