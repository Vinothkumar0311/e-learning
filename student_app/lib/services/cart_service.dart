import 'dart:io';
import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';
import '../models/cart_model.dart';
import '../models/course_model.dart';
import '../models/enrollment_status_model.dart';
import '../core/utils/error_handler.dart';

class CartService {
  final _dio = DioClient().dio;

  Future<CartModel> getCart() async {
    try {
      final response = await _dio.get('/student/cart');
      return CartModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to load your cart');
    }
  }

  Future<void> addToCart(int courseId) async {
    try {
      await _dio.post('/student/cart/add', data: {'course_id': courseId});
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to add course to cart');
    }
  }

  Future<void> removeFromCart(int itemId) async {
    try {
      await _dio.delete('/student/cart/$itemId');
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to remove item from cart');
    }
  }

  Future<void> checkout() async {
    try {
      await _dio.post('/student/cart/checkout');
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Checkout failed');
    }
  }

  Future<List<EnrollmentStatusModel>> getMyEnrollments() async {
    try {
      final response = await _dio.get('/student/my-enrollments');
      final List data = response.data['data'] as List? ?? [];
      return data.map((e) => EnrollmentStatusModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to get enrollments');
    }
  }

  /// Returns only fully enrolled (purchased) courses — for "My Courses" tab
  Future<List<CourseModel>> getMyCourses() async {
    try {
      final response = await _dio.get('/student/my-courses');
      final List data = response.data['data'] as List? ?? [];
      return data.map((e) => CourseModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to load your courses');
    }
  }

  Future<void> uploadPaymentProof(int paymentId, String filePath) async {
    try {
      final file = File(filePath);
      final fileName = file.path.split('/').last;
      final formData = FormData.fromMap({
        'proof': await MultipartFile.fromFile(file.path, filename: fileName),
      });
      await _dio.post('/payments/$paymentId/proof', data: formData);
    } on DioException catch (e) {
      throw ErrorHandler.getErrorMessage(e, 'Failed to upload screenshot proof');
    }
  }
}
