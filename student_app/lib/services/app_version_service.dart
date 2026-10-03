import 'dart:io' show Platform;
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/network/dio_client.dart';

class AppVersionInfo {
  final String installedVersion;
  final String latestVersion;
  final String minVersion;
  final bool forceUpdate;
  final String updateUrl;
  final String message;
  final bool updateRequired;

  const AppVersionInfo({
    required this.installedVersion,
    required this.latestVersion,
    required this.minVersion,
    required this.forceUpdate,
    required this.updateUrl,
    required this.message,
    required this.updateRequired,
  });
}

class AppVersionService {
  final _dio = DioClient().dio;

  Future<AppVersionInfo?> checkForUpdate() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final installed = packageInfo.version;

      final response = await _dio.get('/app/version');
      final data = response.data is Map ? response.data['data'] : null;
      if (data is! Map) return null;

      final latest = (data['latestVersion'] ?? '').toString();
      final minVersion = (data['minVersion'] ?? latest).toString();
      if (latest.isEmpty) return null;

      final outdated = _compareVersions(installed, latest) < 0;
      if (!outdated) return null;

      final belowMin = _compareVersions(installed, minVersion) < 0;
      final forceFlag = data['forceUpdate'] == true;

      return AppVersionInfo(
        installedVersion: installed,
        latestVersion: latest,
        minVersion: minVersion,
        forceUpdate: forceFlag || belowMin,
        updateUrl: _storeUrl(data),
        message: (data['message'] ??
                'A new version of the app is available. Please update to continue.')
            .toString(),
        updateRequired: true,
      );
    } on DioException {
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<bool> openStore(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return false;
    return launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  String _storeUrl(Map data) {
    if (!kIsWeb && Platform.isIOS) {
      return (data['iosUrl'] ?? '').toString();
    }
    return (data['androidUrl'] ?? '').toString();
  }

  /// Returns negative if [a] is older than [b].
  int _compareVersions(String a, String b) {
    final pa = _parts(a);
    final pb = _parts(b);
    final len = pa.length > pb.length ? pa.length : pb.length;
    for (var i = 0; i < len; i++) {
      final av = i < pa.length ? pa[i] : 0;
      final bv = i < pb.length ? pb[i] : 0;
      if (av != bv) return av.compareTo(bv);
    }
    return 0;
  }

  List<int> _parts(String version) {
    return version
        .split(RegExp(r'[^0-9]+'))
        .where((p) => p.isNotEmpty)
        .map(int.parse)
        .toList();
  }
}
