import 'dart:io';
import 'dart:math';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:screen_protector/screen_protector.dart';
import '../core/network/dio_client.dart';

class SecurityService {
  static final SecurityService _instance = SecurityService._internal();

  factory SecurityService() => _instance;
  SecurityService._internal();

  String? _cachedDeviceId;
  String? _cachedDeviceName;

  static const String _deviceIdVersionKey = 'app_unique_device_id_v2';

  /// Generates a cryptographically secure UUID v4
  String _generateUuidV4() {
    final random = Random.secure();
    final values = List<int>.generate(16, (i) => random.nextInt(256));
    values[6] = (values[6] & 0x0f) | 0x40; // version 4
    values[8] = (values[8] & 0x3f) | 0x80; // variant
    return [
      values.sublist(0, 4).map((b) => b.toRadixString(16).padLeft(2, '0')).join(),
      values.sublist(4, 6).map((b) => b.toRadixString(16).padLeft(2, '0')).join(),
      values.sublist(6, 8).map((b) => b.toRadixString(16).padLeft(2, '0')).join(),
      values.sublist(8, 10).map((b) => b.toRadixString(16).padLeft(2, '0')).join(),
      values.sublist(10, 16).map((b) => b.toRadixString(16).padLeft(2, '0')).join(),
    ].join('-');
  }

  /// Retrieves or generates a persistent Unique Device ID
  Future<String> getDeviceId() async {
    if (_cachedDeviceId != null) return _cachedDeviceId!;

    final prefs = await SharedPreferences.getInstance();
    String? storedId = prefs.getString(_deviceIdVersionKey);

    // If already stored with v2 unique UUID format, use it
    if (storedId != null && storedId.isNotEmpty && storedId.contains('-')) {
      _cachedDeviceId = storedId;
      return storedId;
    }

    final deviceInfo = DeviceInfoPlugin();
    String prefix = 'dev';
    final uuid = _generateUuidV4();

    try {
      if (kIsWeb) {
        prefix = 'web';
      } else if (Platform.isAndroid) {
        final androidInfo = await deviceInfo.androidInfo;
        final brand = androidInfo.brand.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '').toLowerCase();
        final model = androidInfo.model.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '').toLowerCase();
        prefix = 'and_${brand}_$model';
      } else if (Platform.isIOS) {
        final iosInfo = await deviceInfo.iosInfo;
        final model = iosInfo.model.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '').toLowerCase();
        prefix = 'ios_$model';
      } else if (Platform.isLinux) {
        prefix = 'linux';
      }
    } catch (e) {
      debugPrint('Error getting device info for prefix: $e');
    }

    final newId = '${prefix}_$uuid';
    _cachedDeviceId = newId;
    await prefs.setString(_deviceIdVersionKey, newId);
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
