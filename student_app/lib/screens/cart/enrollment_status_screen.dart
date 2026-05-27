import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/cart_provider.dart';
import '../../models/enrollment_status_model.dart';
import '../../core/constants/app_constants.dart';

class EnrollmentStatusScreen extends StatefulWidget {
  const EnrollmentStatusScreen({super.key});

  @override
  State<EnrollmentStatusScreen> createState() => _EnrollmentStatusScreenState();
}

class _EnrollmentStatusScreenState extends State<EnrollmentStatusScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (mounted) {
        context.read<CartProvider>().fetchEnrollments(showLoading: true);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Applications & Admissions', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => cartProvider.fetchEnrollments(showLoading: true),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => cartProvider.fetchEnrollments(showLoading: false),
        color: AppConstants.primaryColor,
        child: cartProvider.isLoading && cartProvider.myEnrollments.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : cartProvider.myEnrollments.isEmpty
                ? _buildEmptyState(context)
                : ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: cartProvider.myEnrollments.length,
                    itemBuilder: (context, index) {
                      final enrollment = cartProvider.myEnrollments[index];
                      return _buildEnrollmentCard(context, enrollment);
                    },
                  ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.7,
        alignment: Alignment.center,
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.history_edu, size: 84, color: Colors.grey[300]),
            const SizedBox(height: 24),
            const Text(
              'No Enrollment History',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              'You have no pending course applications or active enrollments at this moment.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600], fontSize: 13),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppConstants.primaryColor,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Browse Courses', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEnrollmentCard(BuildContext context, EnrollmentStatusModel enrollment) {
    final reqStatus = enrollment.requestStatus;
    final course = enrollment.course;

    if (course == null) return const SizedBox.shrink();

    // Map stages
    int currentStep = 0;
    final reqStatusLower = enrollment.requestStatus.toLowerCase();
    final statusLower = enrollment.status.toLowerCase();

    if (reqStatusLower == 'reviewing' || statusLower == 'reviewed') currentStep = 1;
    if (reqStatusLower == 'amountassigned' || statusLower == 'fee_set') currentStep = 2;
    if (reqStatusLower == 'approved' || reqStatusLower == 'paymentpending' || statusLower == 'payment_requested') currentStep = 3;
    if (reqStatusLower == 'paymentsubmitted') currentStep = 4;
    if (reqStatusLower == 'paymentverified' || reqStatusLower == 'enrolled' || statusLower == 'verified' || statusLower == 'enrolled') currentStep = 5;
    if (reqStatusLower == 'rejected' || statusLower == 'rejected') currentStep = -1;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(20),
      ),
      margin: const EdgeInsets.only(bottom: 20),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    course.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
                _buildStatusChip(reqStatus),
              ],
            ),
            const SizedBox(height: 8),
            Text('Instructor: ${course.instructorName}', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
            const SizedBox(height: 20),

            // Timeline Steps Graphic
            _buildTimeline(currentStep),

            const SizedBox(height: 24),

            // Financial Summary Block
            if (enrollment.finalAmount != null)
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Assigned Fee Summary', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              '₹${enrollment.finalAmount!.toStringAsFixed(0)}',
                              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppConstants.primaryColor),
                            ),
                            if (enrollment.discountAmount != null && enrollment.discountAmount! > 0)
                              Padding(
                                padding: const EdgeInsets.only(left: 8.0),
                                child: Text(
                                  '(Saved ₹${enrollment.discountAmount!.toStringAsFixed(0)})',
                                  style: const TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                    if (enrollment.paymentDueDate != null)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('Due Date', style: TextStyle(color: Colors.grey, fontSize: 11)),
                          const SizedBox(height: 4),
                          Text(
                            '${enrollment.paymentDueDate!.day}/${enrollment.paymentDueDate!.month}/${enrollment.paymentDueDate!.year}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
                  ],
                ),
              ),

            // Notes from Admin
            if (enrollment.adminNotes != null && enrollment.adminNotes!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 14.0),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.amber[50],
                    border: Border.all(color: Colors.amber[200]!),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Reviewer Notes: ${enrollment.adminNotes}',
                    style: TextStyle(color: Colors.amber[900], fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ),

            // Action triggers (e.g. proof upload button)
            if (enrollment.payment != null && enrollment.payment!.status == 'pending')
              Padding(
                padding: const EdgeInsets.only(top: 20.0),
                child: SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      context.push(
                        '/payment-upload',
                        extra: {
                          'paymentId': enrollment.payment!.id,
                          'amount': enrollment.payment!.amount,
                          'courseTitle': course.title,
                        },
                      );
                    },
                    icon: const Icon(Icons.cloud_upload_outlined, color: Colors.white),
                    label: Text('Upload UPI Receipt screenshot (₹${enrollment.payment!.amount.toStringAsFixed(0)})', style: const TextStyle(fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.orange[800],
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ),

            if (enrollment.payment != null && enrollment.payment!.status == 'submitted')
              Padding(
                padding: const EdgeInsets.only(top: 14.0),
                child: Row(
                  children: [
                    const Icon(Icons.hourglass_empty, color: Colors.orange, size: 16),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Awaiting manual receipt check by support team for ₹${enrollment.payment!.amount.toStringAsFixed(0)}...',
                        style: TextStyle(color: Colors.orange[900], fontSize: 11, fontWeight: FontWeight.bold),
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

  Widget _buildStatusChip(String status) {
    Color bg = Colors.yellow[50]!;
    Color text = Colors.yellow[900]!;

    final s = status.toLowerCase();

    if (s == 'reviewing' || s == 'reviewed') {
      bg = Colors.blue[50]!;
      text = Colors.blue[900]!;
    } else if (s == 'amountassigned' || s == 'fee_set') {
      bg = Colors.orange[50]!;
      text = Colors.orange[900]!;
    } else if (s == 'approved' || s == 'paymentpending' || s == 'payment_requested') {
      bg = Colors.indigo[50]!;
      text = Colors.indigo[900]!;
    } else if (s == 'paymentsubmitted') {
      bg = Colors.amber[50]!;
      text = Colors.amber[900]!;
    } else if (s == 'paymentverified' || s == 'enrolled' || s == 'verified') {
      bg = Colors.green[50]!;
      text = Colors.green[900]!;
    } else if (s == 'rejected') {
      bg = Colors.red[50]!;
      text = Colors.red[900]!;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(30),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: text, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildTimeline(int currentStep) {
    final stages = ['Applied', 'Review', 'Pricing', 'Awaiting Pay', 'Submitted', 'Enrolled'];

    if (currentStep == -1) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.red[50],
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Row(
          children: [
            Icon(Icons.cancel, color: Colors.red),
            SizedBox(width: 8),
            Text(
              'Application Rejected',
              style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(stages.length, (index) {
            final isDone = currentStep >= index;
            final isCurrent = currentStep == index;

            return Expanded(
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: isDone ? AppConstants.primaryColor : Colors.grey[200],
                      shape: BoxShape.circle,
                      border: isCurrent ? Border.all(color: Colors.orange, width: 2) : null,
                    ),
                    child: Center(
                      child: isDone
                          ? const Icon(Icons.check, size: 14, color: Colors.white)
                          : Text('${index + 1}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                    ),
                  ),
                  if (index < stages.length - 1)
                    Expanded(
                      child: Container(
                        height: 2,
                        color: currentStep > index ? AppConstants.primaryColor : Colors.grey[200],
                      ),
                    ),
                ],
              ),
            );
          }),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(stages.length, (index) {
            final isCurrent = currentStep == index;
            return Text(
              stages[index],
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 9,
                fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                color: isCurrent ? AppConstants.primaryColor : Colors.grey[600],
              ),
            );
          }),
        ),
      ],
    );
  }
}
