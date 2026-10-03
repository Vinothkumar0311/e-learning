import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../core/constants/app_constants.dart';

import '../../services/security_service.dart';
import '../../services/app_version_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final _versionService = AppVersionService();

  @override
  void initState() {
    super.initState();
    SecurityService().enableScreenshotProtection();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;

    final update = await _versionService.checkForUpdate();
    if (!mounted) return;

    if (update != null && update.updateRequired) {
      await _showUpdateDialog(update);
      if (update.forceUpdate) return;
    }

    _goNext();
  }

  void _goNext() {
    if (!mounted) return;
    final auth = context.read<AuthProvider>();
    if (auth.isAuthenticated) {
      context.go('/home');
    } else {
      context.go('/login');
    }
  }

  Future<void> _showUpdateDialog(AppVersionInfo info) {
    return showDialog<void>(
      context: context,
      barrierDismissible: !info.forceUpdate,
      builder: (ctx) {
        return PopScope(
          canPop: !info.forceUpdate,
          child: AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.system_update_rounded, color: AppConstants.primaryColor, size: 26),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Update required',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                ),
              ],
            ),
            content: Text(
              '${info.message}\n\nInstalled: ${info.installedVersion}\nLatest: ${info.latestVersion}',
              style: const TextStyle(fontSize: 14, height: 1.4),
            ),
            actions: [
              if (!info.forceUpdate)
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Later'),
                ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  minimumSize: const Size(0, 44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () async {
                  await _versionService.openStore(info.updateUrl);
                },
                child: const Text('Update', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.primaryColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(25),
                    blurRadius: 15,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: ClipOval(
                child: Image.asset(
                  'assets/images/logo.png',
                  width: 100,
                  height: 100,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              AppConstants.appName,
              style: TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Limitless Learning',
              style: TextStyle(color: Colors.white70, fontSize: 16),
            ),
            const SizedBox(height: 60),
            const CircularProgressIndicator(color: Colors.white),
          ],
        ),
      ),
    );
  }
}
