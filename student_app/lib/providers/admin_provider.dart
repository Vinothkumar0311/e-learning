import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../models/admin_model.dart';
import '../models/course_model.dart';
import '../services/admin_service.dart';

class AdminProvider extends ChangeNotifier {
  final AdminService _adminService = AdminService();

  String? _adminToken;
  Map<String, dynamic>? _adminUser;
  bool _isLoading = false;

  AdminStats? _stats;
  List<dynamic> _recentEnrollments = [];
  List<AdminStudent> _students = [];
  List<AdminPayment> _payments = [];
  List<CourseModel> _courses = [];
  List<dynamic> _activeSessions = [];
  List<dynamic> _auditLogs = [];
  int _auditTotal = 0;

  String? get adminToken => _adminToken;
  Map<String, dynamic>? get adminUser => _adminUser;
  bool get isAdminAuthenticated => _adminToken != null;
  bool get isLoading => _isLoading;

  AdminStats? get stats => _stats;
  List<dynamic> get recentEnrollments => _recentEnrollments;
  List<AdminStudent> get students => _students;
  List<AdminPayment> get payments => _payments;
  List<CourseModel> get courses => _courses;
  List<dynamic> get activeSessions => _activeSessions;
  List<dynamic> get auditLogs => _auditLogs;
  int get auditTotal => _auditTotal;

  AdminProvider() {
    _loadAdminData();
  }

  Future<void> _loadAdminData() async {
    final prefs = await SharedPreferences.getInstance();
    _adminToken = prefs.getString(AppConstants.adminTokenKey);
    final userJson = prefs.getString(AppConstants.adminUserKey);

    if (userJson != null) {
      _adminUser = jsonDecode(userJson) as Map<String, dynamic>;
    }
    notifyListeners();
  }

  Future<void> loginAdmin(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _adminService.login(email, password);
      final data = res['data'] ?? res;
      _adminToken = data['token'];
      _adminUser = data;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.adminTokenKey, _adminToken!);
      await prefs.setString(AppConstants.adminUserKey, jsonEncode(_adminUser));

      await fetchDashboardData();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logoutAdmin() async {
    _adminToken = null;
    _adminUser = null;
    _stats = null;
    _students = [];
    _payments = [];
    _courses = [];

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.adminTokenKey);
    await prefs.remove(AppConstants.adminUserKey);
    notifyListeners();
  }

  Future<void> fetchDashboardData() async {
    _isLoading = true;
    notifyListeners();

    try {
      _stats = await _adminService.getStats();
      _recentEnrollments = await _adminService.getRecentEnrollments();
    } catch (e) {
      debugPrint('Error fetching stats: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchStudents() async {
    _isLoading = true;
    notifyListeners();

    try {
      _students = await _adminService.getStudents();
    } catch (e) {
      debugPrint('Error fetching students: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createStudent(String name, String email, String password, String phone) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.createStudent(name, email, password, phone);
      await fetchStudents();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleStudentStatus(dynamic studentId) async {
    try {
      await _adminService.toggleStudentStatus(studentId);
      await fetchStudents();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> assignCourses(dynamic studentId, List<int> courseIds) async {
    try {
      await _adminService.assignCourses(studentId, courseIds);
      await fetchStudents();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> fetchPayments({String? status}) async {
    _isLoading = true;
    notifyListeners();

    try {
      _payments = await _adminService.getPayments(status: status);
    } catch (e) {
      debugPrint('Error fetching payments: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> verifyPayment(dynamic paymentId, String status, {String? notes}) async {
    try {
      await _adminService.verifyPayment(paymentId, status, notes: notes);
      await fetchPayments();
      await fetchDashboardData();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> fetchCourses() async {
    _isLoading = true;
    notifyListeners();

    try {
      _courses = await _adminService.getCourses();
    } catch (e) {
      debugPrint('Error fetching courses: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createCourse(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.createCourse(data);
      await fetchCourses();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateCourse(dynamic courseId, Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.updateCourse(courseId, data);
      await fetchCourses();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteCourse(dynamic courseId) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.deleteCourse(courseId);
      await fetchCourses();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String> uploadFile(String filePath) async {
    return await _adminService.uploadFile(filePath);
  }

  Future<void> createModule(dynamic courseId, Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.createModule(courseId, data);
      await fetchCourses();
      try {
        await fetchCourseDetails(courseId);
      } catch (_) {}
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateModule(dynamic courseId, dynamic moduleId, Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.updateModule(courseId, moduleId, data);
      await fetchCourses();
      try {
        await fetchCourseDetails(courseId);
      } catch (_) {}
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteModule(dynamic courseId, dynamic moduleId) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.deleteModule(courseId, moduleId);
      await fetchCourses();
      try {
        await fetchCourseDetails(courseId);
      } catch (_) {}
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createMultipleModules(dynamic courseId, List<Map<String, dynamic>> modules, {int? sectionId}) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.createMultipleModules(courseId, modules, sectionId: sectionId);
      await fetchCourses();
      try {
        await fetchCourseDetails(courseId);
      } catch (_) {}
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<CourseModel> fetchCourseDetails(dynamic courseId) async {
    try {
      final updated = await _adminService.getCourse(courseId);
      final idx = _courses.indexWhere((c) => c.id == updated.id);
      if (idx != -1) {
        _courses[idx] = updated;
        notifyListeners();
      }
      return updated;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> createSection(dynamic courseId, Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.createSection(courseId, data);
      await fetchCourses();
      try {
        await fetchCourseDetails(courseId);
      } catch (_) {}
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateSection(dynamic courseId, dynamic sectionId, Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.updateSection(courseId, sectionId, data);
      await fetchCourses();
      try {
        await fetchCourseDetails(courseId);
      } catch (_) {}
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteSection(dynamic courseId, dynamic sectionId) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.deleteSection(courseId, sectionId);
      await fetchCourses();
      try {
        await fetchCourseDetails(courseId);
      } catch (_) {}
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── Security Management Actions ──────────────────────────────────────────
  Future<void> fetchActiveSessions() async {
    _isLoading = true;
    notifyListeners();

    try {
      _activeSessions = await _adminService.getActiveSessions();
    } catch (e) {
      debugPrint('Error fetching active sessions: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> forceLogoutSession(String sessionId) async {
    try {
      await _adminService.forceLogoutSession(sessionId);
      await fetchActiveSessions();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> reactivateStudentAccount(dynamic studentId) async {
    try {
      await _adminService.reactivateStudentAccount(studentId);
      await fetchStudents();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> resetStudentDevice(dynamic studentId) async {
    try {
      await _adminService.resetStudentDevice(studentId);
      await fetchStudents();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> fetchAuditLogs({String? eventType, String? search}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _adminService.getAuditLogs(eventType: eventType, search: search);
      _auditLogs = res['logs'] ?? [];
      _auditTotal = res['total'] ?? 0;
    } catch (e) {
      debugPrint('Error fetching audit logs: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }



  Future<Map<String, dynamic>> getAppVersionSettings() async {
    return await _adminService.getAppVersionSettings();
  }

  Future<void> updateAppVersionSettings(Map<String, dynamic> settings) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _adminService.updateAppVersionSettings(settings);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

