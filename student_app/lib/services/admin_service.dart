import 'dart:convert';
import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';
import '../core/utils/error_handler.dart';
import '../models/admin_model.dart';
import '../models/course_model.dart';

class AdminService {
  final _dio = DioClient().dio;

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final data = response.data;
      if (data is String) {
        return jsonDecode(data) as Map<String, dynamic>;
      }
      return Map<String, dynamic>.from(data as Map);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Admin Login Failed');
    }
  }

  Future<AdminStats> getStats() async {
    try {
      final response = await _dio.get('/dashboard/stats');
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final payload = (map is Map && map.containsKey('data')) ? map['data'] : map;
      return AdminStats.fromJson(Map<String, dynamic>.from(payload as Map));
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to load dashboard stats');
    }
  }

  Future<List<dynamic>> getRecentEnrollments() async {
    try {
      final response = await _dio.get('/dashboard/recent-enrollments');
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final rawData = map is Map ? map['data'] : map;
      return rawData is List ? rawData : [];
    } catch (_) {
      return [];
    }
  }

  Future<List<AdminStudent>> getStudents() async {
    try {
      final response = await _dio.get('/students', queryParameters: {'limit': 100});
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final rawData = map is Map ? map['data'] : null;

      List list = [];
      if (rawData is List) {
        list = rawData;
      } else if (rawData is Map && rawData['students'] is List) {
        list = rawData['students'] as List;
      }

      return list
          .whereType<Map>()
          .map((item) => AdminStudent.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to load students');
    }
  }

  Future<void> createStudent(String name, String email, String password, String phone) async {
    try {
      await _dio.post('/students/create', data: {
        'name': name,
        'email': email.isNotEmpty ? email : null,
        'mobile_number': phone,
        'phone': phone,
        'password': password,
      });
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to create student');
    }
  }

  Future<void> toggleStudentStatus(dynamic studentId) async {
    try {
      await _dio.patch('/students/$studentId/toggle-status');
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to update student status');
    }
  }

  Future<void> assignCourses(dynamic studentId, List<int> courseIds) async {
    try {
      await _dio.post('/students/$studentId/assign-courses', data: {
        'course_ids': courseIds,
      });
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to assign courses');
    }
  }

  Future<List<AdminPayment>> getPayments({String? status}) async {
    try {
      final response = await _dio.get('/payments', queryParameters: {
        'limit': 100,
        if (status != null) 'status': status,
      });
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final rawData = map is Map ? map['data'] : null;

      List list = [];
      if (rawData is List) {
        list = rawData;
      } else if (rawData is Map && rawData['payments'] is List) {
        list = rawData['payments'] as List;
      }

      return list
          .whereType<Map>()
          .map((item) => AdminPayment.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to load payments');
    }
  }

  Future<void> verifyPayment(dynamic paymentId, String status, {String? notes}) async {
    try {
      final backendStatus = (status.toUpperCase() == 'VERIFIED' || status.toUpperCase() == 'PAID') ? 'paid' : 'failed';
      await _dio.patch('/payments/$paymentId/verify', data: {
        'status': backendStatus,
        if (notes != null) 'remarks': notes,
      });
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to verify payment');
    }
  }

  Future<List<CourseModel>> getCourses() async {
    try {
      final response = await _dio.get('/courses');
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final rawData = map is Map ? map['data'] : null;

      List list = [];
      if (rawData is List) {
        list = rawData;
      } else if (rawData is Map && rawData['courses'] is List) {
        list = rawData['courses'] as List;
      }

      return list
          .whereType<Map>()
          .map((item) => CourseModel.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to load courses');
    }
  }

  Future<CourseModel> createCourse(Map<String, dynamic> courseData) async {
    try {
      final response = await _dio.post('/courses', data: courseData);
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final resData = map is Map ? (map['data'] ?? map) : map;
      return CourseModel.fromJson(Map<String, dynamic>.from(resData as Map));
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to create course');
    }
  }

  Future<CourseModel> updateCourse(dynamic courseId, Map<String, dynamic> courseData) async {
    try {
      final response = await _dio.put('/courses/$courseId', data: courseData);
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final resData = map is Map ? (map['data'] ?? map) : map;
      return CourseModel.fromJson(Map<String, dynamic>.from(resData as Map));
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to update course');
    }
  }

  Future<void> deleteCourse(dynamic courseId) async {
    try {
      await _dio.delete('/courses/$courseId');
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to delete course');
    }
  }

  Future<String> uploadFile(String filePath) async {
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });
      final response = await _dio.post('/courses/upload', data: formData);
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final resData = map is Map ? map['data'] : null;
      return resData?['fileUrl'] ?? '';
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to upload file');
    }
  }

  Future<CourseModuleModel> createModule(dynamic courseId, Map<String, dynamic> moduleData) async {
    try {
      final response = await _dio.post('/courses/$courseId/modules', data: moduleData);
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      dynamic resData = map is Map ? (map['data'] ?? map) : map;
      if (resData is List && resData.isNotEmpty) {
        resData = resData.first;
      }
      if (resData is Map) {
        return CourseModuleModel.fromJson(Map<String, dynamic>.from(resData));
      }
      return CourseModuleModel(
        id: 0,
        title: moduleData['title']?.toString() ?? '',
        type: moduleData['type']?.toString() ?? 'video',
        duration: moduleData['duration'] is int ? moduleData['duration'] : null,
        youtubeUrl: moduleData['youtube_url']?.toString(),
        fileUrl: moduleData['file_url']?.toString(),
        order: moduleData['order'] is int ? moduleData['order'] : 0,
        sectionId: moduleData['section_id'] != null ? int.tryParse(moduleData['section_id'].toString()) : null,
        isFree: moduleData['is_free'] == true,
      );
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to create module');
    } catch (e) {
      throw e.toString();
    }
  }

  Future<CourseModuleModel> updateModule(dynamic courseId, dynamic moduleId, Map<String, dynamic> moduleData) async {
    try {
      final response = await _dio.put('/courses/$courseId/modules/$moduleId', data: moduleData);
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      dynamic resData = map is Map ? (map['data'] ?? map) : map;
      if (resData is List && resData.isNotEmpty) {
        resData = resData.first;
      }
      if (resData is Map) {
        return CourseModuleModel.fromJson(Map<String, dynamic>.from(resData));
      }
      return CourseModuleModel(
        id: int.tryParse(moduleId.toString()) ?? 0,
        title: moduleData['title']?.toString() ?? '',
        type: moduleData['type']?.toString() ?? 'video',
        duration: moduleData['duration'] is int ? moduleData['duration'] : null,
        youtubeUrl: moduleData['youtube_url']?.toString(),
        fileUrl: moduleData['file_url']?.toString(),
        order: moduleData['order'] is int ? moduleData['order'] : 0,
        sectionId: moduleData['section_id'] != null ? int.tryParse(moduleData['section_id'].toString()) : null,
        isFree: moduleData['is_free'] == true,
      );
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to update module');
    } catch (e) {
      throw e.toString();
    }
  }

  Future<void> deleteModule(dynamic courseId, dynamic moduleId) async {
    try {
      await _dio.delete('/courses/$courseId/modules/$moduleId');
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to delete module');
    }
  }

  // ─── Security & Audit Management ─────────────────────────────────────────
  Future<List<dynamic>> getActiveSessions() async {
    try {
      final response = await _dio.get('/security/sessions');
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final raw = map is Map ? map['data'] : map;
      return raw is List ? raw : [];
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to fetch active sessions');
    }
  }

  Future<void> forceLogoutSession(String sessionId) async {
    try {
      await _dio.delete('/security/sessions/$sessionId');
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to force logout session');
    }
  }

  Future<void> reactivateStudentAccount(dynamic studentId) async {
    try {
      await _dio.post('/security/students/$studentId/reactivate');
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to reactivate student account');
    }
  }

  Future<Map<String, dynamic>> getAuditLogs({String? eventType, String? search, int page = 1}) async {
    try {
      final response = await _dio.get('/security/audit-logs', queryParameters: {
        if (eventType != null && eventType.isNotEmpty) 'event_type': eventType,
        if (search != null && search.isNotEmpty) 'search': search,
        'page': page,
        'limit': 50,
      });
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final raw = map is Map ? map['data'] : map;
      return Map<String, dynamic>.from(raw as Map);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to fetch security audit logs');
    }
  }

  Future<CourseModel> getCourse(dynamic courseId) async {
    try {
      final response = await _dio.get('/courses/$courseId');
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final resData = map is Map ? (map['data'] ?? map) : map;
      return CourseModel.fromJson(Map<String, dynamic>.from(resData as Map));
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to load course details');
    }
  }

  Future<List<CourseSectionModel>> getSections(dynamic courseId) async {
    try {
      final response = await _dio.get('/courses/$courseId/sections');
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      final rawData = map is Map ? map['data'] : map;
      final list = rawData is List ? rawData : [];
      return list
          .whereType<Map>()
          .map((item) => CourseSectionModel.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to load sections');
    }
  }

  Future<void> createSection(dynamic courseId, Map<String, dynamic> sectionData) async {
    try {
      await _dio.post('/courses/$courseId/sections', data: sectionData);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to create section');
    }
  }

  Future<void> updateSection(dynamic courseId, dynamic sectionId, Map<String, dynamic> sectionData) async {
    try {
      await _dio.put('/courses/$courseId/sections/$sectionId', data: sectionData);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to update section');
    }
  }

  Future<void> deleteSection(dynamic courseId, dynamic sectionId) async {
    try {
      await _dio.delete('/courses/$courseId/sections/$sectionId');
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to delete section');
    }
  }

  Future<void> createMultipleModules(dynamic courseId, List<Map<String, dynamic>> modules, {int? sectionId}) async {
    if (modules.isEmpty) return;

    for (var i = 0; i < modules.length; i++) {
      final mod = modules[i];
      final payload = Map<String, dynamic>.from(mod);
      if (sectionId != null && !payload.containsKey('section_id')) {
        payload['section_id'] = sectionId;
      }
      if (!payload.containsKey('order')) {
        payload['order'] = i;
      }
      try {
        await _dio.post('/courses/$courseId/modules', data: payload);
      } on DioException catch (e) {
        throw ErrorHandler.getErrorMessage(e, 'Failed to add video "${mod['title'] ?? 'Lesson'}"');
      } catch (e) {
        throw e.toString();
      }
    }
  }

  Future<Map<String, dynamic>> getAppVersionSettings() async {
    try {
      final response = await _dio.get('/app/version');
      final data = response.data;
      final map = data is String ? jsonDecode(data) : data;
      return Map<String, dynamic>.from((map is Map && map.containsKey('data')) ? map['data'] : map);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to fetch app version settings');
    }
  }

  Future<void> updateAppVersionSettings(Map<String, dynamic> settings) async {
    try {
      await _dio.put('/app/version', data: settings);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to update app version settings');
    }
  }

  Future<void> resetStudentDevice(dynamic studentId) async {
    try {
      await _dio.post('/students/$studentId/reset-device');
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to reset student device');
    }
  }
}


