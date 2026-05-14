import 'package:dio/dio.dart';
import '../models/user_model.dart';
import '../core/network/dio_client.dart';

class AuthService {
  final _dio = DioClient().dio;

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post('/student/login', data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Login failed';
    }
  }

  Future<Map<String, dynamic>> register(String name, String email, String password, String phone) async {
    try {
      final response = await _dio.post('/student/register', data: {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
      });
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Registration failed';
    }
  }

  Future<UserModel> getMe() async {
    try {
      final response = await _dio.get('/student/me');
      return UserModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to fetch user';
    }
  }
}
