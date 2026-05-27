import 'package:dio/dio.dart';
import '../models/course_model.dart';
import '../core/network/dio_client.dart';
import '../core/utils/error_handler.dart';

class CourseService {
  final _dio = DioClient().dio;

  Future<List<CourseModel>> getCourses() async {
    try {
      final response = await _dio.get('/student/courses');
      final List data = response.data['data'];
      return data.map((e) => CourseModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to fetch courses');
    }
  }

  Future<CourseModel> getCourse(int id) async {
    try {
      final response = await _dio.get('/student/courses/$id');
      return CourseModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to fetch course');
    }
  }
}
