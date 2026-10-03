class AdminStats {
  final int totalStudents;
  final int totalCourses;
  final double totalRevenue;
  final int pendingPayments;

  AdminStats({
    required this.totalStudents,
    required this.totalCourses,
    required this.totalRevenue,
    required this.pendingPayments,
  });

  factory AdminStats.fromJson(Map<String, dynamic> json) {
    return AdminStats(
      totalStudents: json['totalStudents'] ?? json['students_count'] ?? json['students'] ?? 0,
      totalCourses: json['totalCourses'] ?? json['courses_count'] ?? json['courses'] ?? 0,
      totalRevenue: (json['totalRevenue'] ?? json['revenue'] ?? 0).toDouble(),
      pendingPayments: json['pendingPayments'] ?? json['pending_payments'] ?? json['pending'] ?? 0,
    );
  }
}

class AdminStudent {
  final dynamic id;
  final String name;
  final String email;
  final String? phone;
  final bool isActive;
  final DateTime? createdAt;

  AdminStudent({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.isActive,
    this.createdAt,
  });

  factory AdminStudent.fromJson(Map<String, dynamic> json) {
    return AdminStudent(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? json['mobile_number'],
      isActive: json['is_active'] == true || json['is_active'] == 1 || json['isActive'] == true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : (json['created_at'] != null ? DateTime.tryParse(json['created_at'].toString()) : (json['joined_at'] != null ? DateTime.tryParse(json['joined_at'].toString()) : null)),
    );
  }
}

class AdminPayment {
  final dynamic id;
  final String studentName;
  final String courseTitle;
  final double amount;
  final String status;
  final String? proofUrl;
  final DateTime? createdAt;

  AdminPayment({
    required this.id,
    required this.studentName,
    required this.courseTitle,
    required this.amount,
    required this.status,
    this.proofUrl,
    this.createdAt,
  });

  factory AdminPayment.fromJson(Map<String, dynamic> json) {
    final studentMap = json['Student'] as Map<String, dynamic>?;
    final enrollmentMap = json['Enrollment'] as Map<String, dynamic>?;
    final courseMap = enrollmentMap?['Course'] as Map<String, dynamic>?;

    return AdminPayment(
      id: json['id'] is int ? json['id'] : (int.tryParse(json['id'].toString()) ?? json['id']?.toString() ?? ''),
      studentName: studentMap?['name'] ?? json['student_name'] ?? 'Student',
      courseTitle: courseMap?['title'] ?? json['course_title'] ?? 'Course',
      amount: double.tryParse((json['amount'] ?? 0).toString()) ?? 0.0,
      status: (json['status'] ?? 'pending').toString().toUpperCase(),
      proofUrl: json['proof_url'] ?? json['proofUrl'],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : (json['created_at'] != null ? DateTime.tryParse(json['created_at'].toString()) : null),
    );
  }
}
