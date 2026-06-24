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
      // Restore cached user first so UI doesn't flicker
      if (userJson != null) {
        _user = UserModel.fromJson(jsonDecode(userJson));
      }
      notifyListeners();

      // Validate the token against the server — if the account was deleted or
      // the DB was reset the server returns 401, so we clear the stale session.
      try {
        final freshUser = await _authService.getMe();
        _user = freshUser;
        await prefs.setString(AppConstants.userKey, jsonEncode(_user!.toJson()));
      } catch (_) {
        // Token is invalid / account gone — force logout
        _token = null;
        _user = null;
        await prefs.remove(AppConstants.tokenKey);
        await prefs.remove(AppConstants.userKey);
      }
    }

    notifyListeners();
  }

  Future<void> login(String name, String password) async {
    print("provider login here");
    print("name : $name");
    print("password : $password");
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
    print("provider res here");
    print("email : $email");
    print("password : $password");
    print("phone : $phone");
    print("name : $name");
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
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
    notifyListeners();
  }
}
