class CourseModuleModel {
  final int id;
  final String title;
  final String type;
  final int? duration;
  final String? youtubeUrl;
  final String? fileUrl;
  final int order;
  final int? sectionId;
  final bool isFree;

  CourseModuleModel({
    required this.id,
    required this.title,
    required this.type,
    this.duration,
    this.youtubeUrl,
    this.fileUrl,
    required this.order,
    this.sectionId,
    this.isFree = false,
  });

  factory CourseModuleModel.fromJson(Map<String, dynamic> json) {
    int? parsedDuration;
    if (json['duration'] != null) {
      if (json['duration'] is int) {
        parsedDuration = json['duration'] as int;
      } else if (json['duration'] is num) {
        parsedDuration = (json['duration'] as num).round();
      } else {
        parsedDuration = int.tryParse(json['duration'].toString()) ??
            double.tryParse(json['duration'].toString())?.round();
      }
    }

    return CourseModuleModel(
      id: json['id'] is int ? json['id'] as int : (int.tryParse(json['id']?.toString() ?? '') ?? 0),
      title: json['title']?.toString() ?? '',
      type: json['type']?.toString() ?? 'video',
      duration: parsedDuration,
      youtubeUrl: json['youtube_url']?.toString(),
      fileUrl: json['file_url']?.toString(),
      order: json['order'] is int ? json['order'] as int : (int.tryParse((json['order'] ?? 0).toString()) ?? 0),
      sectionId: json['section_id'] != null ? int.tryParse(json['section_id'].toString()) : null,
      isFree: json['is_free'] == true || json['is_free'] == 1 || json['is_free'] == '1',
    );
  }
}

class CourseSectionModel {
  final int id;
  final String title;
  final String? description;
  final int order;
  final int? parentId;
  final List<CourseModuleModel> modules;
  final List<CourseSectionModel> subsections;

  CourseSectionModel({
    required this.id,
    required this.title,
    this.description,
    required this.order,
    this.parentId,
    required this.modules,
    required this.subsections,
  });

  factory CourseSectionModel.fromJson(Map<String, dynamic> json) {
    var modulesList = json['modules'] as List? ?? [];
    var subsectionsList = json['subsections'] as List? ?? [];
    return CourseSectionModel(
      id: json['id'] is int ? json['id'] as int : (int.tryParse(json['id']?.toString() ?? '') ?? 0),
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      order: json['order'] is int ? json['order'] as int : (int.tryParse((json['order'] ?? 0).toString()) ?? 0),
      parentId: json['parent_id'] != null ? int.tryParse(json['parent_id'].toString()) : null,
      modules: modulesList.whereType<Map>().map((m) => CourseModuleModel.fromJson(Map<String, dynamic>.from(m))).toList(),
      subsections: subsectionsList.whereType<Map>().map((s) => CourseSectionModel.fromJson(Map<String, dynamic>.from(s))).toList(),
    );
  }
}

class CourseModel {
  final int id;
  final String title;
  final String? description;
  final double price;
  final String? thumbnail;
  final String? category;
  final String level;
  final String status;
  final String instructorName;
  final List<CourseModuleModel> modules;
  final List<CourseSectionModel> sections;
  final bool isBlocked;
  final String? blockReason;
  final double paidAmount;
  final double remainingAmount;

  CourseModel({
    required this.id,
    required this.title,
    this.description,
    required this.price,
    this.thumbnail,
    this.category,
    required this.level,
    this.status = 'published',
    required this.instructorName,
    required this.modules,
    required this.sections,
    this.isBlocked = false,
    this.blockReason,
    this.paidAmount = 0.0,
    this.remainingAmount = 0.0,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    var modulesList = json['modules'] as List? ?? [];
    var sectionsList = json['sections'] as List? ?? [];

    return CourseModel(
      id: json['id'] is int ? json['id'] as int : (int.tryParse(json['id']?.toString() ?? '') ?? 0),
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      price: double.tryParse((json['price'] ?? 0).toString()) ?? 0.0,
      thumbnail: json['thumbnail']?.toString(),
      category: json['category']?.toString(),
      level: json['level']?.toString() ?? 'beginner',
      status: json['status']?.toString() ?? 'published',
      instructorName: json['instructor_name']?.toString() ?? json['instructorName']?.toString() ?? 'Instructor',
      modules: modulesList.whereType<Map>().map((m) => CourseModuleModel.fromJson(Map<String, dynamic>.from(m))).toList(),
      sections: sectionsList.whereType<Map>().map((s) => CourseSectionModel.fromJson(Map<String, dynamic>.from(s))).toList(),
      isBlocked: json['isBlocked'] == true || json['isBlocked'] == 1 || json['is_blocked'] == true || json['is_blocked'] == 1,
      blockReason: json['blockReason']?.toString() ?? json['block_reason']?.toString(),
      paidAmount: double.tryParse((json['paidAmount'] ?? json['paid_amount'] ?? 0).toString()) ?? 0.0,
      remainingAmount: double.tryParse((json['remainingAmount'] ?? json['remaining_amount'] ?? 0).toString()) ?? 0.0,
    );
  }
}
