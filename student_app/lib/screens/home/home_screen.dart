import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/course_provider.dart';
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
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => context.read<CourseProvider>().fetchCourses(showLoading: true),
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
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hello, ${user?.name.split(' ')[0] ?? 'Student'}!',
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                        const Text(
                          'What do you want to learn today?',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppConstants.primaryColor.withValues(alpha: 0.1),
                      child: const Icon(Icons.person, color: AppConstants.primaryColor),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
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
                SizedBox(
                  height: 280,
                  child: Consumer<CourseProvider>(
                    builder: (context, provider, _) {
                      if (provider.isLoading && provider.courses.isEmpty) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      if (provider.courses.isEmpty) {
                        return const Center(child: Text('No courses available'));
                      }
                      return ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: provider.courses.length,
                        itemBuilder: (context, index) {
                          return CourseCard(course: provider.courses[index]);
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
