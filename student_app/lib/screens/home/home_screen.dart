import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/course_provider.dart';
import '../../models/course_model.dart';
import '../../core/constants/app_constants.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (mounted) {
        // Pre-fetch assigned courses so My Courses tab and Home feed are ready
        context.read<CartProvider>().fetchMyCourses();
        context.read<CourseProvider>().fetchCourses(showLoading: false);
      }
    });
  }

  void _showBlockedDialog(BuildContext context, String? reason) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.gpp_bad_rounded, color: Colors.red),
            SizedBox(width: 8),
            Text('Access Suspended', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          reason != null && reason.trim().isNotEmpty
              ? reason
              : 'your course has been blocked by admin',
          style: const TextStyle(fontSize: 15),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholder(String title) {
    return Container(
      height: 150,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF6366F1), Color(0xFFA855F7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -15,
            bottom: -15,
            child: Icon(
              Icons.school_rounded,
              color: Colors.white.withAlpha(25),
              size: 90,
            ),
          ),
          Center(
            child: Icon(
              Icons.school_rounded,
              color: Colors.white.withAlpha(210),
              size: 46,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCourseCard(BuildContext context, CourseModel course) {
    String? imageUrl = course.thumbnail?.trim();
    if (imageUrl != null && imageUrl.isNotEmpty && imageUrl != 'null') {
      if (!imageUrl.startsWith('http')) {
        final host = AppConstants.baseUrl.replaceAll('/api', '');
        final path = imageUrl.startsWith('/') ? imageUrl : '/$imageUrl';
        imageUrl = '$host$path';
      }
    } else {
      imageUrl = null;
    }

    final sectionCount = course.sections.length;
    final moduleCount = course.sections.isNotEmpty
        ? course.sections.fold<int>(0, (sum, s) => sum + s.modules.length)
        : course.modules.length;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: course.isBlocked
              ? () => _showBlockedDialog(context, course.blockReason)
              : () => context.push('/course/${course.id}'),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: Stack(
                  children: [
                    imageUrl != null
                        ? CachedNetworkImage(
                            imageUrl: imageUrl,
                            height: 150,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            placeholder: (_, __) => Container(
                              height: 150,
                              color: Colors.grey[100],
                              child: const Center(
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppConstants.primaryColor,
                                ),
                              ),
                            ),
                            errorWidget: (_, __, ___) => _buildPlaceholder(course.title),
                          )
                        : _buildPlaceholder(course.title),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: course.isBlocked ? Colors.red : Colors.green,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              course.isBlocked ? Icons.gpp_bad_rounded : Icons.check_circle,
                              color: Colors.white,
                              size: 13,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              course.isBlocked ? 'Blocked' : 'Enrolled',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      course.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'by ${course.instructorName}',
                      style: TextStyle(color: Colors.grey[600], fontSize: 13),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        if (sectionCount > 0) ...[
                          const Icon(Icons.menu_book_rounded, size: 14, color: AppConstants.primaryColor),
                          const SizedBox(width: 4),
                          Text('$sectionCount sections', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                          const SizedBox(width: 16),
                        ],
                        if (moduleCount > 0) ...[
                          const Icon(Icons.play_circle_outline_rounded, size: 14, color: AppConstants.primaryColor),
                          const SizedBox(width: 4),
                          Text('$moduleCount lessons', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                        ] else if (sectionCount == 0) ...[
                          const Icon(Icons.school_outlined, size: 14, color: AppConstants.primaryColor),
                          const SizedBox(width: 4),
                          Text('Full Course Access', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                        ],
                      ],
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: course.isBlocked
                            ? () => _showBlockedDialog(context, course.blockReason)
                            : () => context.push('/course/${course.id}'),
                        icon: Icon(
                          course.isBlocked ? Icons.lock_rounded : Icons.play_arrow_rounded,
                          size: 18,
                        ),
                        label: Text(
                          course.isBlocked ? 'Blocked' : 'Continue Learning',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: course.isBlocked ? Colors.red[700] : AppConstants.primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final assignedCount = context.watch<CartProvider>().myCourses.length;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await Future.wait([
              context.read<CartProvider>().fetchMyCourses(),
              context.read<CourseProvider>().fetchCourses(showLoading: false),
            ]);
          },
          color: AppConstants.primaryColor,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ─── Header Row ──────────────────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: AppConstants.primaryColor.withAlpha(25),
                          child: Text(
                            (user?.name.isNotEmpty == true) ? user!.name[0].toUpperCase() : 'S',
                            style: const TextStyle(
                              color: AppConstants.primaryColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  'Hello, ${user?.name.split(' ')[0] ?? 'Student'}',
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(width: 4),
                                const Text('👋', style: TextStyle(fontSize: 16)),
                              ],
                            ),
                            const Text(
                              'Ready to learn today?',
                              style: TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.admin_panel_settings_rounded, size: 24, color: AppConstants.primaryColor),
                          onPressed: () => context.push('/admin/courses'),
                          tooltip: 'Admin Studio (Courses & Videos)',
                        ),
                        IconButton(
                          icon: const Icon(Icons.assignment_outlined, size: 24),
                          onPressed: () => context.push('/enrollment-status'),
                          tooltip: 'Track Admissions',
                        ),
                        IconButton(
                          icon: const Icon(Icons.logout_rounded, size: 24, color: Colors.redAccent),
                          onPressed: () async {
                            final confirm = await showDialog<bool>(
                              context: context,
                              builder: (context) => AlertDialog(
                                title: const Text('Logout'),
                                content: const Text('Are you sure you want to logout?'),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context, false),
                                    child: const Text('Cancel'),
                                  ),
                                  TextButton(
                                    onPressed: () => Navigator.pop(context, true),
                                    style: TextButton.styleFrom(foregroundColor: Colors.redAccent),
                                    child: const Text('Logout'),
                                  ),
                                ],
                              ),
                            );
                            if (confirm == true && context.mounted) {
                              await context.read<AuthProvider>().logout();
                              if (context.mounted) {
                                context.go('/login');
                              }
                            }
                          },
                          tooltip: 'Logout',
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 28),

                // ─── Welcome Banner ──────────────────────────────────────
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppConstants.primaryColor, AppConstants.secondaryColor],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AppConstants.primaryColor.withValues(alpha: 0.3),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Your Learning Journey',
                              style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '$assignedCount Course${assignedCount != 1 ? 's' : ''} Assigned',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 14),
                            ElevatedButton(
                              onPressed: () => context.go('/my-courses'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: AppConstants.primaryColor,
                                minimumSize: const Size(120, 36),
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              child: const Text(
                                'Go to My Courses',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.school_rounded, color: Colors.white54, size: 64),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // ─── Quick Action Cards ──────────────────────────────────
                const Text(
                  'Quick Access',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: _QuickCard(
                        icon: Icons.play_lesson_rounded,
                        label: 'My Courses',
                        sublabel: '$assignedCount assigned',
                        onTap: () => context.go('/my-courses'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _QuickCard(
                        icon: Icons.track_changes_rounded,
                        label: 'Admission Status',
                        sublabel: 'View progress',
                        onTap: () => context.push('/enrollment-status'),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 28),

                // ─── Course List Cards ───────────────────────────────────
                Consumer<CartProvider>(
                  builder: (context, cartProvider, _) {
                    final myCourses = cartProvider.myCourses;

                    if (myCourses.isNotEmpty) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'My Courses',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                              TextButton(
                                onPressed: () => context.go('/my-courses'),
                                child: const Text(
                                  'View All',
                                  style: TextStyle(
                                    color: AppConstants.primaryColor,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ...myCourses.map((c) => _buildCourseCard(context, c)),
                        ],
                      );
                    }

                    return Consumer<CourseProvider>(
                      builder: (context, courseProvider, _) {
                        final courses = courseProvider.courses;
                        if (courses.isNotEmpty) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Available Courses',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 12),
                              ...courses.map((c) => _buildCourseCard(context, c)),
                            ],
                          );
                        }

                        return Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Center(
                            child: Column(
                              children: [
                                Icon(Icons.school_outlined, size: 48, color: Colors.grey[400]),
                                const SizedBox(height: 12),
                                const Text(
                                  'No courses assigned yet',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Contact your administrator to get access to courses.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Quick Action Card Widget ────────────────────────────────────────────────
class _QuickCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String sublabel;
  final VoidCallback onTap;

  const _QuickCard({
    required this.icon,
    required this.label,
    required this.sublabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: Colors.grey.shade100),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppConstants.primaryColor.withAlpha(20),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppConstants.primaryColor, size: 22),
            ),
            const SizedBox(height: 12),
            Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 2),
            Text(sublabel, style: TextStyle(color: Colors.grey[500], fontSize: 11)),
          ],
        ),
      ),
    );
  }
}
