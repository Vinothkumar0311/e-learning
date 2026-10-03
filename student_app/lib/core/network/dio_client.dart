import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../../services/security_service.dart';

class DioClient {
  late Dio dio;

  DioClient() {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString(AppConstants.adminTokenKey) ?? prefs.getString(AppConstants.tokenKey);
          
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          // Attach persistent device ID to every API request
          final deviceId = await SecurityService().getDeviceId();
          options.headers['x-device-id'] = deviceId;

          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          final statusCode = e.response?.statusCode;
          final resData = e.response?.data;
          final errorCode = resData is Map ? resData['code'] : null;

          if (statusCode == 401 || (statusCode == 403 && errorCode == 'ACCOUNT_SUSPENDED')) {
            if (errorCode == 'TOKEN_EXPIRED' || errorCode == 'DEVICE_MISMATCH' || errorCode == 'ACCOUNT_SUSPENDED') {
              // Clear stale session
              final prefs = await SharedPreferences.getInstance();
              await prefs.remove(AppConstants.tokenKey);
              await prefs.remove(AppConstants.userKey);
            }
          }
          return handler.next(e);
        },
      ),
    );
  }
}
