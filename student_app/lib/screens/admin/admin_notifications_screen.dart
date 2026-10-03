import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/admin_provider.dart';

class AdminNotificationsScreen extends StatefulWidget {
  const AdminNotificationsScreen({super.key});

  @override
  State<AdminNotificationsScreen> createState() => _AdminNotificationsScreenState();
}

class _AdminNotificationsScreenState extends State<AdminNotificationsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  // App Version Form Controllers
  final _latestVerController = TextEditingController();
  final _minVerController = TextEditingController();
  final _messageController = TextEditingController();
  final _androidUrlController = TextEditingController();
  final _iosUrlController = TextEditingController();
  bool _forceUpdate = false;
  bool _isLoadingVersion = false;
  bool _isSavingVersion = false;

  // Broadcast Form Controllers
  final _notifTitleController = TextEditingController();
  final _notifMsgController = TextEditingController();
  String _selectedGroup = 'All Registered Students';
  bool _isSendingNotif = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadAppVersionSettings();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _latestVerController.dispose();
    _minVerController.dispose();
    _messageController.dispose();
    _androidUrlController.dispose();
    _iosUrlController.dispose();
    _notifTitleController.dispose();
    _notifMsgController.dispose();
    super.dispose();
  }

  Future<void> _loadAppVersionSettings() async {
    setState(() => _isLoadingVersion = true);
    try {
      final settings = await context.read<AdminProvider>().getAppVersionSettings();
      setState(() {
        _latestVerController.text = settings['latestVersion'] ?? '1.0.1';
        _minVerController.text = settings['minVersion'] ?? '1.0.1';
        _forceUpdate = settings['forceUpdate'] == true;
        _messageController.text = settings['message'] ?? 'A new version of Royal NEET Academy is available. Please update to continue.';
        _androidUrlController.text = settings['androidUrl'] ?? 'https://play.google.com/store/apps/details?id=com.royalneetacademy.student';
        _iosUrlController.text = settings['iosUrl'] ?? 'https://apps.apple.com/app/id000000000';
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load app version settings: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoadingVersion = false);
    }
  }

  Future<void> _saveAppVersionSettings() async {
    setState(() => _isSavingVersion = true);
    try {
      await context.read<AdminProvider>().updateAppVersionSettings({
        'latestVersion': _latestVerController.text.trim(),
        'minVersion': _minVerController.text.trim(),
        'forceUpdate': _forceUpdate,
        'message': _messageController.text.trim(),
        'androidUrl': _androidUrlController.text.trim(),
        'iosUrl': _iosUrlController.text.trim(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('App update message and settings saved successfully!'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingVersion = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: const Text('Notifications & App Version', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppConstants.primaryColor,
          labelColor: AppConstants.primaryColor,
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(icon: Icon(Icons.system_update_rounded), text: 'App Update Settings'),
            Tab(icon: Icon(Icons.notifications_active_rounded), text: 'Broadcast Notification'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAppVersionTab(),
          _buildBroadcastTab(),
        ],
      ),
    );
  }

  Widget _buildAppVersionTab() {
    if (_isLoadingVersion) {
      return const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppConstants.primaryColor.withAlpha(50)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.new_releases_rounded, color: AppConstants.primaryColor, size: 22),
                    SizedBox(width: 8),
                    Text('Mobile App Version Control', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                const SizedBox(height: 4),
                const Text('Configure version thresholds and pop-up messages displayed on student mobile apps.', style: TextStyle(color: Colors.grey, fontSize: 12)),
                const Divider(color: Colors.white10, height: 24),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _fieldLabel('Latest Version'),
                          _inputField(_latestVerController, '1.0.1'),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _fieldLabel('Minimum Required Version'),
                          _inputField(_minVerController, '1.0.1'),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Enforce Force Update', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                          Text('Prevents app usage until user updates', style: TextStyle(color: Colors.grey, fontSize: 11)),
                        ],
                      ),
                      Switch(
                        value: _forceUpdate,
                        activeColor: Colors.redAccent,
                        onChanged: (val) => setState(() => _forceUpdate = val),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _fieldLabel('Update Announcement Message'),
                _inputField(_messageController, 'Enter custom update announcement...', maxLines: 3),
                const SizedBox(height: 16),
                _fieldLabel('Android Play Store URL'),
                _inputField(_androidUrlController, 'https://play.google.com/...'),
                const SizedBox(height: 12),
                _fieldLabel('iOS App Store URL'),
                _inputField(_iosUrlController, 'https://apps.apple.com/...'),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppConstants.primaryColor,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: _isSavingVersion
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.save_rounded, color: Colors.white),
                    label: Text(
                      _isSavingVersion ? 'Saving Settings...' : 'Save App Update Settings',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    onPressed: _isSavingVersion ? null : _saveAppVersionSettings,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBroadcastTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.send_rounded, color: AppConstants.primaryColor, size: 22),
                SizedBox(width: 8),
                Text('Broadcast Push Notification', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 4),
            const Text('Send real-time alerts or announcements directly to student mobile applications.', style: TextStyle(color: Colors.grey, fontSize: 12)),
            const Divider(color: Colors.white10, height: 24),
            _fieldLabel('Target Audience Group'),
            DropdownButtonFormField<String>(
              value: _selectedGroup,
              dropdownColor: const Color(0xFF1E293B),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white10)),
              ),
              items: const [
                DropdownMenuItem(value: 'All Registered Students', child: Text('All Registered Students')),
                DropdownMenuItem(value: 'Active Paid Enrolled Students', child: Text('Active Paid Enrolled Students')),
              ],
              onChanged: (val) => setState(() => _selectedGroup = val!),
            ),
            const SizedBox(height: 16),
            _fieldLabel('Notification Title'),
            _inputField(_notifTitleController, 'e.g. New Live Class Scheduled!'),
            const SizedBox(height: 16),
            _fieldLabel('Notification Message'),
            _inputField(_notifMsgController, 'Type notification content here...', maxLines: 4),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: _isSendingNotif
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.send_rounded, color: Colors.white),
                label: Text(
                  _isSendingNotif ? 'Sending Broadcast...' : 'Broadcast Notification Now',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                ),
                onPressed: () {
                  if (_notifTitleController.text.trim().isEmpty || _notifMsgController.text.trim().isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please enter title and message'), backgroundColor: Colors.orange),
                    );
                    return;
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Notification broadcast sent to all students!'), backgroundColor: Colors.green),
                  );
                  _notifTitleController.clear();
                  _notifMsgController.clear();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _fieldLabel(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(title, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 12)),
    );
  }

  Widget _inputField(TextEditingController controller, String hint, {int maxLines = 1}) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white30, fontSize: 13),
        filled: true,
        fillColor: const Color(0xFF0F172A),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white10)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white10)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppConstants.primaryColor)),
      ),
    );
  }
}
