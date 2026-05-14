import 'package:flutter/material.dart';

class AppConstants {
  static const String appName = 'EduStudent';
  
  // Use 10.0.2.2 for Android emulator to access localhost
  static const String baseUrl = 'http://10.0.2.2:5000/api';
  
  static const Color primaryColor = Color(0xFF6366F1); // Indigo
  static const Color secondaryColor = Color(0xFFA855F7); // Purple
  
  static const String tokenKey = 'student_token';
  static const String userKey = 'student_data';
}
