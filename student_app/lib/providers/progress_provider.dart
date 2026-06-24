import 'package:flutter/material.dart';
import '../models/progress_model.dart';
import '../services/progress_service.dart';

class ProgressProvider extends ChangeNotifier {
  final _progressService = ProgressService();

  PerformanceDashboardModel? _dashboardData;
  bool _isLoading = false;
  String? _error;

  PerformanceDashboardModel? get dashboardData => _dashboardData;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchPerformance({bool showLoading = true}) async {
    if (showLoading) {
      _isLoading = true;
      _error = null;
      notifyListeners();
    }
    try {
      _dashboardData = await _progressService.getPerformanceSummary();
    } catch (e) {
      _error = e.toString();
    } finally {
      if (showLoading) {
        _isLoading = false;
      }
      notifyListeners();
    }
  }

  Future<void> markComplete(int courseId, int moduleId) async {
    try {
      // Optimistic update if dashboard data exists
      bool localUpdated = false;
      if (_dashboardData != null) {
        final courseIndex = _dashboardData!.courses.indexWhere((c) => c.courseId == courseId);
        if (courseIndex != -1) {
          final course = _dashboardData!.courses[courseIndex];
          if (!course.completedModuleIds.contains(moduleId)) {
            // Find module duration if available
            int modDuration = 0;
            
            final updatedModules = course.modules.map((m) {
              if (m.id == moduleId) {
                modDuration = m.duration ?? 0;
                return ProgressModuleModel(
                  id: m.id,
                  title: m.title,
                  type: m.type,
                  duration: m.duration,
                  isCompleted: true,
                );
              }
              return m;
            }).toList();

            final updatedCourse = CourseProgressModel(
              courseId: course.courseId,
              courseTitle: course.courseTitle,
              totalModules: course.totalModules,
              completedModules: course.completedModules + 1,
              completionPercent: course.totalModules > 0 
                  ? (((course.completedModules + 1) / course.totalModules) * 100).round() 
                  : 0,
              totalDurationMins: course.totalDurationMins,
              watchedDurationMins: course.watchedDurationMins + modDuration,
              completedModuleIds: [...course.completedModuleIds, moduleId],
              modules: updatedModules,
            );

            // Rebuild dashboard list
            final updatedCoursesList = [..._dashboardData!.courses];
            updatedCoursesList[courseIndex] = updatedCourse;

            // Rebuild summary
            final summary = _dashboardData!.summary;
            final updatedSummary = ProgressSummaryModel(
              totalCourses: summary.totalCourses,
              totalModules: summary.totalModules,
              completedModules: summary.completedModules + 1,
              overallCompletionPercent: summary.totalModules > 0 
                  ? (((summary.completedModules + 1) / summary.totalModules) * 100).round() 
                  : 0,
              totalDurationMins: summary.totalDurationMins,
              watchedDurationMins: summary.watchedDurationMins + modDuration,
            );

            _dashboardData = PerformanceDashboardModel(
              summary: updatedSummary,
              courses: updatedCoursesList,
            );
            localUpdated = true;
            notifyListeners();
          }
        }
      }

      await _progressService.markModuleComplete(moduleId, courseId);
      
      // If we couldn't do local optimistic update, or to sync with server
      if (!localUpdated) {
        await fetchPerformance(showLoading: false);
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  bool isCompleted(int courseId, int moduleId) {
    if (_dashboardData == null) return false;
    final course = _dashboardData!.courses.firstWhere(
      (c) => c.courseId == courseId,
      orElse: () => CourseProgressModel(
        courseId: 0,
        courseTitle: '',
        totalModules: 0,
        completedModules: 0,
        completionPercent: 0,
        totalDurationMins: 0,
        watchedDurationMins: 0,
        completedModuleIds: [],
        modules: [],
      ),
    );
    return course.completedModuleIds.contains(moduleId);
  }
}
