import 'course_model.dart';

class EnrollmentStatusModel {
  final int id;
  final String studentId;
  final int courseId;
  final String status;
  final String requestStatus;
  final String feeStatus;
  final String paymentStatus;
  final double? finalAmount;
  final double? discountAmount;
  final DateTime? paymentDueDate;
  final String? adminNotes;
  final DateTime createdAt;
  final CourseModel? course;
  final PaymentDetailModel? payment;

  EnrollmentStatusModel({
    required this.id,
    required this.studentId,
    required this.courseId,
    required this.status,
    required this.requestStatus,
    required this.feeStatus,
    required this.paymentStatus,
    this.finalAmount,
    this.discountAmount,
    this.paymentDueDate,
    this.adminNotes,
    required this.createdAt,
    this.course,
    this.payment,
  });

  factory EnrollmentStatusModel.fromJson(Map<String, dynamic> json) {
    return EnrollmentStatusModel(
      id: json['id'],
      studentId: json['student_id'].toString(),
      courseId: json['course_id'],
      status: json['status'] ?? 'pending',
      requestStatus: json['request_status'] ?? 'Pending',
      feeStatus: json['fee_status'] ?? 'Pending',
      paymentStatus: json['payment_status'] ?? 'Pending',
      finalAmount: json['final_amount'] != null ? double.parse(json['final_amount'].toString()) : null,
      discountAmount: json['discount_amount'] != null ? double.parse(json['discount_amount'].toString()) : null,
      paymentDueDate: json['payment_due_date'] != null ? DateTime.parse(json['payment_due_date']) : null,
      adminNotes: json['admin_notes'] ?? json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
      course: json['Course'] != null ? CourseModel.fromJson(json['Course']) : null,
      payment: json['Payments'] != null && (json['Payments'] as List).isNotEmpty
          ? (() {
              final list = json['Payments'] as List;
              final active = list.firstWhere(
                (p) => p['status'] == 'pending' || p['status'] == 'submitted',
                orElse: () => list.first,
              );
              return PaymentDetailModel.fromJson(active);
            })()
          : null,
    );
  }
}

class PaymentDetailModel {
  final int id;
  final double amount;
  final String method;
  final String status;
  final String? proofUrl;
  final String? transactionRef;
  final String? paymentMode;
  final String? receiptNumber;
  final DateTime? paidAt;

  PaymentDetailModel({
    required this.id,
    required this.amount,
    required this.method,
    required this.status,
    this.proofUrl,
    this.transactionRef,
    this.paymentMode,
    this.receiptNumber,
    this.paidAt,
  });

  factory PaymentDetailModel.fromJson(Map<String, dynamic> json) {
    return PaymentDetailModel(
      id: json['id'],
      amount: double.parse(json['amount'].toString()),
      method: json['method'] ?? '',
      status: json['status'] ?? 'pending',
      proofUrl: json['proof_url'],
      transactionRef: json['transaction_ref'],
      paymentMode: json['payment_mode'],
      receiptNumber: json['receipt_number'],
      paidAt: json['paid_at'] != null ? DateTime.parse(json['paid_at']) : null,
    );
  }
}
