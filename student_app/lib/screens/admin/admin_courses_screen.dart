import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import '../../core/constants/app_constants.dart';
import '../../models/course_model.dart';
import '../../providers/admin_provider.dart';
import '../courses/video_player_screen.dart';

class AdminCoursesScreen extends StatefulWidget {
  const AdminCoursesScreen({super.key});

  @override
  State<AdminCoursesScreen> createState() => _AdminCoursesScreenState();
}

class _AdminCoursesScreenState extends State<AdminCoursesScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  String _statusFilter = 'all'; // 'all', 'published', 'draft', 'archived'

  // When a course is selected, show its full curriculum view
  CourseModel? _selectedCourse;
  bool _isBackgroundSyncing = false;
  Timer? _liveSyncTimer;

  // Track expanded state for sections in curriculum view
  final Map<int, bool> _expandedSections = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().fetchCourses();
    });
  }

  @override
  void dispose() {
    _stopLiveSync();
    _searchController.dispose();
    super.dispose();
  }

  void _startLiveSync() {
    _liveSyncTimer?.cancel();
    _liveSyncTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (mounted && _selectedCourse != null && !_isBackgroundSyncing) {
        _refreshSelectedCourse(silent: true);
      }
    });
  }

  void _stopLiveSync() {
    _liveSyncTimer?.cancel();
    _liveSyncTimer = null;
  }

  void _openCourseCurriculum(CourseModel c) {
    setState(() {
      _selectedCourse = c;
      _isBackgroundSyncing = true;
    });
    _startLiveSync();
    _refreshSelectedCourse(silent: false);
  }

  void _closeCourseCurriculum() {
    _stopLiveSync();
    setState(() => _selectedCourse = null);
    context.read<AdminProvider>().fetchCourses();
  }

  Future<void> _refreshSelectedCourse({bool silent = true}) async {
    if (_selectedCourse == null) return;
    if (!silent) {
      setState(() => _isBackgroundSyncing = true);
    }
    try {
      final updated = await context.read<AdminProvider>().fetchCourseDetails(_selectedCourse!.id);
      if (mounted && _selectedCourse != null && _selectedCourse!.id == updated.id) {
        setState(() {
          _selectedCourse = updated;
          _isBackgroundSyncing = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isBackgroundSyncing = false;
        });
      }
    }
  }

  void _applyOptimisticModules(List<CourseModuleModel> newMods, int? targetSectionId) {
    if (_selectedCourse == null) return;
    final current = _selectedCourse!;

    final updatedAllModules = [...current.modules, ...newMods];

    List<CourseSectionModel> updateSections(List<CourseSectionModel> sections) {
      return sections.map((sec) {
        if (sec.id == targetSectionId) {
          return CourseSectionModel(
            id: sec.id,
            title: sec.title,
            description: sec.description,
            order: sec.order,
            parentId: sec.parentId,
            modules: [...sec.modules, ...newMods],
            subsections: updateSections(sec.subsections),
          );
        }
        return CourseSectionModel(
          id: sec.id,
          title: sec.title,
          description: sec.description,
          order: sec.order,
          parentId: sec.parentId,
          modules: sec.modules,
          subsections: updateSections(sec.subsections),
        );
      }).toList();
    }

    setState(() {
      _selectedCourse = CourseModel(
        id: current.id,
        title: current.title,
        description: current.description,
        price: current.price,
        thumbnail: current.thumbnail,
        category: current.category,
        level: current.level,
        status: current.status,
        instructorName: current.instructorName,
        modules: updatedAllModules,
        sections: updateSections(current.sections),
        isBlocked: current.isBlocked,
        blockReason: current.blockReason,
        paidAmount: current.paidAmount,
        remainingAmount: current.remainingAmount,
      );
    });
  }

  void _applyOptimisticRemoveModule(int moduleId) {
    if (_selectedCourse == null) return;
    final current = _selectedCourse!;

    final updatedAllModules = current.modules.where((m) => m.id != moduleId).toList();

    List<CourseSectionModel> filterSections(List<CourseSectionModel> sections) {
      return sections.map((sec) {
        return CourseSectionModel(
          id: sec.id,
          title: sec.title,
          description: sec.description,
          order: sec.order,
          parentId: sec.parentId,
          modules: sec.modules.where((m) => m.id != moduleId).toList(),
          subsections: filterSections(sec.subsections),
        );
      }).toList();
    }

    setState(() {
      _selectedCourse = CourseModel(
        id: current.id,
        title: current.title,
        description: current.description,
        price: current.price,
        thumbnail: current.thumbnail,
        category: current.category,
        level: current.level,
        status: current.status,
        instructorName: current.instructorName,
        modules: updatedAllModules,
        sections: filterSections(current.sections),
        isBlocked: current.isBlocked,
        blockReason: current.blockReason,
        paidAmount: current.paidAmount,
        remainingAmount: current.remainingAmount,
      );
    });
  }

  // ─── Course Dialog (Create / Edit) ──────────────────────────────────────────
  void _showCourseDialog([CourseModel? course]) {
    final isEditing = course != null;
    final titleController = TextEditingController(text: course?.title ?? '');
    final descController = TextEditingController(text: course?.description ?? '');
    final priceController = TextEditingController(text: course?.price.toString() ?? '');
    final categoryController = TextEditingController(text: course?.category ?? '');
    final instructorController = TextEditingController(text: course?.instructorName ?? '');
    final thumbnailController = TextEditingController(text: course?.thumbnail ?? '');

    String level = course?.level ?? 'beginner';
    String status = course?.status ?? 'published';
    bool isUploading = false;
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Icon(
                isEditing ? Icons.edit_note_rounded : Icons.add_circle_outline_rounded,
                color: AppConstants.primaryColor,
                size: 24,
              ),
              const SizedBox(width: 8),
              Text(
                isEditing ? 'Edit Course Details' : 'Create New Course',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ],
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _inputLabel('Course Title *'),
                    _textField(titleController, 'e.g. NEET Complete Biology 2026', required: true),
                    const SizedBox(height: 12),

                    _inputLabel('Description'),
                    _textField(descController, 'Brief course curriculum & overview...', maxLines: 3),
                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _inputLabel('Price (₹) *'),
                              _textField(priceController, '4999', keyboardType: TextInputType.number, required: true),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _inputLabel('Category'),
                              _textField(categoryController, 'e.g. Biology'),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _inputLabel('Level'),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F172A),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.white12),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: level,
                                    dropdownColor: const Color(0xFF1E293B),
                                    isExpanded: true,
                                    style: const TextStyle(color: Colors.white, fontSize: 13),
                                    items: ['beginner', 'intermediate', 'advanced'].map((l) {
                                      return DropdownMenuItem(
                                        value: l,
                                        child: Text(l[0].toUpperCase() + l.substring(1)),
                                      );
                                    }).toList(),
                                    onChanged: (val) {
                                      if (val != null) setDialogState(() => level = val);
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _inputLabel('Status'),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F172A),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.white12),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: status,
                                    dropdownColor: const Color(0xFF1E293B),
                                    isExpanded: true,
                                    style: const TextStyle(color: Colors.white, fontSize: 13),
                                    items: ['draft', 'published', 'archived'].map((s) {
                                      return DropdownMenuItem(
                                        value: s,
                                        child: Text(s[0].toUpperCase() + s.substring(1)),
                                      );
                                    }).toList(),
                                    onChanged: (val) {
                                      if (val != null) setDialogState(() => status = val);
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    _inputLabel('Instructor Name *'),
                    _textField(instructorController, 'Dr. Vinoth Kumar', required: true),
                    const SizedBox(height: 12),

                    _inputLabel('Thumbnail Image URL / Upload'),
                    Row(
                      children: [
                        Expanded(
                          child: _textField(thumbnailController, 'https://.../thumb.png'),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          style: IconButton.styleFrom(
                            backgroundColor: AppConstants.primaryColor,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: isUploading
                              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Icon(Icons.cloud_upload_rounded, color: Colors.white, size: 20),
                          tooltip: 'Upload Image',
                          onPressed: isUploading
                              ? null
                              : () async {
                                  setDialogState(() => isUploading = true);
                                  try {
                                    final tempDir = Directory.systemTemp;
                                    final tempFile = File('${tempDir.path}/thumb_${DateTime.now().millisecondsSinceEpoch}.png');
                                    await tempFile.writeAsString('THUMB_IMAGE_DATA');

                                    if (!context.mounted) return;
                                    final uploadedUrl = await context.read<AdminProvider>().uploadFile(tempFile.path);
                                    if (uploadedUrl.isNotEmpty) {
                                      thumbnailController.text = uploadedUrl;
                                    }
                                  } catch (e) {
                                    if (mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Upload: ${e.toString()}'), backgroundColor: Colors.red),
                                      );
                                    }
                                  } finally {
                                    setDialogState(() => isUploading = false);
                                  }
                                },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppConstants.primaryColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              ),
              onPressed: () async {
                if (formKey.currentState!.validate()) {
                  final payload = {
                    'title': titleController.text.trim(),
                    'description': descController.text.trim(),
                    'price': double.tryParse(priceController.text.trim()) ?? 0.0,
                    'category': categoryController.text.trim(),
                    'level': level,
                    'status': status,
                    'instructor_name': instructorController.text.trim(),
                    if (thumbnailController.text.isNotEmpty) 'thumbnail': thumbnailController.text.trim(),
                  };

                  try {
                    final provider = context.read<AdminProvider>();
                    if (isEditing) {
                      await provider.updateCourse(course.id, payload);
                      if (_selectedCourse?.id == course.id) {
                        await _refreshSelectedCourse();
                      }
                    } else {
                      await provider.createCourse(payload);
                    }
                    if (ctx.mounted) Navigator.pop(ctx);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(isEditing ? 'Course updated successfully!' : 'Course created successfully!'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                      );
                    }
                  }
                }
              },
              child: Text(isEditing ? 'Save Changes' : 'Create Course', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Delete Course Confirmation ─────────────────────────────────────────────
  void _showDeleteConfirmation(CourseModel course) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            SizedBox(width: 8),
            Text('Delete Course?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Are you sure you want to delete "${course.title}"? All associated sections, modules, and enrollments will be permanently removed.',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              try {
                await context.read<AdminProvider>().deleteCourse(course.id);
                if (ctx.mounted) Navigator.pop(ctx);
                if (_selectedCourse?.id == course.id) {
                  setState(() => _selectedCourse = null);
                }
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Course deleted successfully!'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: const Text('Delete Course', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // ─── Section Dialog (Create / Edit Section or Subsection) ────────────────────
  void _showSectionDialog(CourseModel course, [CourseSectionModel? section, int? defaultParentId]) {
    final isEditing = section != null;
    final titleController = TextEditingController(text: section?.title ?? '');
    final descController = TextEditingController(text: section?.description ?? '');
    final orderController = TextEditingController(text: (section?.order ?? (course.sections.length + 1)).toString());

    int? parentId = section?.parentId ?? defaultParentId;
    final formKey = GlobalKey<FormState>();

    // Filter available parent sections (top-level only, excluding self)
    final topLevelSections = course.sections.where((s) => s.parentId == null && (section == null || s.id != section.id)).toList();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.folder_special_rounded, color: AppConstants.primaryColor, size: 22),
              const SizedBox(width: 8),
              Text(
                isEditing ? 'Edit Section' : (parentId != null ? 'Add New Subsection' : 'Create New Section'),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
              ),
            ],
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _inputLabel('Section Title *'),
                    _textField(titleController, 'e.g. Chapter 1: Genetics & Evolution', required: true),
                    const SizedBox(height: 12),

                    _inputLabel('Short Description / Objective'),
                    _textField(descController, 'Brief description of topics covered...', maxLines: 2),
                    const SizedBox(height: 12),

                    _inputLabel('Parent Section (Optional)'),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int?>(
                          value: parentId,
                          dropdownColor: const Color(0xFF1E293B),
                          isExpanded: true,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          items: [
                            const DropdownMenuItem<int?>(
                              value: null,
                              child: Text('-- None (Top-Level Section) --', style: TextStyle(color: Colors.white70)),
                            ),
                            ...topLevelSections.map((s) => DropdownMenuItem<int?>(
                              value: s.id,
                              child: Text('📁 ${s.title}', overflow: TextOverflow.ellipsis),
                            )),
                          ],
                          onChanged: (val) {
                            setDialogState(() => parentId = val);
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Choose a parent section to organize this as a nested subsection.',
                      style: TextStyle(color: Colors.grey, fontSize: 11),
                    ),
                    const SizedBox(height: 12),

                    _inputLabel('Display Sequence Order'),
                    _textField(orderController, '1', keyboardType: TextInputType.number),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppConstants.primaryColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () async {
                if (formKey.currentState!.validate()) {
                  final payload = {
                    'title': titleController.text.trim(),
                    'description': descController.text.trim(),
                    'parent_id': parentId,
                    'order': int.tryParse(orderController.text.trim()) ?? 0,
                  };

                  if (ctx.mounted) Navigator.pop(ctx);
                  try {
                    final provider = context.read<AdminProvider>();
                    if (isEditing) {
                      await provider.updateSection(course.id, section.id, payload);
                    } else {
                      await provider.createSection(course.id, payload);
                    }
                    await _refreshSelectedCourse(silent: true);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(isEditing ? 'Section updated!' : 'Section created & synced live!'),
                          backgroundColor: Colors.green,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    }
                  } catch (e) {
                    await _refreshSelectedCourse(silent: true);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                      );
                    }
                  }
                }
              },
              child: Text(isEditing ? 'Save Changes' : 'Create Section', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Delete Section Confirmation ────────────────────────────────────────────
  void _showDeleteSectionDialog(CourseModel course, CourseSectionModel section) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Delete Section?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'Are you sure you want to delete "${section.title}"? Modules inside will become unassigned.',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              if (ctx.mounted) Navigator.pop(ctx);
              try {
                await context.read<AdminProvider>().deleteSection(course.id, section.id);
                await _refreshSelectedCourse(silent: true);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Section deleted successfully!'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                await _refreshSelectedCourse(silent: true);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: const Text('Delete Section', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  // ─── Module Dialog (Add / Edit Single Video or PDF or Quiz) ─────────────────
  void _showModuleDialog(CourseModel course, {CourseModuleModel? module, int? defaultSectionId}) {
    final isEditing = module != null;
    final titleController = TextEditingController(text: module?.title ?? '');
    final durationController = TextEditingController(text: module?.duration?.toString() ?? '15');
    final youtubeController = TextEditingController(text: module?.youtubeUrl ?? '');
    final fileUrlController = TextEditingController(text: module?.fileUrl ?? '');
    final orderController = TextEditingController(text: (module?.order ?? (course.modules.length + 1)).toString());

    int? targetSectionId = module?.sectionId ?? defaultSectionId;
    String type = module?.type ?? 'video';
    bool isFree = module?.isFree ?? false;
    bool isUploading = false;
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          final youtubeVideoId = YoutubePlayer.convertUrlToId(youtubeController.text.trim());

          return AlertDialog(
            backgroundColor: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: [
                Icon(
                  type == 'video'
                      ? Icons.play_circle_fill_rounded
                      : (type == 'pdf' ? Icons.picture_as_pdf_rounded : Icons.quiz_rounded),
                  color: type == 'video'
                      ? Colors.blueAccent
                      : (type == 'pdf' ? Colors.pinkAccent : Colors.purpleAccent),
                  size: 24,
                ),
                const SizedBox(width: 8),
                Text(
                  isEditing ? 'Edit Module / Video' : 'Add New Module / Video',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
                ),
              ],
            ),
            content: SizedBox(
              width: double.maxFinite,
              child: SingleChildScrollView(
                child: Form(
                  key: formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _inputLabel('Module / Video Title *'),
                      _textField(titleController, 'e.g. Mendelian Genetics & Inheritance Laws', required: true),
                      const SizedBox(height: 12),

                      _inputLabel('Select Course Section / Subsection'),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<int?>(
                            value: targetSectionId,
                            dropdownColor: const Color(0xFF1E293B),
                            isExpanded: true,
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            items: [
                              const DropdownMenuItem<int?>(
                                value: null,
                                child: Text('-- No Section (Unassigned Lecture) --', style: TextStyle(color: Colors.white70)),
                              ),
                              ..._buildHierarchicalSectionDropdownItems(course.sections),
                            ],
                            onChanged: (val) {
                              setDialogState(() => targetSectionId = val);
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _inputLabel('Type'),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0F172A),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: Colors.white12),
                                  ),
                                  child: DropdownButtonHideUnderline(
                                    child: DropdownButton<String>(
                                      value: type,
                                      dropdownColor: const Color(0xFF1E293B),
                                      isExpanded: true,
                                      style: const TextStyle(color: Colors.white, fontSize: 13),
                                      items: const [
                                        DropdownMenuItem(value: 'video', child: Text('🎥 Video')),
                                        DropdownMenuItem(value: 'pdf', child: Text('📄 PDF Document')),
                                        DropdownMenuItem(value: 'quiz', child: Text('📝 Quiz')),
                                      ],
                                      onChanged: (val) {
                                        if (val != null) {
                                          setDialogState(() {
                                            type = val;
                                            if (type != 'video') youtubeController.clear();
                                            if (type != 'pdf') fileUrlController.clear();
                                          });
                                        }
                                      },
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _inputLabel('Duration (mins)'),
                                _textField(durationController, '15', keyboardType: TextInputType.number),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // ─── Video specific input ───
                      if (type == 'video') ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _inputLabel('YouTube Video URL *'),
                            if (youtubeController.text.isNotEmpty)
                              GestureDetector(
                                onTap: () => setDialogState(() => youtubeController.clear()),
                                child: const Text(
                                  'CLEAR VIDEO',
                                  style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ),
                          ],
                        ),
                        TextFormField(
                          controller: youtubeController,
                          onChanged: (_) => setDialogState(() {}),
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: InputDecoration(
                            hintText: 'https://www.youtube.com/watch?v=...',
                            hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
                            prefixIcon: const Icon(Icons.link_rounded, color: Colors.blueAccent, size: 18),
                            filled: true,
                            fillColor: const Color(0xFF0F172A),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                          ),
                          validator: (v) => (type == 'video' && (v == null || v.isEmpty)) ? 'YouTube URL is required' : null,
                        ),
                        if (youtubeVideoId != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.green.withAlpha(25),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.greenAccent.withAlpha(50)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle_rounded, color: Colors.greenAccent, size: 16),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    'Valid YouTube Video ID: $youtubeVideoId',
                                    style: const TextStyle(color: Colors.greenAccent, fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 12),
                      ],

                      // ─── PDF specific input ───
                      if (type == 'pdf') ...[
                        _inputLabel('PDF Document URL / Upload'),
                        Row(
                          children: [
                            Expanded(
                              child: _textField(fileUrlController, 'https://.../notes.pdf'),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              style: IconButton.styleFrom(
                                backgroundColor: AppConstants.primaryColor,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              icon: isUploading
                                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                  : const Icon(Icons.upload_file_rounded, color: Colors.white, size: 20),
                              tooltip: 'Upload Document',
                              onPressed: isUploading
                                  ? null
                                  : () async {
                                      setDialogState(() => isUploading = true);
                                      try {
                                        final tempDir = Directory.systemTemp;
                                        final tempFile = File('${tempDir.path}/doc_${DateTime.now().millisecondsSinceEpoch}.pdf');
                                        await tempFile.writeAsString('SAMPLE_PDF_DATA');

                                        if (!context.mounted) return;
                                        final uploadedUrl = await context.read<AdminProvider>().uploadFile(tempFile.path);
                                        if (uploadedUrl.isNotEmpty) {
                                          fileUrlController.text = uploadedUrl;
                                        }
                                      } catch (e) {
                                        if (mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(content: Text('Upload error: ${e.toString()}'), backgroundColor: Colors.red),
                                          );
                                        }
                                      } finally {
                                        setDialogState(() => isUploading = false);
                                      }
                                    },
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                      ],

                      _inputLabel('Display Sequence Order'),
                      _textField(orderController, '1', keyboardType: TextInputType.number),
                      const SizedBox(height: 12),

                      // ─── Free vs Premium Switch ───
                      _inputLabel('Access Permission'),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Text(isFree ? '🆓' : '👑', style: const TextStyle(fontSize: 16)),
                                const SizedBox(width: 8),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      isFree ? 'Free Preview Lecture' : 'Premium (Enrolled Only)',
                                      style: TextStyle(
                                        color: isFree ? Colors.greenAccent : Colors.amberAccent,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                    Text(
                                      isFree ? 'All students can view this lecture' : 'Locked for unpaid students',
                                      style: const TextStyle(color: Colors.grey, fontSize: 10),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            Switch(
                              value: isFree,
                              activeThumbColor: Colors.greenAccent,
                              inactiveThumbColor: Colors.amberAccent,
                              onChanged: (val) => setDialogState(() => isFree = val),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () async {
                  if (formKey.currentState!.validate()) {
                    final payload = {
                      'title': titleController.text.trim(),
                      'type': type,
                      'duration': durationController.text.isNotEmpty ? int.tryParse(durationController.text.trim()) : null,
                      'order': int.tryParse(orderController.text.trim()) ?? 0,
                      'section_id': targetSectionId,
                      'youtube_url': type == 'video' ? youtubeController.text.trim() : null,
                      'file_url': type == 'pdf' ? fileUrlController.text.trim() : null,
                      'is_free': isFree,
                    };

                    // Close modal immediately for instant snappiness
                    if (ctx.mounted) Navigator.pop(ctx);

                    if (!isEditing) {
                      final optimisticMod = CourseModuleModel(
                        id: -DateTime.now().millisecondsSinceEpoch,
                        title: payload['title'] as String,
                        type: type,
                        duration: payload['duration'] as int?,
                        youtubeUrl: payload['youtube_url'] as String?,
                        fileUrl: payload['file_url'] as String?,
                        order: payload['order'] as int? ?? 0,
                        sectionId: targetSectionId,
                        isFree: isFree,
                      );
                      if (targetSectionId != null) {
                        _expandedSections[targetSectionId!] = true;
                      }
                      _applyOptimisticModules([optimisticMod], targetSectionId);
                    }

                    try {
                      final provider = context.read<AdminProvider>();
                      if (isEditing) {
                        await provider.updateModule(course.id, module.id, payload);
                      } else {
                        await provider.createModule(course.id, payload);
                      }
                      await _refreshSelectedCourse(silent: true);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Row(
                              children: [
                                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
                                const SizedBox(width: 8),
                                Text(isEditing ? 'Module updated successfully!' : 'Module added & synced live!'),
                              ],
                            ),
                            backgroundColor: Colors.green,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      }
                    } catch (e) {
                      await _refreshSelectedCourse(silent: true);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                        );
                      }
                    }
                  }
                },
                child: Text(isEditing ? 'Save Module' : 'Add Module', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          );
        },
      ),
    );
  }

  // ─── Add Multiple Videos Dialog (MultiVideoModal Equivalent) ─────────────────
  void _showMultipleVideosDialog(CourseModel course, {int? defaultSectionId}) {
    int? targetSectionId = defaultSectionId;
    List<Map<String, dynamic>> videoItems = [
      {'titleController': TextEditingController(), 'urlController': TextEditingController(), 'durationController': TextEditingController(text: '15'), 'isFree': false},
      {'titleController': TextEditingController(), 'urlController': TextEditingController(), 'durationController': TextEditingController(text: '15'), 'isFree': false},
    ];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          return AlertDialog(
            backgroundColor: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: Colors.blueAccent.withAlpha(30), borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.video_library_rounded, color: Colors.blueAccent, size: 22),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Add Multiple Videos', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17)),
                      Text('Batch add YouTube video lessons to this syllabus', style: TextStyle(color: Colors.grey, fontSize: 11)),
                    ],
                  ),
                ),
              ],
            ),
            content: SizedBox(
              width: double.maxFinite,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _inputLabel('Target Course Section / Subsection'),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int?>(
                          value: targetSectionId,
                          dropdownColor: const Color(0xFF1E293B),
                          isExpanded: true,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          items: [
                            const DropdownMenuItem<int?>(
                              value: null,
                              child: Text('-- No Section (Unassigned) --', style: TextStyle(color: Colors.white70)),
                            ),
                            ..._buildHierarchicalSectionDropdownItems(course.sections),
                          ],
                          onChanged: (val) {
                            setDialogState(() => targetSectionId = val);
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // List of video cards
                    ...List.generate(videoItems.length, (index) {
                      final item = videoItems[index];
                      final titleCtrl = item['titleController'] as TextEditingController;
                      final urlCtrl = item['urlController'] as TextEditingController;
                      final durCtrl = item['durationController'] as TextEditingController;
                      final isFree = item['isFree'] as bool;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.blueAccent.withAlpha(30),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text('Video #${index + 1}', style: const TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                                ),
                                if (videoItems.length > 1)
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 18),
                                    visualDensity: VisualDensity.compact,
                                    tooltip: 'Remove video row',
                                    onPressed: () {
                                      setDialogState(() {
                                        videoItems.removeAt(index);
                                      });
                                    },
                                  ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            _inputLabel('Video Title *'),
                            _textField(titleCtrl, 'e.g. Lesson ${index + 1}: Core Concepts'),
                            const SizedBox(height: 8),
                            _inputLabel('YouTube Video URL *'),
                            _textField(urlCtrl, 'https://youtube.com/watch?v=...'),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      _inputLabel('Duration (mins)'),
                                      _textField(durCtrl, '15', keyboardType: TextInputType.number),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      _inputLabel('Access'),
                                      Row(
                                        children: [
                                          Text(isFree ? '🆓 Free' : '👑 Paid', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                          Switch(
                                            value: isFree,
                                            activeThumbColor: Colors.greenAccent,
                                            inactiveThumbColor: Colors.amberAccent,
                                            onChanged: (val) {
                                              setDialogState(() => item['isFree'] = val);
                                            },
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }),

                    Center(
                      child: TextButton.icon(
                        style: TextButton.styleFrom(
                          foregroundColor: AppConstants.primaryColor,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
                        label: const Text('+ Add Another Video Row', style: TextStyle(fontWeight: FontWeight.bold)),
                        onPressed: () {
                          setDialogState(() {
                            videoItems.add({
                              'titleController': TextEditingController(),
                              'urlController': TextEditingController(),
                              'durationController': TextEditingController(text: '15'),
                              'isFree': false,
                            });
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
                onPressed: () async {
                  final validPayload = <Map<String, dynamic>>[];
                  for (var i = 0; i < videoItems.length; i++) {
                    final item = videoItems[i];
                    final t = (item['titleController'] as TextEditingController).text.trim();
                    final u = (item['urlController'] as TextEditingController).text.trim();
                    final d = (item['durationController'] as TextEditingController).text.trim();
                    if (t.isNotEmpty && u.isNotEmpty) {
                      validPayload.add({
                        'title': t,
                        'type': 'video',
                        'youtube_url': u,
                        'duration': int.tryParse(d) ?? 15,
                        'is_free': item['isFree'],
                        'order': i,
                      });
                    }
                  }

                  if (validPayload.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please fill title & YouTube URL for at least one video row'), backgroundColor: Colors.orange),
                    );
                    return;
                  }

                  // Close modal immediately for instant snappy UX
                  if (ctx.mounted) Navigator.pop(ctx);

                  // 1. Optimistic UI update: Instantly insert into local state
                  final nowMs = DateTime.now().millisecondsSinceEpoch;
                  final optimisticMods = validPayload.map((p) {
                    final idx = p['order'] as int? ?? 0;
                    return CourseModuleModel(
                      id: -(nowMs + idx),
                      title: p['title'] as String,
                      type: 'video',
                      duration: p['duration'] as int?,
                      youtubeUrl: p['youtube_url'] as String?,
                      fileUrl: null,
                      order: idx,
                      sectionId: targetSectionId,
                      isFree: p['is_free'] == true,
                    );
                  }).toList();

                  if (targetSectionId != null) {
                    _expandedSections[targetSectionId!] = true;
                  }
                  _applyOptimisticModules(optimisticMods, targetSectionId);

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Row(
                          children: [
                            const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                            const SizedBox(width: 10),
                            Text('Syncing ${validPayload.length} videos live...'),
                          ],
                        ),
                        duration: const Duration(seconds: 2),
                        backgroundColor: Colors.blueAccent,
                      ),
                    );
                  }

                  // 2. Perform network call in background
                  try {
                    await context.read<AdminProvider>().createMultipleModules(
                      course.id,
                      validPayload,
                      sectionId: targetSectionId,
                    );
                    await _refreshSelectedCourse(silent: true);
                    if (mounted) {
                      ScaffoldMessenger.of(context).hideCurrentSnackBar();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Row(
                            children: [
                              const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
                              const SizedBox(width: 8),
                              Text('${validPayload.length} videos added & synced live!'),
                            ],
                          ),
                          backgroundColor: Colors.green,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    }
                  } catch (e) {
                    await _refreshSelectedCourse(silent: true);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Failed to add videos: $e'), backgroundColor: Colors.red),
                      );
                    }
                  }
                },
                child: Text('Add All Videos (${videoItems.where((v) => (v['titleController'] as TextEditingController).text.trim().isNotEmpty).length})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          );
        },
      ),
    );
  }

  // ─── Play Video Preview ─────────────────────────────────────────────────────
  void _playVideoPreview(CourseModel course, CourseModuleModel module) {
    if (module.youtubeUrl == null || module.youtubeUrl!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No YouTube URL available for this video.'), backgroundColor: Colors.orange),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => VideoPlayerScreen(
          course: course,
          initialModule: module,
        ),
      ),
    );
  }

  // ─── Helper Dropdown Items with indentation for Subsections ─────────────────
  List<DropdownMenuItem<int?>> _buildHierarchicalSectionDropdownItems(List<CourseSectionModel> sections, [int depth = 0]) {
    final items = <DropdownMenuItem<int?>>[];
    for (final sec in sections) {
      final prefix = depth == 0 ? '📂 ' : '${'   ' * depth}↳ 📁 ';
      items.add(DropdownMenuItem<int?>(
        value: sec.id,
        child: Text('$prefix${sec.title}', style: TextStyle(fontWeight: depth == 0 ? FontWeight.bold : FontWeight.normal, color: depth == 0 ? Colors.white : Colors.white70)),
      ));
      if (sec.subsections.isNotEmpty) {
        items.addAll(_buildHierarchicalSectionDropdownItems(sec.subsections, depth + 1));
      }
    }
    return items;
  }

  // ─── Input Helpers ──────────────────────────────────────────────────────────
  Widget _inputLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
      ),
    );
  }

  Widget _textField(
    TextEditingController controller,
    String hint, {
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    bool required = false,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
        filled: true,
        fillColor: const Color(0xFF0F172A),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
      ),
      validator: (v) => (required && (v == null || v.trim().isEmpty)) ? 'Required' : null,
    );
  }

  // ─── Main Scaffold Build ────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AdminProvider>();

    // If a course is selected for curriculum management, render its Curriculum View
    if (_selectedCourse != null) {
      return _buildCourseCurriculumView(_selectedCourse!);
    }
    final allCourses = provider.courses;

    // Filter courses
    final q = _searchQuery.trim().toLowerCase();
    final filteredCourses = allCourses.where((c) {
      final matchQuery = q.isEmpty ||
          c.title.toLowerCase().contains(q) ||
          (c.category?.toLowerCase().contains(q) ?? false) ||
          c.instructorName.toLowerCase().contains(q);
      if (!matchQuery) return false;
      if (_statusFilter == 'all') return true;
      return c.status.toLowerCase().trim() == _statusFilter.toLowerCase().trim();
    }).toList();

    // Stats calculations
    final totalCourses = allCourses.length;
    final publishedCourses = allCourses.where((c) => c.status.toLowerCase() == 'published').length;
    final draftCourses = allCourses.where((c) => c.status.toLowerCase() == 'draft').length;
    final totalModules = allCourses.fold<int>(0, (sum, c) => sum + c.modules.length);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.video_collection_rounded, color: AppConstants.primaryColor, size: 22),
            SizedBox(width: 8),
            Text('Manage Courses & Videos', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded, color: Colors.white),
            tooltip: 'Create New Course',
            onPressed: () => _showCourseDialog(),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: 'Refresh',
            onPressed: () => context.read<AdminProvider>().fetchCourses(),
          ),
        ],
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppConstants.primaryColor,
        onPressed: () => _showCourseDialog(),
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Add Course', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: RefreshIndicator(
        onRefresh: () => context.read<AdminProvider>().fetchCourses(),
        color: AppConstants.primaryColor,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            // ─── Stats Banner ───────────────────────────────────────────────
            _buildStatsRow(totalCourses, publishedCourses, draftCourses, totalModules),
            const SizedBox(height: 16),

            // ─── Search Bar ─────────────────────────────────────────────────
            TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search courses by title or subject...',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                prefixIcon: const Icon(Icons.search_rounded, color: Colors.grey),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.grey, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),

            // ─── Filter Status Chips ────────────────────────────────────────
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _filterChip('all', 'All Courses ($totalCourses)'),
                  const SizedBox(width: 8),
                  _filterChip('published', 'Published ($publishedCourses)'),
                  const SizedBox(width: 8),
                  _filterChip('draft', 'Drafts ($draftCourses)'),
                  const SizedBox(width: 8),
                  _filterChip('archived', 'Archived'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ─── Courses List ───────────────────────────────────────────────
            if (provider.isLoading && allCourses.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40.0),
                  child: CircularProgressIndicator(color: AppConstants.primaryColor),
                ),
              )
            else if (filteredCourses.isEmpty)
              Container(
                padding: const EdgeInsets.all(32),
                alignment: Alignment.center,
                child: Column(
                  children: [
                    const Icon(Icons.search_off_rounded, color: Colors.grey, size: 48),
                    const SizedBox(height: 12),
                    const Text('No courses found matching your criteria.', style: TextStyle(color: Colors.grey, fontSize: 14)),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppConstants.primaryColor,
                        minimumSize: const Size(0, 40),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      icon: const Icon(Icons.add_rounded, color: Colors.white, size: 18),
                      label: const Text('Create First Course', style: TextStyle(color: Colors.white)),
                      onPressed: () => _showCourseDialog(),
                    ),
                  ],
                ),
              )
            else
              ...filteredCourses.map((c) => _buildCourseCard(c)),
          ],
        ),
      ),
    );
  }

  // ─── Stats Banner Widget ────────────────────────────────────────────────────
  Widget _buildStatsRow(int total, int published, int drafts, int modules) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _statItem(Icons.menu_book_rounded, total.toString(), 'Courses', Colors.indigoAccent),
          Container(width: 1, height: 32, color: Colors.white12),
          _statItem(Icons.check_circle_rounded, published.toString(), 'Published', Colors.greenAccent),
          Container(width: 1, height: 32, color: Colors.white12),
          _statItem(Icons.edit_document, drafts.toString(), 'Drafts', Colors.amberAccent),
          Container(width: 1, height: 32, color: Colors.white12),
          _statItem(Icons.video_library_rounded, modules.toString(), 'Videos', Colors.blueAccent),
        ],
      ),
    );
  }

  Widget _statItem(IconData icon, String value, String label, Color color) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 4),
            Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
      ],
    );
  }

  Widget _filterChip(String filterKey, String label) {
    final isSelected = _statusFilter == filterKey;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppConstants.primaryColor,
      backgroundColor: const Color(0xFF1E293B),
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : Colors.grey,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 12,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSelected ? Colors.transparent : Colors.white12)),
      onSelected: (_) => setState(() => _statusFilter = filterKey),
    );
  }

  // ─── Course Card in List ────────────────────────────────────────────────────
  Widget _buildCourseCard(CourseModel c) {
    final isPublished = c.status.toLowerCase() == 'published';

    final String? thumbUrl = (c.thumbnail != null && c.thumbnail!.trim().isNotEmpty)
        ? (c.thumbnail!.startsWith('http')
            ? c.thumbnail!
            : '${AppConstants.baseUrl.replaceAll('/api', '')}${c.thumbnail!.startsWith('/') ? '' : '/'}${c.thumbnail}')
        : null;

    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Colors.white10)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _openCourseCurriculum(c),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Thumbnail or Icon Box
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppConstants.primaryColor.withAlpha(30),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: thumbUrl != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              thumbUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(Icons.school_rounded, color: AppConstants.primaryColor),
                            ),
                          )
                        : const Icon(Icons.school_rounded, color: AppConstants.primaryColor, size: 28),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          c.title,
                          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            if (c.category != null && c.category!.isNotEmpty) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.white10,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(c.category!, style: const TextStyle(color: Colors.white70, fontSize: 11)),
                              ),
                              const SizedBox(width: 6),
                            ],
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppConstants.primaryColor.withAlpha(25),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                c.level.toUpperCase(),
                                style: const TextStyle(color: AppConstants.primaryColor, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Status Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isPublished ? Colors.green.withAlpha(35) : Colors.amber.withAlpha(35),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      c.status.toUpperCase(),
                      style: TextStyle(
                        color: isPublished ? Colors.greenAccent : Colors.amberAccent,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              if (c.description != null && c.description!.isNotEmpty)
                Text(
                  c.description!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              const SizedBox(height: 12),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Text(
                          '₹${c.price.toInt()}',
                          style: const TextStyle(color: AppConstants.primaryColor, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            '👤 ${c.instructorName}',
                            style: const TextStyle(color: Colors.white60, fontSize: 12),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.blueAccent.withAlpha(25),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${c.sections.length} Sec • ${c.modules.length} Videos',
                      style: const TextStyle(color: Colors.blueAccent, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const Divider(color: Colors.white10, height: 20),

              // Bottom Actions
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppConstants.primaryColor,
                        minimumSize: const Size(0, 38),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.video_library_rounded, size: 16, color: Colors.white),
                      label: const Text(
                        'Manage Syllabus & Videos',
                        style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                      onPressed: () => _openCourseCurriculum(c),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                    padding: const EdgeInsets.all(8),
                    icon: const Icon(Icons.edit_note_rounded, color: Colors.grey, size: 20),
                    tooltip: 'Edit Course Info',
                    onPressed: () => _showCourseDialog(c),
                  ),
                  IconButton(
                    constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                    padding: const EdgeInsets.all(8),
                    icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                    tooltip: 'Delete Course',
                    onPressed: () => _showDeleteConfirmation(c),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Detailed Course Curriculum & Syllabus View ─────────────────────────────
  Widget _buildCourseCurriculumView(CourseModel course) {
    final modules = course.modules;
    final sections = course.sections;
    final allKnownSectionIds = <int>{};
    for (final sec in sections) {
      allKnownSectionIds.add(sec.id);
      for (final sub in sec.subsections) {
        allKnownSectionIds.add(sub.id);
      }
    }
    final unassignedModules = modules.where((m) => m.sectionId == null || !allKnownSectionIds.contains(m.sectionId)).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          tooltip: 'Back to all courses',
          onPressed: _closeCourseCurriculum,
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                course.title,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.green.withAlpha(25),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.greenAccent.withAlpha(80)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: Colors.greenAccent,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    'LIVE',
                    style: TextStyle(color: Colors.greenAccent, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: _isBackgroundSyncing
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppConstants.primaryColor),
                  )
                : const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: 'Live Refresh',
            onPressed: () => _refreshSelectedCourse(silent: false),
          ),
          IconButton(
            icon: const Icon(Icons.edit_note_rounded, color: Colors.white),
            tooltip: 'Edit Course Details',
            onPressed: () => _showCourseDialog(course),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2),
          child: _isBackgroundSyncing
              ? const LinearProgressIndicator(
                  color: AppConstants.primaryColor,
                  backgroundColor: Colors.transparent,
                  minHeight: 2,
                )
              : const SizedBox(height: 2),
        ),
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: () => _refreshSelectedCourse(silent: false),
        color: AppConstants.primaryColor,
        child: ListView(
                padding: const EdgeInsets.all(16.0),
                children: [
                  // ─── Header Info Card ─────────────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    course.title,
                                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Instructor: ${course.instructorName} • ₹${course.price.toInt()}',
                                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: course.status == 'published' ? Colors.green.withAlpha(30) : Colors.amber.withAlpha(30),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Text(
                                course.status.toUpperCase(),
                                style: TextStyle(
                                  color: course.status == 'published' ? Colors.greenAccent : Colors.amberAccent,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Divider(color: Colors.white10, height: 20),

                        // Action Buttons Bar (Same as Web Admin!)
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF334155),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                              ),
                              icon: const Icon(Icons.create_new_folder_rounded, size: 16, color: Colors.white),
                              label: const Text('+ Add Section', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                              onPressed: () => _showSectionDialog(course),
                            ),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blueAccent,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                              ),
                              icon: const Icon(Icons.video_collection_rounded, size: 16, color: Colors.white),
                              label: const Text('+ Add Multiple Videos', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                              onPressed: () => _showMultipleVideosDialog(course),
                            ),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppConstants.primaryColor,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                              ),
                              icon: const Icon(Icons.add_rounded, size: 16, color: Colors.white),
                              label: const Text('+ Add Module', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                              onPressed: () => _showModuleDialog(course),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ─── Curriculum Sections & Subsections ───────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'COURSE SYLLABUS & CURRICULUM',
                        style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                      ),
                      Text(
                        '${sections.length} Sections • ${modules.length} Total Lessons',
                        style: const TextStyle(color: AppConstants.primaryColor, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (sections.isEmpty && unassignedModules.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.folder_open_rounded, color: Colors.grey, size: 48),
                          const SizedBox(height: 12),
                          const Text('No curriculum sections or videos added yet.', style: TextStyle(color: Colors.grey)),
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryColor),
                                icon: const Icon(Icons.create_new_folder_rounded, size: 16, color: Colors.white),
                                label: const Text('Add Section', style: TextStyle(color: Colors.white)),
                                onPressed: () => _showSectionDialog(course),
                              ),
                              const SizedBox(width: 12),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent),
                                icon: const Icon(Icons.video_collection_rounded, size: 16, color: Colors.white),
                                label: const Text('Add Videos', style: TextStyle(color: Colors.white)),
                                onPressed: () => _showMultipleVideosDialog(course),
                              ),
                            ],
                          ),
                        ],
                      ),
                    )
                  else ...[
                    // Render Sections hierarchically
                    ...sections.map((section) => _buildSectionCard(course, section)),

                    // Render Unassigned Modules (modules not placed inside any section)
                    if (unassignedModules.isNotEmpty)
                      _buildUnassignedModulesCard(course, unassignedModules),
                  ],
                ],
              ),
            ),
    );
  }

  // ─── Section Card Widget (with Subsections and Modules) ─────────────────────
  Widget _buildSectionCard(CourseModel course, CourseSectionModel section) {
    final isExpanded = _expandedSections[section.id] ?? true;
    final directModules = section.modules.isNotEmpty
        ? section.modules
        : course.modules.where((m) => m.sectionId == section.id).toList();
    final totalSectionLectures = directModules.length + section.subsections.fold<int>(0, (sum, sub) {
      final sm = sub.modules.isNotEmpty ? sub.modules : course.modules.where((m) => m.sectionId == sub.id).toList();
      return sum + sm.length;
    });

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              setState(() {
                _expandedSections[section.id] = !isExpanded;
              });
            },
            child: Padding(
              padding: const EdgeInsets.all(14.0),
              child: Row(
                children: [
                  Icon(
                    isExpanded ? Icons.folder_open_rounded : Icons.folder_rounded,
                    color: AppConstants.primaryColor,
                    size: 24,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          section.title,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        if (section.description != null && section.description!.isNotEmpty)
                          Text(
                            section.description!,
                            style: const TextStyle(color: Colors.grey, fontSize: 11),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.white10,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '$totalSectionLectures videos',
                      style: const TextStyle(color: Colors.white70, fontSize: 11),
                    ),
                  ),
                  const SizedBox(width: 4),
                  // Section Menu Actions
                  PopupMenuButton<String>(
                    icon: const Icon(Icons.more_vert_rounded, color: Colors.grey, size: 20),
                    color: const Color(0xFF0F172A),
                    onSelected: (action) {
                      if (action == 'add_module') {
                        _showModuleDialog(course, defaultSectionId: section.id);
                      } else if (action == 'add_multi_videos') {
                        _showMultipleVideosDialog(course, defaultSectionId: section.id);
                      } else if (action == 'add_subsection') {
                        _showSectionDialog(course, null, section.id);
                      } else if (action == 'edit_section') {
                        _showSectionDialog(course, section);
                      } else if (action == 'delete_section') {
                        _showDeleteSectionDialog(course, section);
                      }
                    },
                    itemBuilder: (ctx) => [
                      const PopupMenuItem(
                        value: 'add_module',
                        child: Row(
                          children: [
                            Icon(Icons.add_circle_outline_rounded, color: AppConstants.primaryColor, size: 18),
                            SizedBox(width: 8),
                            Text('Add Single Module', style: TextStyle(color: Colors.white, fontSize: 13)),
                          ],
                        ),
                      ),
                      const PopupMenuItem(
                        value: 'add_multi_videos',
                        child: Row(
                          children: [
                            Icon(Icons.video_collection_rounded, color: Colors.blueAccent, size: 18),
                            SizedBox(width: 8),
                            Text('Add Multiple Videos', style: TextStyle(color: Colors.white, fontSize: 13)),
                          ],
                        ),
                      ),
                      const PopupMenuItem(
                        value: 'add_subsection',
                        child: Row(
                          children: [
                            Icon(Icons.create_new_folder_rounded, color: Colors.amberAccent, size: 18),
                            SizedBox(width: 8),
                            Text('Add Subsection', style: TextStyle(color: Colors.white, fontSize: 13)),
                          ],
                        ),
                      ),
                      const PopupMenuDivider(height: 1),
                      const PopupMenuItem(
                        value: 'edit_section',
                        child: Row(
                          children: [
                            Icon(Icons.edit_note_rounded, color: Colors.grey, size: 18),
                            SizedBox(width: 8),
                            Text('Edit Section', style: TextStyle(color: Colors.white, fontSize: 13)),
                          ],
                        ),
                      ),
                      const PopupMenuItem(
                        value: 'delete_section',
                        child: Row(
                          children: [
                            Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 18),
                            SizedBox(width: 8),
                            Text('Delete Section', style: TextStyle(color: Colors.redAccent, fontSize: 13)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  Icon(
                    isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                    color: Colors.grey,
                  ),
                ],
              ),
            ),
          ),

          if (isExpanded) ...[
            const Divider(color: Colors.white10, height: 1),

            // ─── Subsections List ───
            if (section.subsections.isNotEmpty) ...[
              ...section.subsections.map((sub) => _buildSubsectionTile(course, sub)),
            ],

            // ─── Direct Modules in this Section ───
            if (directModules.isEmpty && section.subsections.isEmpty)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('No videos in this section yet. ', style: TextStyle(color: Colors.grey, fontSize: 12)),
                      TextButton.icon(
                        icon: const Icon(Icons.add, size: 14),
                        label: const Text('Add Videos', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        onPressed: () => _showMultipleVideosDialog(course, defaultSectionId: section.id),
                      ),
                    ],
                  ),
                ),
              )
            else
              ...directModules.map((m) => _buildModuleTile(course, m)),

            // Section footer quick add
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: const BoxDecoration(
                color: Color(0xFF0F172A),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    style: TextButton.styleFrom(foregroundColor: Colors.blueAccent),
                    icon: const Icon(Icons.video_collection_rounded, size: 14),
                    label: const Text('+ Add Videos', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    onPressed: () => _showMultipleVideosDialog(course, defaultSectionId: section.id),
                  ),
                  const SizedBox(width: 8),
                  TextButton.icon(
                    style: TextButton.styleFrom(foregroundColor: AppConstants.primaryColor),
                    icon: const Icon(Icons.add_rounded, size: 14),
                    label: const Text('+ Add Module', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    onPressed: () => _showModuleDialog(course, defaultSectionId: section.id),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ─── Subsection Tile ────────────────────────────────────────────────────────
  Widget _buildSubsectionTile(CourseModel course, CourseSectionModel sub) {
    final subModules = sub.modules.isNotEmpty
        ? sub.modules
        : course.modules.where((m) => m.sectionId == sub.id).toList();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                const Icon(Icons.subdirectory_arrow_right_rounded, color: Colors.amberAccent, size: 18),
                const SizedBox(width: 6),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        sub.title,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      if (sub.description != null && sub.description!.isNotEmpty)
                        Text(sub.description!, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                    ],
                  ),
                ),
                Text(
                  '${subModules.length} lessons',
                  style: const TextStyle(color: Colors.white60, fontSize: 11),
                ),
                IconButton(
                  icon: const Icon(Icons.add_rounded, color: Colors.blueAccent, size: 18),
                  tooltip: 'Add Video to Subsection',
                  onPressed: () => _showMultipleVideosDialog(course, defaultSectionId: sub.id),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 18),
                  tooltip: 'Delete Subsection',
                  onPressed: () => _showDeleteSectionDialog(course, sub),
                ),
              ],
            ),
          ),
          if (subModules.isNotEmpty) ...[
            const Divider(color: Colors.white10, height: 1),
            ...subModules.map((m) => _buildModuleTile(course, m)),
          ],
        ],
      ),
    );
  }

  // ─── Unassigned Modules Card ────────────────────────────────────────────────
  Widget _buildUnassignedModulesCard(CourseModel course, List<CourseModuleModel> unassigned) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(14.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.folder_shared_rounded, color: Colors.grey, size: 22),
                    SizedBox(width: 8),
                    Text(
                      'Unassigned Lectures',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(8)),
                  child: Text('${unassigned.length} lectures', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                ),
              ],
            ),
          ),
          const Divider(color: Colors.white10, height: 1),
          ...unassigned.map((m) => _buildModuleTile(course, m)),
        ],
      ),
    );
  }

  // ─── Single Module / Video Tile ─────────────────────────────────────────────
  Widget _buildModuleTile(CourseModel course, CourseModuleModel m) {
    final isVideo = m.type == 'video';
    final isPdf = m.type == 'pdf';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.white10)),
      ),
      child: Row(
        children: [
          // Icon Avatar
          CircleAvatar(
            radius: 16,
            backgroundColor: isVideo
                ? Colors.blueAccent.withAlpha(30)
                : (isPdf ? Colors.redAccent.withAlpha(30) : Colors.purpleAccent.withAlpha(30)),
            child: Icon(
              isVideo ? Icons.play_arrow_rounded : (isPdf ? Icons.picture_as_pdf_rounded : Icons.quiz_rounded),
              color: isVideo ? Colors.blueAccent : (isPdf ? Colors.redAccent : Colors.purpleAccent),
              size: 18,
            ),
          ),
          const SizedBox(width: 12),

          // Title & Metadata
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  m.title,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Text(
                      m.type.toUpperCase(),
                      style: TextStyle(
                        color: isVideo ? Colors.blueAccent : (isPdf ? Colors.redAccent : Colors.purpleAccent),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (m.duration != null) ...[
                      const Text(' • ', style: TextStyle(color: Colors.grey)),
                      Text('${m.duration} mins', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                    ],
                    const Text(' • ', style: TextStyle(color: Colors.grey)),
                    Text(
                      m.isFree ? '🆓 Free' : '👑 Premium',
                      style: TextStyle(
                        color: m.isFree ? Colors.greenAccent : Colors.amberAccent,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Actions: Play Video, Edit, Delete
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isVideo && m.youtubeUrl != null && m.youtubeUrl!.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.play_circle_filled_rounded, color: Colors.greenAccent, size: 22),
                  tooltip: 'Watch / Preview Video',
                  onPressed: () => _playVideoPreview(course, m),
                ),
              IconButton(
                icon: const Icon(Icons.edit_note_rounded, color: Colors.grey, size: 18),
                tooltip: 'Edit Module',
                onPressed: () => _showModuleDialog(course, module: m),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 18),
                tooltip: 'Delete Module',
                onPressed: () async {
                  _applyOptimisticRemoveModule(m.id);
                  try {
                    await context.read<AdminProvider>().deleteModule(course.id, m.id);
                    await _refreshSelectedCourse(silent: true);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Module deleted successfully!'), backgroundColor: Colors.green),
                      );
                    }
                  } catch (e) {
                    await _refreshSelectedCourse(silent: true);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                      );
                    }
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
