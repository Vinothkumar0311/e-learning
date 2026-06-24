import 'package:flutter/material.dart';
import 'package:flutter_cached_pdfview/flutter_cached_pdfview.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/progress_provider.dart';

class PDFViewerScreen extends StatefulWidget {
  final String pdfUrl;
  final String title;
  final int? courseId;
  final int? moduleId;

  const PDFViewerScreen({
    super.key,
    required this.pdfUrl,
    required this.title,
    this.courseId,
    this.moduleId,
  });

  @override
  State<PDFViewerScreen> createState() => _PDFViewerScreenState();
}

class _PDFViewerScreenState extends State<PDFViewerScreen> {
  int _currentPage = 0;
  int _totalPages = 0;
  bool _isReady = false;
  PDFViewController? _pdfViewController;

  @override
  Widget build(BuildContext context) {
    // Standardize URL to absolute path if needed, e.g. pointing to backend server
    String finalUrl = widget.pdfUrl;
    
    // If the URL is relative, construct the full URL
    if (finalUrl.startsWith('/')) {
      final host = AppConstants.baseUrl.replaceAll('/api', '');
      finalUrl = '$host$finalUrl';
    } else if (finalUrl.startsWith('http://192.168.1.107:5000')) {
      // If server returned the hardcoded local IP from original route, 
      // check if we need to replace it with 10.0.2.2 or current baseUrl host
      final baseUrlUri = Uri.parse(AppConstants.baseUrl);
      final urlUri = Uri.parse(finalUrl);
      finalUrl = urlUri.replace(
        host: baseUrlUri.host,
        port: baseUrlUri.port,
      ).toString();
    }

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            if (_isReady && _totalPages > 0)
              Text(
                'Page ${_currentPage + 1} of $_totalPages',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
          ],
        ),
        actions: [
          // Refresh/Retry or extra actions could go here
        ],
      ),
      body: Stack(
        children: [
          PDF(
            enableSwipe: true,
            swipeHorizontal: false,
            autoSpacing: true,
            pageFling: true,
            pageSnap: true,
            onPageChanged: (int? page, int? total) {
              if (page != null && total != null) {
                setState(() {
                  _currentPage = page;
                  _totalPages = total;
                });
              }
            },
            onViewCreated: (PDFViewController controller) {
              setState(() {
                _pdfViewController = controller;
                _isReady = true;
              });
              if (widget.courseId != null && widget.moduleId != null) {
                try {
                  context.read<ProgressProvider>().markComplete(widget.courseId!, widget.moduleId!);
                } catch (e) {
                  // Suppress errors to avoid blocking viewing experience
                }
              }
            },
          ).cachedFromUrl(
            finalUrl,
            placeholder: (double progress) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(
                    color: AppConstants.primaryColor,
                    strokeWidth: 3.5,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Downloading PDF... ${progress.toStringAsFixed(0)}%',
                    style: TextStyle(
                      color: Colors.grey[700],
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            errorWidget: (dynamic error) => Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.error_outline_rounded,
                        color: Colors.red[700],
                        size: 40,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Failed to load document',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[800],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      error.toString(),
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[500],
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {
                        // Re-trigger rebuild
                        setState(() {});
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppConstants.primaryColor,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Try Again'),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Navigation overlays (prev/next page floating buttons)
          if (_isReady && _totalPages > 1)
            Positioned(
              left: 0,
              right: 0,
              bottom: 24,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(220),
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(15),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_rounded),
                        color: _currentPage > 0 
                            ? AppConstants.primaryColor 
                            : Colors.grey[400],
                        onPressed: _currentPage > 0
                            ? () {
                                _currentPage--;
                                _pdfViewController?.setPage(_currentPage);
                              }
                            : null,
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          '${_currentPage + 1} / $_totalPages',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.arrow_forward_rounded),
                        color: _currentPage < _totalPages - 1
                            ? AppConstants.primaryColor
                            : Colors.grey[400],
                        onPressed: _currentPage < _totalPages - 1
                            ? () {
                                _currentPage++;
                                _pdfViewController?.setPage(_currentPage);
                              }
                            : null,
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
