import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/course_provider.dart';
import 'providers/cart_provider.dart';
import 'screens/splash/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/cart/cart_screen.dart';
import 'screens/cart/checkout_screen.dart';
import 'screens/cart/enrollment_status_screen.dart';
import 'screens/cart/payment_upload_screen.dart';
import 'screens/courses/course_detail_screen.dart';
import 'screens/courses/video_player_screen.dart';
import 'screens/courses/pdf_viewer_screen.dart';
import 'screens/my_courses/my_courses_screen.dart';
import 'core/constants/app_constants.dart';
import 'models/course_model.dart';
import 'providers/progress_provider.dart';
import 'screens/performance/performance_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CourseProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => ProgressProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
    GoRoute(path: '/home', builder: (context, state) => const MainShell(initialIndex: 0)),
    GoRoute(path: '/my-courses', builder: (context, state) => const MainShell(initialIndex: 1)),
    GoRoute(path: '/cart', builder: (context, state) => const CartScreen()),
    GoRoute(path: '/checkout', builder: (context, state) => const CheckoutScreen()),
    GoRoute(path: '/enrollment-status', builder: (context, state) => const EnrollmentStatusScreen()),
    GoRoute(
      path: '/payment-upload',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>;
        return PaymentUploadScreen(
          paymentId: extra['paymentId'] as int,
          amount: extra['amount'] as double,
          courseTitle: extra['courseTitle'] as String,
        );
      },
    ),
    GoRoute(
      path: '/course/:id',
      builder: (context, state) {
        final id = int.parse(state.pathParameters['id']!);
        return CourseDetailScreen(courseId: id);
      },
    ),
    GoRoute(
      path: '/course/:id/play',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>;
        return VideoPlayerScreen(
          course: extra['course'] as CourseModel,
          initialModule: extra['module'] as CourseModuleModel,
        );
      },
    ),
    GoRoute(
      path: '/course/:id/pdf',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>;
        final courseId = int.tryParse(state.pathParameters['id'] ?? '');
        return PDFViewerScreen(
          pdfUrl: extra['pdfUrl'] as String,
          title: extra['title'] as String,
          courseId: courseId,
          moduleId: extra['moduleId'] as int?,
        );
      },
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'EduStudent',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: _router,
    );
  }
}

// ─── Main Shell with Bottom Navigation ────────────────────────────────────────
class MainShell extends StatefulWidget {
  final int initialIndex;
  const MainShell({super.key, this.initialIndex = 0});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  final List<Widget> _screens = const [
    HomeScreen(),
    MyCoursesScreen(),
    PerformanceScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withAlpha(15), blurRadius: 16, offset: const Offset(0, -4)),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(0, Icons.home_rounded, Icons.home_outlined, 'Home'),
                _navItem(1, Icons.play_lesson_rounded, Icons.play_lesson_outlined, 'My Courses'),
                _navItem(2, Icons.analytics_rounded, Icons.analytics_outlined, 'Performance'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(int index, IconData activeIcon, IconData inactiveIcon, String label) {
    final isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppConstants.primaryColor.withAlpha(20) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isActive ? activeIcon : inactiveIcon,
              color: isActive ? AppConstants.primaryColor : Colors.grey[500],
              size: 24,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                color: isActive ? AppConstants.primaryColor : Colors.grey[500],
                fontSize: 11,
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
