import 'dart:convert';
import 'package:dio/dio.dart';
import '../models/user_model.dart';
import '../core/network/dio_client.dart';
import '../core/utils/error_handler.dart';

class AuthService {
  final _dio = DioClient().dio;

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      print("DEBUG: login request to ${_dio.options.baseUrl}/student/login");
      final response = await _dio.post('/student/login', data: {
        'email': email,
        'password': password,
      });
      final data = response.data;
      if (data is String) {
        return jsonDecode(data) as Map<String, dynamic>;
      }
      return data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Login failed');
    }
  }

  Future<Map<String, dynamic>> register(String name, String email, String password, String phone) async {
    try {
      print("DEBUG: register request to ${_dio.options.baseUrl}/student/register");
      final response = await _dio.post('/student/register', data: {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
      });
      final data = response.data;
      if (data is String) {
        return jsonDecode(data) as Map<String, dynamic>;
      }
      return data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Registration failed');
    }
  }

  Future<UserModel> getMe() async {
    try {
      final response = await _dio.get('/student/me');
      final data = response.data;
      final Map<String, dynamic> mappedData = data is String 
          ? jsonDecode(data) as Map<String, dynamic>
          : data as Map<String, dynamic>;
      return UserModel.fromJson(mappedData['data']);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to fetch user');
    }
  }
}
