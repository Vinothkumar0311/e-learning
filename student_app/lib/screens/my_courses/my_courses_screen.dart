import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/cart_provider.dart';
import '../../models/course_model.dart';
import '../../core/constants/app_constants.dart';

class MyCoursesScreen extends StatefulWidget {
  const MyCoursesScreen({super.key});

  @override
  State<MyCoursesScreen> createState() => _MyCoursesScreenState();
}

class _MyCoursesScreenState extends State<MyCoursesScreen> {
  bool _refreshing = false;

  Future<void> _refresh() async {
    setState(() => _refreshing = true);
    await context.read<CartProvider>().fetchMyCourses();
    if (mounted) setState(() => _refreshing = false);
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<CartProvider>().fetchMyCourses());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('My Courses', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: Colors.grey[200], height: 1),
        ),
      ),
      body: Consumer<CartProvider>(
        builder: (context, cartProvider, _) {
          final courses = cartProvider.myCourses;

          if (cartProvider.isLoading && courses.isEmpty) {
            return const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor));
          }

          if (courses.isEmpty) {
            return _buildEmptyState(context);
          }

          return RefreshIndicator(
            color: AppConstants.primaryColor,
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: courses.length,
              itemBuilder: (context, index) {
                return _buildCourseCard(context, courses[index]);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppConstants.primaryColor.withAlpha(20),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.school_rounded, size: 52, color: AppConstants.primaryColor),
            ),
            const SizedBox(height: 24),
            const Text(
              'No Courses Yet',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
            ),
            const SizedBox(height: 10),
            Text(
              'Courses you purchase will appear here.\nStart exploring and enroll in a course!',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600], fontSize: 15, height: 1.5),
            ),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: () => context.go('/home'),
              icon: const Icon(Icons.explore_rounded),
              label: const Text('Browse Courses', style: TextStyle(fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppConstants.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCourseCard(BuildContext context, CourseModel course) {
    String? imageUrl = course.thumbnail;
    if (imageUrl != null && imageUrl.isNotEmpty && imageUrl.startsWith('/')) {
      final host = AppConstants.baseUrl.replaceAll('/api', '');
      imageUrl = '$host$imageUrl';
    }

    final sectionCount = course.sections?.length ?? 0;
    final moduleCount = course.sections?.fold<int>(
          0, (sum, s) => sum + (s.modules?.length ?? 0)) ?? 0;

    return GestureDetector(
      onTap: () => context.push('/course/${course.id}'),
      child: Container(
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              child: Stack(
                children: [
                  imageUrl != null
                      ? CachedNetworkImage(
                          imageUrl: imageUrl,
                          height: 160,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(
                            height: 160,
                            color: Colors.grey[100],
                            child: const Center(child: CircularProgressIndicator(strokeWidth: 2, color: AppConstants.primaryColor)),
                          ),
                          errorWidget: (_, __, ___) => _buildPlaceholder(course.title),
                        )
                      : _buildPlaceholder(course.title),
                  // Enrolled badge
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check_circle, color: Colors.white, size: 13),
                          SizedBox(width: 4),
                          Text('Enrolled', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
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
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, height: 1.3),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'by ${course.instructorName}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 13),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      if (sectionCount > 0) ...[
                        _stat(Icons.menu_book_rounded, '$sectionCount sections'),
                        const SizedBox(width: 16),
                      ],
                      if (moduleCount > 0)
                        _stat(Icons.play_circle_outline_rounded, '$moduleCount lessons'),
                    ],
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => context.push('/course/${course.id}'),
                      icon: const Icon(Icons.play_arrow_rounded, size: 18),
                      label: const Text('Continue Learning', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppConstants.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _stat(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppConstants.primaryColor),
        const SizedBox(width: 4),
        Text(text, style: TextStyle(color: Colors.grey[700], fontSize: 12)),
      ],
    );
  }

  Widget _buildPlaceholder(String title) {
    return Container(
      height: 160,
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
            child: Icon(Icons.school_rounded, color: Colors.white.withAlpha(25), size: 100),
          ),
          Center(
            child: Icon(Icons.school_rounded, color: Colors.white.withAlpha(210), size: 48),
          ),
        ],
      ),
    );
  }
}
