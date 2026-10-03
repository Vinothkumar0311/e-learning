import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:screen_protector/screen_protector.dart';
import '../core/network/dio_client.dart';

class SecurityService {
  static const String _deviceIdKey = 'app_unique_device_id';
  static final SecurityService _instance = SecurityService._internal();

  factory SecurityService() => _instance;
  SecurityService._internal();

  String? _cachedDeviceId;
  String? _cachedDeviceName;

  /// Retrieves or generates a persistent Unique Device ID
  Future<String> getDeviceId() async {
    if (_cachedDeviceId != null) return _cachedDeviceId!;

    final prefs = await SharedPreferences.getInstance();
    String? storedId = prefs.getString(_deviceIdKey);

    if (storedId != null && storedId.isNotEmpty) {
      _cachedDeviceId = storedId;
      return storedId;
    }

    // Try to get hardware ID from device_info_plus
    final deviceInfo = DeviceInfoPlugin();
    String newId = '';

    try {
      if (kIsWeb) {
        final webInfo = await deviceInfo.webBrowserInfo;
        newId = 'web_${webInfo.vendor}_${webInfo.userAgent.hashCode}';
      } else if (Platform.isAndroid) {
        final androidInfo = await deviceInfo.androidInfo;
        newId = androidInfo.id.isNotEmpty 
            ? 'android_${androidInfo.id}' 
            : 'android_${androidInfo.hardware}_${androidInfo.model.hashCode}';
      } else if (Platform.isIOS) {
        final iosInfo = await deviceInfo.iosInfo;
        newId = iosInfo.identifierForVendor ?? 'ios_${iosInfo.name.hashCode}';
      } else if (Platform.isLinux) {
        final linuxInfo = await deviceInfo.linuxInfo;
        newId = 'linux_${linuxInfo.machineId ?? linuxInfo.name}';
      }
    } catch (e) {
      debugPrint('Error getting device info: $e');
    }

    if (newId.isEmpty) {
      newId = 'dev_${DateTime.now().millisecondsSinceEpoch}_${(1000 + (DateTime.now().microsecondsSinceEpoch % 9000))}';
    }

    _cachedDeviceId = newId;
    await prefs.setString(_deviceIdKey, newId);
    return newId;
  }

  /// Get device human-readable name (e.g. "Pixel 7", "iPhone 14")
  Future<String> getDeviceName() async {
    if (_cachedDeviceName != null) return _cachedDeviceName!;

    final deviceInfo = DeviceInfoPlugin();
    String name = 'Mobile Device';

    try {
      if (kIsWeb) {
        final webInfo = await deviceInfo.webBrowserInfo;
        name = webInfo.browserName.name;
      } else if (Platform.isAndroid) {
        final androidInfo = await deviceInfo.androidInfo;
        name = '${androidInfo.manufacturer} ${androidInfo.model}';
      } else if (Platform.isIOS) {
        final iosInfo = await deviceInfo.iosInfo;
        name = iosInfo.name;
      } else if (Platform.isLinux) {
        name = 'Linux Desktop';
      }
    } catch (_) {}

    _cachedDeviceName = name;
    return name;
  }

  /// Enable screenshot & screen recording protection
  Future<void> enableScreenshotProtection() async {
    try {
      await ScreenProtector.protectDataLeakageWithColor(const Color(0xFF0F172A));
      await ScreenProtector.preventScreenshotOn();
    } catch (e) {
      debugPrint('Screenshot protection activation notice: $e');
    }
  }

  /// Disable screenshot protection if needed
  Future<void> disableScreenshotProtection() async {
    try {
      await ScreenProtector.preventScreenshotOff();
      await ScreenProtector.protectDataLeakageOff();
    } catch (e) {
      debugPrint('Screenshot protection deactivation notice: $e');
    }
  }

  /// Send security violation log to server (screenshot or screen record detection)
  Future<void> logSecurityViolation(String eventType, {Map<String, dynamic>? details}) async {
    try {
      final dio = DioClient().dio;
      final deviceName = await getDeviceName();
      await dio.post('/security/log', data: {
        'event_type': eventType,
        'device_name': deviceName,
        'details': details ?? {}
      });
    } catch (e) {
      debugPrint('Failed to log security violation: $e');
    }
  }
}
