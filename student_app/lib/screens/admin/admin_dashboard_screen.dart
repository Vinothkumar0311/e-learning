import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/admin_provider.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().fetchDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AdminProvider>();
    final stats = provider.stats;
    final isLoading = provider.isLoading;
    final enrollments = provider.recentEnrollments;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Admin Analytics', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () => provider.fetchDashboardData(),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
            onPressed: () async {
              await provider.logoutAdmin();
              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
        ],
      ),
      body: isLoading && stats == null
          ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor))
          : RefreshIndicator(
              onRefresh: () => provider.fetchDashboardData(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Welcome Banner
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppConstants.primaryColor,
                            AppConstants.secondaryColor,
                          ],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppConstants.primaryColor.withAlpha(80),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const CircleAvatar(
                            radius: 28,
                            backgroundColor: Colors.white24,
                            child: Icon(Icons.admin_panel_settings, color: Colors.white, size: 32),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Hello, ${provider.adminUser?['name'] ?? 'Admin'} 👋',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Platform Performance Overview',
                                  style: TextStyle(color: Colors.white70, fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Metrics Grid
                    const Text(
                      'Overview Metrics',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      childAspectRatio: 1.4,
                      children: [
                        _metricCard(
                          title: 'Total Students',
                          value: '${stats?.totalStudents ?? 0}',
                          icon: Icons.people_alt_rounded,
                          color: Colors.blueAccent,
                        ),
                        _metricCard(
                          title: 'Active Courses',
                          value: '${stats?.totalCourses ?? 0}',
                          icon: Icons.school_rounded,
                          color: Colors.purpleAccent,
                        ),
                        _metricCard(
                          title: 'Total Revenue',
                          value: '₹${stats?.totalRevenue.toStringAsFixed(0) ?? '0'}',
                          icon: Icons.account_balance_wallet_rounded,
                          color: const Color(0xFF10B981),
                        ),
                        _metricCard(
                          title: 'Pending Approvals',
                          value: '${stats?.pendingPayments ?? 0}',
                          icon: Icons.pending_actions_rounded,
                          color: Colors.orangeAccent,
                          badge: (stats?.pendingPayments ?? 0) > 0,
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Quick Management Links
                    const Text(
                      'Quick Actions',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _actionButton(
                            label: 'Manage Students',
                            icon: Icons.group_outlined,
                            color: Colors.indigoAccent,
                            onTap: () => context.go('/admin/students'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _actionButton(
                            label: 'Payment Approvals',
                            icon: Icons.verified_user_outlined,
                            color: Colors.amberAccent,
                            onTap: () => context.go('/admin/payments'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Recent Enrollments
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Recent Enrollments',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        TextButton(
                          onPressed: () => context.go('/admin/payments'),
                          child: const Text('View All', style: TextStyle(color: AppConstants.primaryColor)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    enrollments.isEmpty
                        ? Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Center(
                              child: Text(
                                'No recent enrollment activity',
                                style: TextStyle(color: Colors.grey),
                              ),
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: enrollments.length > 5 ? 5 : enrollments.length,
                            itemBuilder: (context, index) {
                              final item = enrollments[index];
                              return Card(
                                color: const Color(0xFF1E293B),
                                margin: const EdgeInsets.only(bottom: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                child: ListTile(
                                  leading: const CircleAvatar(
                                    backgroundColor: Colors.white10,
                                    child: Icon(Icons.person_rounded, color: Colors.white70),
                                  ),
                                  title: Text(
                                    item['student_name'] ?? item['Student']?['name'] ?? 'Student',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                  subtitle: Text(
                                    item['course_title'] ?? item['Course']?['title'] ?? 'Course',
                                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                                  ),
                                  trailing: Text(
                                    '₹${item['amount'] ?? 0}',
                                    style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              );
                            },
                          ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _metricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    bool badge = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: badge ? Colors.orangeAccent : Colors.white.withAlpha(10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 28),
              if (badge)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.orangeAccent.withAlpha(40),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text('Action Required', style: TextStyle(color: Colors.orangeAccent, fontSize: 9, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 2),
              Text(
                title,
                style: const TextStyle(color: Colors.grey, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _actionButton({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withAlpha(60)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 30),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

extension ColorExt on Colors {
  static const Color emeraldColor = Color(0xFF10B981);
}
