import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/admin_provider.dart';

class AdminSecurityScreen extends StatefulWidget {
  const AdminSecurityScreen({super.key});

  @override
  State<AdminSecurityScreen> createState() => _AdminSecurityScreenState();
}

class _AdminSecurityScreenState extends State<AdminSecurityScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  String _selectedEventType = '';
  String _searchQuery = '';

  final List<Map<String, String>> _eventTypes = [
    {'label': 'All Events', 'value': ''},
    {'label': 'Login Success', 'value': 'LOGIN_SUCCESS'},
    {'label': 'Blocked Device', 'value': 'LOGIN_BLOCKED_DEVICE'},
    {'label': 'Failed Login', 'value': 'LOGIN_FAILED'},
    {'label': 'Device Mismatch', 'value': 'DEVICE_MISMATCH'},
    {'label': 'Screenshot Attempt', 'value': 'SCREENSHOT_ATTEMPT'},
    {'label': 'Screen Record Attempt', 'value': 'SCREEN_RECORD_ATTEMPT'},
    {'label': 'Account Deactivated', 'value': 'ACCOUNT_DEACTIVATED'},
    {'label': 'Force Logout', 'value': 'ADMIN_FORCE_LOGOUT'},
    {'label': 'Admin Reactivated', 'value': 'ADMIN_REACTIVATED'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().fetchActiveSessions();
      context.read<AdminProvider>().fetchAuditLogs();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Color _getEventColor(String eventType) {
    switch (eventType) {
      case 'LOGIN_SUCCESS':
      case 'ADMIN_REACTIVATED':
        return Colors.greenAccent;
      case 'LOGIN_BLOCKED_DEVICE':
      case 'DEVICE_MISMATCH':
      case 'TOKEN_EXPIRED':
        return Colors.orangeAccent;
      case 'SCREENSHOT_ATTEMPT':
      case 'SCREEN_RECORD_ATTEMPT':
      case 'ACCOUNT_DEACTIVATED':
      case 'LOGIN_FAILED':
        return Colors.redAccent;
      case 'ADMIN_FORCE_LOGOUT':
        return Colors.blueAccent;
      default:
        return Colors.purpleAccent;
    }
  }

  IconData _getEventIcon(String eventType) {
    switch (eventType) {
      case 'LOGIN_SUCCESS':
        return Icons.check_circle_outline;
      case 'LOGIN_BLOCKED_DEVICE':
        return Icons.phonelink_erase_rounded;
      case 'DEVICE_MISMATCH':
        return Icons.devices_other_rounded;
      case 'SCREENSHOT_ATTEMPT':
        return Icons.no_photography_rounded;
      case 'SCREEN_RECORD_ATTEMPT':
        return Icons.videocam_off_rounded;
      case 'ACCOUNT_DEACTIVATED':
        return Icons.gpp_bad_rounded;
      case 'ADMIN_FORCE_LOGOUT':
        return Icons.logout_rounded;
      case 'ADMIN_REACTIVATED':
        return Icons.verified_user_rounded;
      default:
        return Icons.security_rounded;
    }
  }

  String _formatDate(String? isoString) {
    if (isoString == null) return 'N/A';
    try {
      final dt = DateTime.parse(isoString).toLocal();
      return DateFormat('MMM dd, yyyy • hh:mm a').format(dt);
    } catch (_) {
      return isoString;
    }
  }

  void _showForceLogoutDialog(dynamic session) {
    final sessionId = session['id']?.toString() ?? '';
    final studentName = session['student']?['name'] ?? 'Student';
    final deviceName = session['device_name'] ?? 'Device';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Force Logout Session', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'Are you sure you want to terminate the active session for $studentName on $deviceName?\n\nThis will instantly log out the student from that device.',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              try {
                await context.read<AdminProvider>().forceLogoutSession(sessionId);
                if (ctx.mounted) Navigator.pop(ctx);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Session terminated successfully'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: const Text('Force Logout', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showReactivateDialog(String studentId, String studentName) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.security_update_good, color: Colors.greenAccent),
            SizedBox(width: 8),
            Text('Reactivate Account', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Reactivate account for $studentName?\n\nThis will clear suspicious activity flags, reset unauthorized attempt counters, and allow the student to register their device on next login.',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.greenAccent),
            onPressed: () async {
              try {
                await context.read<AdminProvider>().reactivateStudentAccount(studentId);
                if (ctx.mounted) Navigator.pop(ctx);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Account reactivated and unlocked!'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: const Text('Reactivate Account', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AdminProvider>();
    final activeSessions = provider.activeSessions;
    final auditLogs = provider.auditLogs;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Security & Device Control', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppConstants.primaryColor,
          indicatorWeight: 3,
          labelColor: AppConstants.primaryColor,
          unselectedLabelColor: Colors.grey,
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.phonelink_setup_rounded, size: 18),
                  const SizedBox(width: 8),
                  Text('Active Sessions (${activeSessions.length})'),
                ],
              ),
            ),
            const Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history_rounded, size: 18),
                  SizedBox(width: 8),
                  Text('Security Audit Logs'),
                ],
              ),
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // ─── TAB 1: Active Sessions ─────────────────────────────────────
          RefreshIndicator(
            onRefresh: () => provider.fetchActiveSessions(),
            child: provider.isLoading && activeSessions.isEmpty
                ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor))
                : activeSessions.isEmpty
                    ? const Center(
                        child: Text('No active device sessions found', style: TextStyle(color: Colors.grey)),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: activeSessions.length,
                        itemBuilder: (context, index) {
                          final session = activeSessions[index];
                          final student = session['student'] ?? {};
                          final deviceName = session['device_name'] ?? 'Mobile Device';
                          final deviceId = session['device_id'] ?? 'Unknown';
                          final ipAddress = session['ip_address'] ?? 'Unknown';
                          final lastSeen = session['last_seen'];

                          return Card(
                            color: const Color(0xFF1E293B),
                            margin: const EdgeInsets.only(bottom: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const CircleAvatar(
                                        backgroundColor: Colors.white10,
                                        child: Icon(Icons.smartphone_rounded, color: AppConstants.primaryColor),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              student['name'] ?? 'Unknown Student',
                                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                                            ),
                                            Text(
                                              student['email'] ?? student['mobile_number'] ?? '',
                                              style: const TextStyle(color: Colors.grey, fontSize: 12),
                                            ),
                                          ],
                                        ),
                                      ),
                                      ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.redAccent.withAlpha(30),
                                          foregroundColor: Colors.redAccent,
                                          elevation: 0,
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                        onPressed: () => _showForceLogoutDialog(session),
                                        icon: const Icon(Icons.logout_rounded, size: 16),
                                        label: const Text('Force Logout', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                      ),
                                    ],
                                  ),
                                  const Divider(color: Colors.white10, height: 24),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      _infoTile('Device Name', deviceName),
                                      _infoTile('IP Address', ipAddress),
                                      _infoTile('Last Seen', _formatDate(lastSeen)),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Device ID: $deviceId',
                                    style: const TextStyle(color: Colors.white38, fontSize: 11, fontFamily: 'monospace'),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),

          // ─── TAB 2: Audit Logs ─────────────────────────────────────────
          Column(
            children: [
              // Search & Filter Controls
              Container(
                padding: const EdgeInsets.all(16),
                color: const Color(0xFF1E293B),
                child: Column(
                  children: [
                    TextField(
                      controller: _searchController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Search audit logs by student name or email...',
                        hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                        prefixIcon: const Icon(Icons.search, color: Colors.grey),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, color: Colors.grey),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() => _searchQuery = '');
                                  provider.fetchAuditLogs(eventType: _selectedEventType, search: '');
                                },
                              )
                            : null,
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                      onSubmitted: (val) {
                        setState(() => _searchQuery = val.trim());
                        provider.fetchAuditLogs(eventType: _selectedEventType, search: _searchQuery);
                      },
                    ),
                    const SizedBox(height: 12),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _eventTypes.map((item) {
                          final isSelected = _selectedEventType == item['value'];
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: FilterChip(
                              selected: isSelected,
                              label: Text(item['label']!),
                              labelStyle: TextStyle(
                                color: isSelected ? Colors.white : Colors.grey,
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                              backgroundColor: const Color(0xFF0F172A),
                              selectedColor: AppConstants.primaryColor,
                              onSelected: (val) {
                                setState(() {
                                  _selectedEventType = item['value']!;
                                });
                                provider.fetchAuditLogs(eventType: _selectedEventType, search: _searchQuery);
                              },
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),

              Expanded(
                child: provider.isLoading && auditLogs.isEmpty
                    ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor))
                    : auditLogs.isEmpty
                        ? const Center(child: Text('No security logs found', style: TextStyle(color: Colors.grey)))
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: auditLogs.length,
                            itemBuilder: (context, index) {
                              final log = auditLogs[index];
                              final eventType = log['event_type'] ?? 'UNKNOWN';
                              final student = log['student'];
                              final studentName = student != null ? student['name'] : 'Unknown Student';
                              final studentId = student != null ? student['id']?.toString() : null;
                              final deviceName = log['device_name'] ?? log['device_id'] ?? 'N/A';
                              final color = _getEventColor(eventType);
                              final icon = _getEventIcon(eventType);
                              final details = log['details'] is Map ? log['details'] : {};

                              return Card(
                                color: const Color(0xFF1E293B),
                                margin: const EdgeInsets.only(bottom: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                child: ExpansionTile(
                                  leading: CircleAvatar(
                                    backgroundColor: color.withAlpha(30),
                                    child: Icon(icon, color: color, size: 20),
                                  ),
                                  title: Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          studentName,
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: color.withAlpha(30),
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(color: color.withAlpha(80)),
                                        ),
                                        child: Text(
                                          eventType,
                                          style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ],
                                  ),
                                  subtitle: Text(
                                    '${_formatDate(log['createdAt'])} • $deviceName',
                                    style: const TextStyle(color: Colors.grey, fontSize: 11),
                                  ),
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text('Security Log Details:', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                                          const SizedBox(height: 6),
                                          Text('IP Address: ${log['ip_address'] ?? 'N/A'}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                          Text('Device ID: ${log['device_id'] ?? 'N/A'}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                          if (details.isNotEmpty) ...[
                                            const SizedBox(height: 6),
                                            Text('Metadata: $details', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                                          ],
                                          if ((eventType == 'ACCOUNT_DEACTIVATED' || eventType == 'LOGIN_BLOCKED_DEVICE') && studentId != null) ...[
                                            const SizedBox(height: 12),
                                            SizedBox(
                                              width: double.infinity,
                                              child: ElevatedButton.icon(
                                                style: ElevatedButton.styleFrom(backgroundColor: Colors.greenAccent),
                                                onPressed: () => _showReactivateDialog(studentId, studentName),
                                                icon: const Icon(Icons.lock_open_rounded, color: Colors.black),
                                                label: const Text('Reactivate & Unlock Student Account', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                                              ),
                                            ),
                                          ]
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoTile(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
