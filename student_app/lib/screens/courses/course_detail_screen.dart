import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../providers/cart_provider.dart';
import '../../models/course_model.dart';
import '../../services/course_service.dart';
import '../../core/constants/app_constants.dart';

class CourseDetailScreen extends StatefulWidget {
  final int courseId;

  const CourseDetailScreen({super.key, required this.courseId});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  final CourseService _courseService = CourseService();
  CourseModel? _course;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchDetail();
  }

  Future<void> _fetchDetail() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final c = await _courseService.getCourse(widget.courseId);
      if (mounted) {
        context.read<CartProvider>().fetchEnrollments(showLoading: false);
      }
      setState(() {
        _course = c;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Course Details',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body:
          _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null || _course == null
              ? Center(child: Text(_error ?? 'Course not found'))
              : _buildContent(context, cartProvider),
    );
  }

  Widget _buildContent(BuildContext context, CartProvider cartProvider) {
    final course = _course!;

    // Check if course is already in cart
    final isInCart =
        cartProvider.cart?.items.any((item) => item.courseId == course.id) ??
        false;

    // Check enrollment — use both myCourses (fully enrolled) and myEnrollments (all stages)
    final isFullyEnrolled =
        cartProvider.isEnrolled(course.id) ||
        cartProvider.myEnrollments.any((e) {
          if (e.courseId != course.id) return false;
          final s = e.requestStatus.toLowerCase();
          final st = e.status.toLowerCase();
          return s == 'enrolled' ||
              s == 'paymentverified' ||
              st == 'enrolled' ||
              st == 'verified';
        });

    final enrollment =
        cartProvider.myEnrollments.any((e) => e.courseId == course.id)
            ? cartProvider.myEnrollments.firstWhere(
              (e) => e.courseId == course.id,
            )
            : null;
    final hasEnrollment = enrollment != null;

    final myCourseInstance =
        cartProvider.myCourses.any((c) => c.id == course.id)
            ? cartProvider.myCourses.firstWhere((c) => c.id == course.id)
            : null;
    final isBlocked = course.isBlocked || (myCourseInstance?.isBlocked ?? false);
    final blockReason =
        course.blockReason ?? myCourseInstance?.blockReason ?? 'Access suspended by Administrator';
    final remainingAmount = course.remainingAmount > 0 ? course.remainingAmount : (myCourseInstance?.remainingAmount ?? 0.0);
    final paidAmount = course.paidAmount > 0 ? course.paidAmount : (myCourseInstance?.paidAmount ?? 0.0);

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CachedNetworkImage(
                  imageUrl:
                      course.thumbnail ?? 'https://via.placeholder.com/600x300',
                  height: 240,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorWidget:
                      (context, url, error) => Container(
                        height: 240,
                        color: Colors.grey[200],
                        child: const Icon(
                          Icons.broken_image,
                          size: 64,
                          color: Colors.grey,
                        ),
                      ),
                ),
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (isBlocked) ...[
                        Container(
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.red[200]!),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                Icons.gpp_bad_rounded,
                                color: Colors.red[700],
                                size: 28,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'COURSE ACCESS SUSPENDED',
                                      style: TextStyle(
                                        color: Colors.red[900],
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      blockReason,
                                      style: TextStyle(
                                        color: Colors.red[700],
                                        fontSize: 13,
                                        height: 1.4,
                                      ),
                                    ),
                                    if (remainingAmount > 0) ...[
                                      const SizedBox(height: 10),
                                      Row(
                                        children: [
                                          Text(
                                            'Paid: ₹${paidAmount.toStringAsFixed(2)}',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                              color: Colors.black54,
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          Text(
                                            'Remaining: ₹${remainingAmount.toStringAsFixed(2)}',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                              color: Colors.red[900],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ] else if (remainingAmount > 0) ...[
                        Container(
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.orange[50],
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.orange[200]!),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                Icons.pending_actions_rounded,
                                color: Colors.orange[700],
                                size: 28,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'PARTIAL PAYMENT ACCESS',
                                      style: TextStyle(
                                        color: Colors.orange[900],
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      'You have active access to the course content. Please clear your remaining balance to avoid suspension.',
                                      style: TextStyle(
                                        color: Colors.orange[800],
                                        fontSize: 13,
                                        height: 1.4,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Row(
                                      children: [
                                        Text(
                                          'Paid: ₹${paidAmount.toStringAsFixed(2)}',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                            color: Colors.black54,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Text(
                                          'Pending Balance: ₹${remainingAmount.toStringAsFixed(2)}',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                            color: Colors.orange[900],
                                          ),
                                        ),
                                      ],
                                    ),
                                    if (enrollment != null &&
                                        enrollment.payment != null) ...[
                                      if (enrollment.payment!.status ==
                                          'pending') ...[
                                        const SizedBox(height: 12),
                                        SizedBox(
                                          width: double.infinity,
                                          height: 40,
                                          child: ElevatedButton.icon(
                                            onPressed: () {
                                              context.push(
                                                '/payment-upload',
                                                extra: {
                                                  'paymentId':
                                                      enrollment.payment!.id,
                                                  'amount':
                                                      enrollment
                                                          .payment!
                                                          .amount,
                                                  'courseTitle': course.title,
                                                },
                                              );
                                            },
                                            icon: const Icon(
                                              Icons.cloud_upload_outlined,
                                              size: 16,
                                              color: Colors.white,
                                            ),
                                            label: Text(
                                              'Upload Proof for ₹${enrollment.payment!.amount.toStringAsFixed(0)} Request',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  Colors.orange[800],
                                              foregroundColor: Colors.white,
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(10),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ] else if (enrollment.payment!.status ==
                                          'submitted') ...[
                                        const SizedBox(height: 12),
                                        Row(
                                          children: [
                                            const Icon(
                                              Icons.hourglass_empty_rounded,
                                              color: Colors.orange,
                                              size: 14,
                                            ),
                                            const SizedBox(width: 6),
                                            Expanded(
                                              child: Text(
                                                'Proof of ₹${enrollment.payment!.amount.toStringAsFixed(0)} uploaded. Awaiting verification...',
                                                style: TextStyle(
                                                  color: Colors.orange[900],
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ],
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: AppConstants.primaryColor.withValues(
                            alpha: 0.1,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          course.category ?? 'General',
                          style: const TextStyle(
                            color: AppConstants.primaryColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        course.title,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(
                            Icons.person_outline,
                            size: 16,
                            color: Colors.grey,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Instructor: ${course.instructorName}',
                            style: const TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'About this Course',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        course.description ??
                            'No description available for this course.',
                        style: TextStyle(
                          color: Colors.grey[700],
                          fontSize: 14,
                          height: 1.6,
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Course Syllabus',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      if (course.sections.isEmpty && course.modules.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24.0),
                          child: Center(
                            child: Text(
                              'Syllabus is being prepared by instructor.',
                              style: TextStyle(
                                color: Colors.grey,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ),
                        ),

                      // Render course sections
                      ...course.sections.map((section) {
                        final directLectures = section.modules;
                        final subSectionsList = section.subsections;
                        final subLecturesCount = subSectionsList.fold<int>(
                          0,
                          (sum, s) => sum + s.modules.length,
                        );
                        final totalLecturesCount =
                            directLectures.length + subLecturesCount;

                        final directDuration = directLectures.fold<int>(
                          0,
                          (sum, m) => sum + (m.duration ?? 0),
                        );
                        final subDuration = subSectionsList.fold<int>(
                          0,
                          (sum, s) =>
                              sum +
                              s.modules.fold<int>(
                                0,
                                (sSum, m) => sSum + (m.duration ?? 0),
                              ),
                        );
                        final totalDuration = directDuration + subDuration;

                        return Card(
                          margin: const EdgeInsets.only(bottom: 12.0),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: Colors.grey[200]!),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: ExpansionTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppConstants.primaryColor.withValues(
                                  alpha: 0.1,
                                ),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.folder_open_outlined,
                                color: AppConstants.primaryColor,
                                size: 20,
                              ),
                            ),
                            title: Text(
                              section.title,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                            subtitle: Text(
                              '$totalLecturesCount lectures • $totalDuration mins',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 12,
                              ),
                            ),
                            childrenPadding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                              vertical: 8.0,
                            ),
                            expandedCrossAxisAlignment:
                                CrossAxisAlignment.start,
                            shape: const Border(), // Remove boundary lines
                            children: [
                              if (section.description != null &&
                                  section.description!.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(
                                    bottom: 12.0,
                                    left: 8.0,
                                  ),
                                  child: Text(
                                    section.description!,
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                      fontSize: 13,
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                                ),

                              // Render Direct Modules
                              if (directLectures.isNotEmpty)
                                ...directLectures.map(
                                  (module) => _buildModuleTile(
                                    context,
                                    module,
                                    isFullyEnrolled,
                                    isBlocked,
                                    blockReason,
                                  ),
                                ),

                              // Render Subsections
                              if (subSectionsList.isNotEmpty) ...[
                                const SizedBox(height: 12),
                                Padding(
                                  padding: const EdgeInsets.only(
                                    left: 8.0,
                                    bottom: 8.0,
                                  ),
                                  child: Text(
                                    'SUBSECTIONS',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.grey[600],
                                      letterSpacing: 1.0,
                                    ),
                                  ),
                                ),
                                ...subSectionsList.map((sub) {
                                  final subDur = sub.modules.fold<int>(
                                    0,
                                    (sum, m) => sum + (m.duration ?? 0),
                                  );
                                  return Card(
                                    margin: const EdgeInsets.only(bottom: 8.0),
                                    color: Colors.grey[50],
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      side: BorderSide(
                                        color: Colors.grey[100]!,
                                      ),
                                    ),
                                    child: ExpansionTile(
                                      leading: Icon(
                                        Icons.subdirectory_arrow_right,
                                        color: AppConstants.primaryColor
                                            .withValues(alpha: 0.7),
                                        size: 18,
                                      ),
                                      title: Text(
                                        sub.title,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                        ),
                                      ),
                                      subtitle: Text(
                                        '${sub.modules.length} lectures • $subDur mins',
                                        style: TextStyle(
                                          color: Colors.grey[500],
                                          fontSize: 11,
                                        ),
                                      ),
                                      childrenPadding:
                                          const EdgeInsets.symmetric(
                                            horizontal: 12.0,
                                            vertical: 4.0,
                                          ),
                                      shape: const Border(),
                                      children: [
                                        if (sub.description != null &&
                                            sub.description!.isNotEmpty)
                                          Padding(
                                            padding: const EdgeInsets.only(
                                              bottom: 8.0,
                                              left: 8.0,
                                            ),
                                            child: Text(
                                              sub.description!,
                                              style: TextStyle(
                                                color: Colors.grey[500],
                                                fontSize: 11,
                                                fontStyle: FontStyle.italic,
                                              ),
                                            ),
                                          ),
                                        if (sub.modules.isEmpty)
                                          const Padding(
                                            padding: EdgeInsets.symmetric(
                                              vertical: 12.0,
                                            ),
                                            child: Center(
                                              child: Text(
                                                'No lectures in this subsection yet.',
                                                style: TextStyle(
                                                  color: Colors.grey,
                                                  fontSize: 11,
                                                ),
                                              ),
                                            ),
                                          )
                                        else
                                          ...sub.modules.map(
                                            (module) => _buildModuleTile(
                                              context,
                                              module,
                                              isFullyEnrolled,
                                              isBlocked,
                                              blockReason,
                                            ),
                                          ),
                                      ],
                                    ),
                                  );
                                }),
                              ],

                              if (totalLecturesCount == 0)
                                const Padding(
                                  padding: EdgeInsets.all(12.0),
                                  child: Center(
                                    child: Text(
                                      'No lectures in this section yet.',
                                      style: TextStyle(
                                        color: Colors.grey,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        );
                      }),

                      // Render Unassigned modules
                      if (course.modules
                          .where((m) => m.sectionId == null)
                          .isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Card(
                          margin: const EdgeInsets.only(bottom: 12.0),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: Colors.grey[200]!),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: ExpansionTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.orange.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.miscellaneous_services_outlined,
                                color: Colors.orange,
                                size: 20,
                              ),
                            ),
                            title: const Text(
                              'General Lectures',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                            subtitle: Text(
                              '${course.modules.where((m) => m.sectionId == null).length} lectures',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 12,
                              ),
                            ),
                            childrenPadding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                              vertical: 8.0,
                            ),
                            shape: const Border(),
                            children: [
                              ...course.modules
                                  .where((m) => m.sectionId == null)
                                  .map(
                                    (module) => _buildModuleTile(
                                      context,
                                      module,
                                      isFullyEnrolled,
                                      isBlocked,
                                      blockReason,
                                    ),
                                  ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.all(24.0),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: Row(
            children: [
              if (!isFullyEnrolled) ...[
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tuition Fee',
                        style: TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${course.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: AppConstants.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
              ],
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: _buildActionButton(
                    context,
                    cartProvider,
                    isInCart,
                    isFullyEnrolled,
                    hasEnrollment,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildModuleTile(
    BuildContext context,
    CourseModuleModel module,
    bool isFullyEnrolled,
    bool isBlocked,
    String blockReason,
  ) {
    IconData getModuleIcon() {
      switch (module.type) {
        case 'video':
          return Icons.play_circle_fill_outlined;
        case 'pdf':
          return Icons.description_outlined;
        case 'quiz':
          return Icons.assignment_outlined;
        default:
          return Icons.play_circle_fill_outlined;
      }
    }

    Color getModuleColor() {
      switch (module.type) {
        case 'video':
          return AppConstants.primaryColor;
        case 'pdf':
          return Colors.pink;
        case 'quiz':
          return Colors.green;
        default:
          return AppConstants.primaryColor;
      }
    }

    // A module is accessible if it's free OR the student is fully enrolled, AND not blocked
    final canAccess = (module.isFree || isFullyEnrolled) && !isBlocked;

    return Container(
      margin: const EdgeInsets.only(bottom: 8.0),
      decoration: BoxDecoration(
        color: canAccess ? Colors.white : Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color:
              module.isFree && !isBlocked
                  ? Colors.green.withAlpha(50)
                  : canAccess
                  ? AppConstants.primaryColor.withAlpha(40)
                  : Colors.grey[200]!,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 12.0,
          vertical: 4.0,
        ),
        leading: Stack(
          clipBehavior: Clip.none,
          children: [
            Icon(
              getModuleIcon(),
              color: canAccess ? getModuleColor() : Colors.grey[400],
              size: 24,
            ),
            if (module.isFree && !isBlocked)
              Positioned(
                right: -4,
                bottom: -4,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: const BoxDecoration(
                    color: Colors.green,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.lock_open,
                    color: Colors.white,
                    size: 8,
                  ),
                ),
              ),
          ],
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                module.title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: canAccess ? Colors.black87 : Colors.grey[500],
                ),
              ),
            ),
            const SizedBox(width: 6),
            // Free / Premium badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color:
                    module.isFree
                        ? Colors.green.withAlpha(20)
                        : Colors.amber.withAlpha(20),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color:
                      module.isFree
                          ? Colors.green.withAlpha(60)
                          : Colors.amber.withAlpha(60),
                ),
              ),
              child: Text(
                module.isFree ? '🆓 Free' : '👑 Premium',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: module.isFree ? Colors.green[700] : Colors.amber[800],
                ),
              ),
            ),
          ],
        ),
        subtitle: Text(
          '${module.type.toUpperCase()}${module.duration != null ? ' • ${module.duration} mins' : ''}',
          style: TextStyle(color: Colors.grey[600], fontSize: 12),
        ),
        trailing:
            canAccess
                ? IconButton(
                  icon: Icon(
                    Icons.play_circle_filled_rounded,
                    color:
                        module.isFree
                            ? Colors.green
                            : AppConstants.primaryColor,
                    size: 28,
                  ),
                  onPressed: () => _launchModuleContent(context, module),
                )
                : Icon(
                  isBlocked ? Icons.gpp_bad_rounded : Icons.lock_rounded,
                  size: 18,
                  color: isBlocked ? Colors.red : Colors.grey,
                ),
        onTap:
            isBlocked
                ? () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('⚠️ Access Blocked: $blockReason'),
                      backgroundColor: Colors.red[800],
                    ),
                  );
                }
                : (canAccess
                    ? () => _launchModuleContent(context, module)
                    : () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            '👑 Premium content — enroll to unlock this lesson',
                          ),
                          backgroundColor: Colors.amber,
                        ),
                      );
                    }),
      ),
    );
  }

  Future<void> _launchModuleContent(
    BuildContext context,
    CourseModuleModel module,
  ) async {
    if (module.type == 'video') {
      if (module.youtubeUrl == null || module.youtubeUrl!.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No YouTube link available for this video.'),
          ),
        );
        return;
      }
      // Navigate to in-app YouTube video player screen!
      context.push(
        '/course/${_course!.id}/play',
        extra: {'course': _course, 'module': module},
      );
      return;
    }

    if (module.type == 'pdf') {
      if (module.fileUrl == null || module.fileUrl!.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No PDF link available for this document.'),
          ),
        );
        return;
      }
      // Navigate to in-app PDF viewer screen!
      context.push(
        '/course/${_course!.id}/pdf',
        extra: {
          'pdfUrl': module.fileUrl,
          'title': module.title,
          'moduleId': module.id,
        },
      );
      return;
    }

    // Handle other document / media types with external browser
    String? urlToLaunch = module.fileUrl;
    if (urlToLaunch == null || urlToLaunch.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No link available for this lecture.')),
      );
      return;
    }

    final uri = Uri.parse(urlToLaunch);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open the lecture content: $urlToLaunch'),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to open link: $e')));
    }
  }

  Widget _buildActionButton(
    BuildContext context,
    CartProvider cartProvider,
    bool isInCart,
    bool isFullyEnrolled,
    bool hasEnrollment,
  ) {
    // ── Fully enrolled: course purchased & unlocked ──────────────
    if (isFullyEnrolled) {
      return ElevatedButton.icon(
        onPressed: () => context.go('/my-courses'),
        icon: const Icon(Icons.play_arrow_rounded, size: 20),
        label: const Text(
          'Continue Learning',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }

    // ── Has pending enrollment (waiting approval / payment) ──────
    if (hasEnrollment) {
      return ElevatedButton.icon(
        onPressed: () => context.push('/enrollment-status'),
        icon: const Icon(Icons.hourglass_top_rounded, size: 18),
        label: const Text(
          'Track Admission',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.orange[700],
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }

    // ── Already in cart ──────────────────────────────────────────
    if (isInCart) {
      return ElevatedButton.icon(
        onPressed: () => context.push('/cart'),
        icon: const Icon(Icons.shopping_cart_rounded, size: 18),
        label: const Text(
          'Go to Cart',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppConstants.primaryColor,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }

    // ── Default: Add to Cart ─────────────────────────────────────
    return ElevatedButton(
      onPressed:
          cartProvider.isLoading
              ? null
              : () async {
                try {
                  await cartProvider.addToCart(_course!.id);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Course added to cart!'),
                        action: SnackBarAction(
                          label: 'View Cart',
                          textColor: Colors.white,
                          onPressed: () => context.push('/cart'),
                        ),
                      ),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    final msg = e.toString();
                    String displayMsg;
                    if (msg.contains('ALREADY_PURCHASED')) {
                      displayMsg = 'You have already purchased this course.';
                    } else if (msg.contains('PENDING_APPROVAL')) {
                      displayMsg =
                          'Enrollment approval is pending for this course.';
                    } else if (msg.contains('ALREADY_IN_CART')) {
                      displayMsg = 'This course is already in your cart.';
                    } else if (msg.contains('ALREADY_ENROLLED')) {
                      displayMsg =
                          'You already have an enrollment request for this course.';
                    } else {
                      displayMsg = msg;
                    }
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(displayMsg),
                        backgroundColor: Colors.red[700],
                      ),
                    );
                  }
                }
              },
      style: ElevatedButton.styleFrom(
        backgroundColor: AppConstants.primaryColor,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child:
          cartProvider.isLoading
              ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2.5,
                ),
              )
              : const Text(
                'Add to Cart',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
    );
  }
}
