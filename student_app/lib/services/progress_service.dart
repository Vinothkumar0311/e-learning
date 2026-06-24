import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';
import '../models/progress_model.dart';
import '../core/utils/error_handler.dart';

class ProgressService {
  final _dio = DioClient().dio;

  Future<void> markModuleComplete(int moduleId, int courseId) async {
    try {
      await _dio.post(
        '/student/progress/mark',
        data: {
          'module_id': moduleId,
          'course_id': courseId,
        },
      );
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to update progress');
    }
  }

  Future<PerformanceDashboardModel> getPerformanceSummary() async {
    try {
      final response = await _dio.get('/student/performance');
      return PerformanceDashboardModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to load progress details');
    }
  }
}
