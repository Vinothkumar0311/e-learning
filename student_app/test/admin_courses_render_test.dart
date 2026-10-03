import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:student_app/models/course_model.dart';
import 'package:student_app/providers/admin_provider.dart';
import 'package:student_app/core/theme/app_theme.dart';
import 'package:student_app/screens/admin/admin_courses_screen.dart';

class MockAdminProvider extends ChangeNotifier implements AdminProvider {
  @override
  List<CourseModel> courses = [];

  @override
  bool isLoading = false;

  @override
  Future<void> fetchCourses() async {}

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  testWidgets('Renders AdminCoursesScreen with backend courses', (WidgetTester tester) async {
    final rawCourses = [
      {
        "id": 6,
        "title": "PG-TRB CHEMISTRY ",
        "description": "Trb chemistry ",
        "price": "0.00",
        "thumbnail": null,
        "category": "TRB ",
        "level": "beginner",
        "status": "draft",
        "instructor_name": "Munusamy.S",
        "createdAt": "2026-09-21T07:24:51.000Z",
        "updatedAt": "2026-09-21T07:24:51.000Z"
      },
      {
        "id": 5,
        "title": "ROYAL NEET CHEMISTRY ",
        "description": "Royal NEET JEE Academy Dharmapuri ",
        "price": "0.00",
        "thumbnail": null,
        "category": "NEET ",
        "level": "beginner",
        "status": "draft",
        "instructor_name": "Munusamy.S",
        "createdAt": "2026-09-03T12:57:41.000Z",
        "updatedAt": "2026-09-03T12:57:41.000Z"
      },
      {
        "id": 4,
        "title": "UG-TRB CHEMISTRY ",
        "description": "UG TRB chemistry,PG TRB chemistry, NEET JEE Academy, Royal NEET JEE Academy Dharmapuri.",
        "price": "1001.00",
        "thumbnail": null,
        "category": "TRB -NEET-JEE ",
        "level": "advanced",
        "status": "published",
        "instructor_name": "Munusamy.S",
        "createdAt": "2026-08-11T13:03:59.000Z",
        "updatedAt": "2026-08-11T13:03:59.000Z"
      },
      {
        "id": 2,
        "title": "React & Next.js Masterclass",
        "description": "Build premium, production-ready web applications with React 18, Vite, Next.js, and modern state management patterns.",
        "price": "5000.00",
        "thumbnail": "/uploads/react_course.png",
        "category": "Web Development",
        "level": "beginner",
        "status": "published",
        "instructor_name": "Testing Instructor",
        "createdAt": "2026-07-02T09:19:13.000Z",
        "updatedAt": "2026-07-02T09:19:13.000Z"
      },
      {
        "id": 3,
        "title": "Node.js Backend & API Development",
        "description": "Develop high-performance REST APIs and real-time backend structures using Node.js, Express, Sequelize, and MySQL databases.",
        "price": "3500.00",
        "thumbnail": "/uploads/nodejs_course.png",
        "category": "Backend Development",
        "level": "advanced",
        "status": "published",
        "instructor_name": "Dr. Vinoth Kumar",
        "createdAt": "2026-07-02T09:19:13.000Z",
        "updatedAt": "2026-07-02T09:19:13.000Z"
      },
      {
        "id": 1,
        "title": "Data Structures & Algorithms",
        "description": "Master the fundamental building blocks of software engineering. Learn to analyze time & space complexity, design optimized algorithmic paths, and structure complex computational datasets.",
        "price": "1500.00",
        "thumbnail": "/uploads/dsa_course.png",
        "category": "Computer Science",
        "level": "intermediate",
        "status": "published",
        "instructor_name": "Dr. Vinoth Kumar",
        "createdAt": "2026-07-02T09:19:12.000Z",
        "updatedAt": "2026-07-02T09:19:12.000Z"
      }
    ];

    final parsedCourses = rawCourses.map((c) => CourseModel.fromJson(c)).toList();
    final mockProvider = MockAdminProvider()..courses = parsedCourses;

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: ChangeNotifierProvider<AdminProvider>.value(
          value: mockProvider,
          child: const AdminCoursesScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('PG-TRB CHEMISTRY '), findsOneWidget);
    expect(find.text('ROYAL NEET CHEMISTRY '), findsOneWidget);
    expect(find.text('Manage Syllabus & Videos'), findsWidgets);
  });
}
