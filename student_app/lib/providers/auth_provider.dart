import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../core/constants/app_constants.dart';

class AuthProvider extends ChangeNotifier {
  final _authService = AuthService();
  
  UserModel? _user;
  String? _token;
  bool _isLoading = false;

  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  AuthProvider() {
    _loadAuthData();
  }

  Future<void> _loadAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(AppConstants.tokenKey);
    final userJson = prefs.getString(AppConstants.userKey);

    if (_token != null) {
      if (userJson != null) {
        _user = UserModel.fromJson(jsonDecode(userJson));
      }
      notifyListeners();

      // Validate the token against the server — automatically logs user directly into dashboard if valid (7-day token)
      // If token has expired or device mismatched, getMe fails with 401 and session is cleared
      try {
        final freshUser = await _authService.getMe();
        _user = freshUser;
        await prefs.setString(AppConstants.userKey, jsonEncode(_user!.toJson()));
      } catch (_) {
        _token = null;
        _user = null;
        await prefs.remove(AppConstants.tokenKey);
        await prefs.remove(AppConstants.userKey);
      }
    }

    notifyListeners();
  }

  Future<void> login(String name, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _authService.login(name, password);
      _token = res['data']['token'];
      _user = UserModel.fromJson(res['data']);
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, _token!);
      await prefs.setString(AppConstants.userKey, jsonEncode(_user!.toJson()));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(String name, String email, String password, String phone) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _authService.register(name, email, password, phone);
      _token = res['data']['token'];
      _user = UserModel.fromJson(res['data']);
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, _token!);
      await prefs.setString(AppConstants.userKey, jsonEncode(_user!.toJson()));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
    notifyListeners();
  }
}
