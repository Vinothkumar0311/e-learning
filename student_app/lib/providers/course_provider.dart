import 'package:flutter/material.dart';
import '../models/course_model.dart';
import '../services/course_service.dart';

class CourseProvider extends ChangeNotifier {
  final _courseService = CourseService();
  
  List<CourseModel> _courses = [];
  bool _isLoading = false;

  CourseProvider() {
    startAutoRefresh();
  }

  List<CourseModel> get courses => _courses;
  bool get isLoading => _isLoading;

  Future<void> fetchCourses({bool showLoading = true}) async {
    if (showLoading) {
      _isLoading = true;
      notifyListeners();
    }

    try {
      _courses = await _courseService.getCourses();
    } catch (e) {
      debugPrint('Error fetching courses: $e');
      // We keep old courses on error to avoid flickering, 
      // but you could also show an error message if needed.
    } finally {
      if (showLoading) {
        _isLoading = false;
      }
      notifyListeners();
    }
  }

  void startAutoRefresh() {
    // Poll every 10 seconds for updates during development/testing
    Future.doWhile(() async {
      try {
        await Future.delayed(const Duration(seconds: 10));
        await fetchCourses(showLoading: false);
      } catch (e) {
        debugPrint('Auto-refresh failed: $e');
      }
      return true; // continue polling regardless of error
    });
  }
}
