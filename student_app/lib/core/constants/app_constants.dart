import 'package:flutter/material.dart';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class AppConstants {
  static const String appName = 'Royal NEET Academy';
  
  // Use 127.0.0.1 with adb reverse for physical devices, or 10.0.2.2 for Android emulator
  static final String baseUrl = (!kIsWeb && Platform.isAndroid)
      ? 'https://royalneetapi.vinothvk.in/api'
      : 'https://royalneetapi.vinothvk.in/api';
  
  static const Color primaryColor = Color(0xFF6366F1); // Indigo
  static const Color secondaryColor = Color(0xFFA855F7); // Purple
  
  static const String tokenKey = 'student_token';
  static const String userKey = 'student_data';
  static const String adminTokenKey = 'admin_token';
  static const String adminUserKey = 'admin_data';
}
