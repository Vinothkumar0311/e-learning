import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../models/course_model.dart';
import '../core/constants/app_constants.dart';

class CourseCard extends StatelessWidget {
  final CourseModel course;
  
  const CourseCard({super.key, required this.course});

  Widget _buildPlaceholder(String title) {
    LinearGradient gradient;
    IconData icon;
    Color iconColor;

    final lowerTitle = title.toLowerCase();
    if (lowerTitle.contains('react')) {
      gradient = const LinearGradient(
        colors: [Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
      icon = Icons.code_rounded;
      iconColor = const Color(0xFF61DAFB);
    } else if (lowerTitle.contains('node')) {
      gradient = const LinearGradient(
        colors: [Color(0xFF11998e), Color(0xFF38ef7d)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
      icon = Icons.terminal_rounded;
      iconColor = Colors.white;
    } else {
      gradient = const LinearGradient(
        colors: [Color(0xFF6366F1), Color(0xFFA855F7)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
      icon = Icons.school_rounded;
      iconColor = Colors.white.withAlpha(230);
    }

    return Container(
      width: double.infinity,
      height: 75,
      decoration: BoxDecoration(
        gradient: gradient,
      ),
      child: Stack(
        children: [
          Positioned(
            right: -10,
            bottom: -10,
            child: Icon(
              icon,
              color: Colors.white.withAlpha(20),
              size: 70,
            ),
          ),
          Center(
            child: Icon(icon, color: iconColor, size: 36),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    String? imageUrl = course.thumbnail;
    if (imageUrl != null && imageUrl.isNotEmpty) {
      if (imageUrl.startsWith('/')) {
        final host = AppConstants.baseUrl.replaceAll('/api', '');
        imageUrl = '$host$imageUrl';
      }
    } else {
      imageUrl = null;
    }

    return GestureDetector(
      onTap: () => context.push('/course/${course.id}'),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              child: imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: imageUrl,
                      height: 75,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        height: 75,
                        color: Colors.grey[50],
                        child: const Center(
                          child: SizedBox(
                            width: 16,
                            height: 12,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppConstants.primaryColor),
                          ),
                        ),
                      ),
                      errorWidget: (context, url, error) => _buildPlaceholder(course.title),
                    )
                  : _buildPlaceholder(course.title),
            ),
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    // decoration: BoxDecoration(
                    //   color: AppConstants.primaryColor.withAlpha(25),
                    //   borderRadius: BorderRadius.circular(8),
                    // ),
                    // child: Text(
                    //   course.category ?? 'Uncategorized',
                    //   style: const TextStyle(
                    //     fontSize: 10,
                    //     fontWeight: FontWeight.bold,
                    //     color: AppConstants.primaryColor,
                    //   ),
                    // ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    course.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, height: 1.2),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'by ${course.instructorName}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '₹${course.price.toStringAsFixed(0)}', // Use INR ₹ symbol for consistency with student pricing
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                          color: AppConstants.primaryColor,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.grey[50],
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.arrow_forward_ios, size: 10, color: AppConstants.primaryColor),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
