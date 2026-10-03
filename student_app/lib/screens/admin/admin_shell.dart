import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';
import 'admin_dashboard_screen.dart';
import 'admin_students_screen.dart';
import 'admin_payments_screen.dart';
import 'admin_courses_screen.dart';
import 'admin_live_classes_screen.dart';
import 'admin_materials_screen.dart';
import 'admin_notifications_screen.dart';
import 'admin_reports_screen.dart';
import 'admin_security_screen.dart';

class AdminShell extends StatefulWidget {
  final int initialIndex;
  const AdminShell({super.key, this.initialIndex = 0});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  final List<Widget> _adminScreens = const [
    AdminDashboardScreen(),
    AdminCoursesScreen(),
    AdminStudentsScreen(),
    AdminPaymentsScreen(),
    AdminLiveClassesScreen(),
    AdminMaterialsScreen(),
    AdminNotificationsScreen(),
    AdminReportsScreen(),
    AdminSecurityScreen(),
  ];

  void _showAdminMenuDrawer() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    children: [
                      Icon(Icons.admin_panel_settings_rounded, color: AppConstants.primaryColor, size: 24),
                      SizedBox(width: 8),
                      Text('Admin Management Modules', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                    ],
                  ),
                ),
                const Divider(color: Colors.white10),
                Expanded(
                  child: ListView(
                    shrinkWrap: true,
                    children: [
                      _drawerTile(0, Icons.dashboard_rounded, 'Dashboard Overview'),
                      _drawerTile(1, Icons.menu_book_rounded, 'Courses & Syllabus'),
                      _drawerTile(2, Icons.group_rounded, 'Students Directory'),
                      _drawerTile(3, Icons.verified_rounded, 'Payments & Admissions'),
                      _drawerTile(4, Icons.live_tv_rounded, 'Live Classes Management'),
                      _drawerTile(5, Icons.picture_as_pdf_rounded, 'Study Materials & PDFs'),
                      _drawerTile(6, Icons.system_update_rounded, 'Notifications & App Update'),
                      _drawerTile(7, Icons.insights_rounded, 'Reports & Analytics'),
                      _drawerTile(8, Icons.security_rounded, 'Security & Device Sessions'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _drawerTile(int index, IconData icon, String title) {
    final isSelected = _currentIndex == index;
    return ListTile(
      leading: Icon(icon, color: isSelected ? AppConstants.primaryColor : Colors.grey, size: 22),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? AppConstants.primaryColor : Colors.white,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 14,
        ),
      ),
      trailing: isSelected ? const Icon(Icons.check_circle_rounded, color: AppConstants.primaryColor, size: 18) : null,
      onTap: () {
        Navigator.pop(context);
        setState(() => _currentIndex = index);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _adminScreens),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          boxShadow: [
            BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, -2)),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(0, Icons.dashboard_rounded, Icons.dashboard_outlined, 'Dashboard'),
                _navItem(1, Icons.menu_book_rounded, Icons.menu_book_outlined, 'Courses'),
                _navItem(2, Icons.group_rounded, Icons.group_outlined, 'Students'),
                _navItem(3, Icons.verified_rounded, Icons.verified_outlined, 'Payments'),
                _navItem(6, Icons.system_update_rounded, Icons.system_update_outlined, 'Updates'),
                GestureDetector(
                  onTap: _showAdminMenuDrawer,
                  behavior: HitTestBehavior.opaque,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    child: const Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.grid_view_rounded, color: AppConstants.primaryColor, size: 20),
                        SizedBox(height: 3),
                        Text('All Modules', style: TextStyle(color: AppConstants.primaryColor, fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
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
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? AppConstants.primaryColor.withAlpha(40) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isActive ? activeIcon : inactiveIcon,
              color: isActive ? AppConstants.primaryColor : Colors.grey,
              size: 20,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                color: isActive ? AppConstants.primaryColor : Colors.grey,
                fontSize: 10,
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
