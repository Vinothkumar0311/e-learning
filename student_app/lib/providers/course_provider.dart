import 'package:flutter/material.dart';
import '../models/course_model.dart';
import '../services/course_service.dart';

class CourseProvider extends ChangeNotifier {
  final _courseService = CourseService();
  
  List<CourseModel> _courses = [];
  bool _isLoading = false;

  List<CourseModel> get courses => _courses;
  bool get isLoading => _isLoading;

  Future<void> fetchCourses() async {
    _isLoading = true;
    notifyListeners();

    try {
      _courses = await _courseService.getCourses();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
