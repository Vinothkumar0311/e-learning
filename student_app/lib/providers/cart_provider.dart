import 'package:flutter/material.dart';
import '../models/cart_model.dart';
import '../models/course_model.dart';
import '../models/enrollment_status_model.dart';
import '../services/cart_service.dart';

class CartProvider extends ChangeNotifier {
  final _cartService = CartService();

  CartModel? _cart;
  List<EnrollmentStatusModel> _myEnrollments = [];
  List<CourseModel> _myCourses = [];
  bool _isLoading = false;
  String? _error;

  CartProvider() {
    fetchCart();
    fetchEnrollments();
    fetchMyCourses();
    startPolling();
  }

  CartModel? get cart => _cart;
  List<EnrollmentStatusModel> get myEnrollments => _myEnrollments;
  List<CourseModel> get myCourses => _myCourses;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get cartCount => _cart?.items.length ?? 0;
  double get cartTotal =>
      _cart?.items.fold(0.0, (sum, item) => sum! + item.priceAtAdd) ?? 0.0;

  /// Returns whether the student is fully enrolled in the given course
  bool isEnrolled(int courseId) {
    return _myCourses.any((c) => c.id == courseId);
  }

  /// Returns whether the student has a pending/in-progress enrollment
  bool hasPendingEnrollment(int courseId) {
    return _myEnrollments.any((e) {
      if (e.courseId != courseId) return false;
      final s = e.requestStatus.toLowerCase();
      return s != 'enrolled' && s != 'paymentverified' && s != 'rejected';
    });
  }

  /// Returns whether the course is already in the active cart
  bool isInCart(int courseId) {
    return _cart?.items.any((item) => item.courseId == courseId) ?? false;
  }

  Future<void> fetchCart({bool showLoading = true}) async {
    if (showLoading) {
      _isLoading = true;
      _error = null;
      notifyListeners();
    }
    try {
      _cart = await _cartService.getCart();
    } catch (e) {
      _error = e.toString();
    } finally {
      if (showLoading) _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchEnrollments({bool showLoading = true}) async {
    if (showLoading) {
      _isLoading = true;
      _error = null;
      notifyListeners();
    }
    try {
      _myEnrollments = await _cartService.getMyEnrollments();
    } catch (e) {
      _error = e.toString();
    } finally {
      if (showLoading) _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchMyCourses({bool showLoading = false}) async {
    try {
      _myCourses = await _cartService.getMyCourses();
      notifyListeners();
    } catch (_) {
      // Silent — My Courses failing shouldn't break the app
    }
  }

  Future<void> addToCart(int courseId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _cartService.addToCart(courseId);
      await fetchCart(showLoading: false);
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> removeFromCart(int itemId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _cartService.removeFromCart(itemId);
      await fetchCart(showLoading: false);
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> checkout() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _cartService.checkout();
      _cart = null;
      await fetchEnrollments(showLoading: false);
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> uploadProof(int paymentId, String filePath) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _cartService.uploadPaymentProof(paymentId, filePath);
      await fetchEnrollments(showLoading: false);
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void startPolling() {
    Future.doWhile(() async {
      try {
        await Future.delayed(const Duration(seconds: 10));
        await fetchCart(showLoading: false);
        await fetchEnrollments(showLoading: false);
        await fetchMyCourses(showLoading: false);
      } catch (e) {
        debugPrint('Cart auto-sync failed: $e');
      }
      return true;
    });
  }
}
