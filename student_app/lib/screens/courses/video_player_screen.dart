import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:provider/provider.dart';
import '../../models/course_model.dart';
import '../../providers/cart_provider.dart';
import '../../core/constants/app_constants.dart';

class VideoPlayerScreen extends StatefulWidget {
  final CourseModel course;
  final CourseModuleModel initialModule;

  const VideoPlayerScreen({
    super.key,
    required this.course,
    required this.initialModule,
  });

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  late CourseModuleModel _currentModule;
  YoutubePlayerController? _youtubeController;
  bool _isPlayerReady = false;

  @override
  void initState() {
    super.initState();
    _currentModule = widget.initialModule;
    _initPlayer();
  }

  void _initPlayer() {
    // Safely dispose old controller if any
    _youtubeController?.dispose();
    _isPlayerReady = false;

    final videoId = YoutubePlayer.convertUrlToId(_currentModule.youtubeUrl ?? '') ?? '';

    _youtubeController = YoutubePlayerController(
      initialVideoId: videoId,
      flags: const YoutubePlayerFlags(
        autoPlay: true,
        mute: false,
        disableDragSeek: false,
        loop: false,
        isLive: false,
        forceHD: false,
        enableCaption: true,
      ),
    )..addListener(_listener);
  }

  void _listener() {
    if (mounted && _youtubeController != null && _youtubeController!.value.isReady) {
      if (!_isPlayerReady) {
        setState(() {
          _isPlayerReady = true;
        });
      }
    }
  }

  void _changeModule(CourseModuleModel module) {
    if (module.type != 'video' || module.youtubeUrl == null || module.youtubeUrl!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${module.title} is not a playable video.'),
          backgroundColor: Colors.red[700],
        ),
      );
      return;
    }

    setState(() {
      _currentModule = module;
      _initPlayer();
    });
  }

  @override
  void deactivate() {
    // Pauses video when navigating away
    _youtubeController?.pause();
    super.deactivate();
  }

  @override
  void dispose() {
    _youtubeController?.removeListener(_listener);
    _youtubeController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_youtubeController == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final cartProvider = context.watch<CartProvider>();

    return YoutubePlayerBuilder(
      onExitFullScreen: () {
        // Safe check for returning from landscape
      },
      player: YoutubePlayer(
        controller: _youtubeController!,
        showVideoProgressIndicator: true,
        progressIndicatorColor: AppConstants.primaryColor,
        progressColors: const ProgressBarColors(
          playedColor: AppConstants.primaryColor,
          handleColor: AppConstants.primaryColor,
        ),
        onReady: () {
          _isPlayerReady = true;
        },
        onEnded: (data) {
          // Try to play next module automatically
          _playNextModule();
        },
      ),
      builder: (context, player) {
        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            backgroundColor: Colors.white,
            foregroundColor: Colors.black87,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: Text(
              widget.course.title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
          body: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. YouTube Player Section
              Container(
                color: Colors.black,
                child: AspectRatio(
                  aspectRatio: 16 / 9,
                  child: player,
                ),
              ),

              // 2. Active Module Info Bar
              Padding(
                padding: const EdgeInsets.all(16.0),
                key: ValueKey(_currentModule.id),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _currentModule.isFree
                                ? Colors.green.withAlpha(20)
                                : Colors.amber.withAlpha(20),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: _currentModule.isFree
                                  ? Colors.green.withAlpha(60)
                                  : Colors.amber.withAlpha(60),
                            ),
                          ),
                          child: Text(
                            _currentModule.isFree ? '🆓 Free Preview' : '👑 Premium Lesson',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: _currentModule.isFree ? Colors.green[800] : Colors.amber[800],
                            ),
                          ),
                        ),
                        if (_currentModule.duration != null) ...[
                          const SizedBox(width: 8),
                          Icon(Icons.schedule_rounded, size: 14, color: Colors.grey[600]),
                          const SizedBox(width: 4),
                          Text(
                            '${_currentModule.duration} mins',
                            style: TextStyle(color: Colors.grey[600], fontSize: 12),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _currentModule.title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
              ),

              Divider(height: 1, color: Colors.grey[200]),

              // 3. Syllabus/Module Navigation List
              Expanded(
                child: Container(
                  color: Colors.grey[50],
                  child: ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      const Text(
                        'Course Curriculum',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...widget.course.sections.map((sec) => _buildSectionGroup(sec, cartProvider)),
                      // Render direct modules without section
                      if (widget.course.modules.where((m) => m.sectionId == null).isNotEmpty) ...[
                        const SizedBox(height: 12),
                        const Text(
                          'General Lectures',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey),
                        ),
                        const SizedBox(height: 8),
                        ...widget.course.modules
                            .where((m) => m.sectionId == null)
                            .map((module) => _buildModuleRow(module, cartProvider)),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSectionGroup(CourseSectionModel section, CartProvider cartProvider) {
    final directModules = section.modules;

    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        title: Text(
          section.title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        subtitle: Text(
          '${directModules.length} lectures',
          style: TextStyle(color: Colors.grey[500], fontSize: 11),
        ),
        tilePadding: EdgeInsets.zero,
        childrenPadding: EdgeInsets.zero,
        initiallyExpanded: true,
        children: [
          ...directModules.map((mod) => _buildModuleRow(mod, cartProvider)),
          // Subsections
          ...section.subsections.map((sub) => Padding(
                padding: const EdgeInsets.only(left: 12.0),
                child: _buildSectionGroup(sub, cartProvider),
              )),
        ],
      ),
    );
  }

  Widget _buildModuleRow(CourseModuleModel module, CartProvider cartProvider) {
    final isFullyEnrolled = cartProvider.isEnrolled(widget.course.id) ||
        cartProvider.myEnrollments.any((e) {
          if (e.courseId != widget.course.id) return false;
          final s = e.requestStatus.toLowerCase();
          final st = e.status.toLowerCase();
          return s == 'enrolled' || s == 'paymentverified' || st == 'enrolled' || st == 'verified';
        });

    final canAccess = module.isFree || isFullyEnrolled;
    final isPlaying = _currentModule.id == module.id;

    return Container(
      margin: const EdgeInsets.only(bottom: 6.0),
      decoration: BoxDecoration(
        color: isPlaying
            ? AppConstants.primaryColor.withAlpha(12)
            : canAccess
                ? Colors.white
                : Colors.grey[100],
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isPlaying
              ? AppConstants.primaryColor.withAlpha(60)
              : canAccess
                  ? Colors.grey[200]!
                  : Colors.grey[300]!,
        ),
      ),
      child: ListTile(
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12.0),
        leading: Icon(
          module.type == 'video'
              ? Icons.play_circle_outline_rounded
              : Icons.description_outlined,
          color: isPlaying
              ? AppConstants.primaryColor
              : canAccess
                  ? Colors.grey[700]
                  : Colors.grey[400],
          size: 20,
        ),
        title: Text(
          module.title,
          style: TextStyle(
            fontWeight: isPlaying ? FontWeight.bold : FontWeight.normal,
            fontSize: 13,
            color: isPlaying
                ? AppConstants.primaryColor
                : canAccess
                    ? Colors.black87
                    : Colors.grey[500],
          ),
        ),
        subtitle: module.duration != null
            ? Text('${module.duration} mins', style: TextStyle(fontSize: 10, color: Colors.grey[600]))
            : null,
        trailing: isPlaying
            ? const Icon(Icons.volume_up_rounded, color: AppConstants.primaryColor, size: 18)
            : canAccess
                ? (module.type == 'video'
                    ? const Icon(Icons.play_arrow_rounded, color: Colors.green, size: 18)
                    : const Icon(Icons.open_in_new_rounded, color: Colors.green, size: 16))
                : const Icon(Icons.lock_outline, color: Colors.grey, size: 16),
        onTap: () {
          if (!canAccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('👑 Premium Content — Unlock by purchasing this course.'),
                backgroundColor: Colors.amber,
              ),
            );
            return;
          }
          if (module.type == 'video') {
            _changeModule(module);
          } else {
            // Launch other material types
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Opening document materials...')),
            );
          }
        },
      ),
    );
  }

  void _playNextModule() {
    // Find all video modules in flat order
    final List<CourseModuleModel> flatVideos = [];
    
    // Add non-section videos
    flatVideos.addAll(widget.course.modules.where((m) => m.sectionId == null && m.type == 'video'));
    
    // Add section videos recursively
    for (var sec in widget.course.sections) {
      _extractSectionVideos(sec, flatVideos);
    }

    final currentIndex = flatVideos.indexWhere((m) => m.id == _currentModule.id);
    if (currentIndex != -1 && currentIndex + 1 < flatVideos.length) {
      final nextModule = flatVideos[currentIndex + 1];
      _changeModule(nextModule);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Playing next: ${nextModule.title}'),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  void _extractSectionVideos(CourseSectionModel section, List<CourseModuleModel> flatVideos) {
    flatVideos.addAll(section.modules.where((m) => m.type == 'video'));
    for (var sub in section.subsections) {
      _extractSectionVideos(sub, flatVideos);
    }
  }
}
