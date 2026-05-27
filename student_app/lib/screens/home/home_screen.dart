import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../providers/course_provider.dart';
import '../../providers/cart_provider.dart';
import '../../widgets/course_card.dart';
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
        context.read<CourseProvider>().fetchCourses();
        context.read<CartProvider>().fetchMyCourses();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
          await context.read<CourseProvider>().fetchCourses(showLoading: true);
          await context.read<CartProvider>().fetchMyCourses();
          await context.read<CartProvider>().fetchEnrollments(showLoading: false);
        },
          color: AppConstants.primaryColor,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
                              'What do you want to learn today?',
                              style: TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: Badge.count(
                            count: context.watch<CartProvider>().cartCount,
                            backgroundColor: AppConstants.primaryColor,
                            child: const Icon(Icons.shopping_cart_outlined, size: 24),
                          ),
                          onPressed: () => context.push('/cart'),
                          tooltip: 'My Course Cart',
                        ),
                        // IconButton(
                        //   icon: const Icon(Icons.play_lesson_outlined, size: 24),
                        //   onPressed: () => context.go('/my-courses'),
                        //   tooltip: 'My Courses',
                        // ),
                        IconButton(
                          icon: const Icon(Icons.assignment_outlined, size: 24),
                          onPressed: () => context.push('/enrollment-status'),
                          tooltip: 'Track Admissions',
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Modern Premium Search Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.search_rounded, color: Colors.grey[400]),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            hintText: 'Search for courses, topics...',
                            hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppConstants.primaryColor.withAlpha(20),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.tune_rounded, color: AppConstants.primaryColor, size: 18),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),
                Container(
                  padding: const EdgeInsets.all(20),
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
                              '40% OFF',
                              style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
                            ),
                            const Text(
                              'Summer Learning Sale',
                              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () {},
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: AppConstants.primaryColor,
                                minimumSize: const Size(100, 36),
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                              ),
                              child: const Text('Get Now', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.auto_awesome, color: Colors.white54, size: 64),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Popular Courses', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Text('See All', style: TextStyle(color: AppConstants.primaryColor, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 16),
                Consumer<CourseProvider>(
                  builder: (context, provider, _) {
                    if (provider.isLoading && provider.courses.isEmpty) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 32.0),
                          child: CircularProgressIndicator(),
                        ),
                      );
                    }
                    if (provider.courses.isEmpty) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 32.0),
                          child: Text('No courses available'),
                        ),
                      );
                    }
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                        childAspectRatio: 0.90,
                      ),
                      itemCount: provider.courses.length,
                      itemBuilder: (context, index) {
                        return CourseCard(course: provider.courses[index]);
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
