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
    return CourseModuleModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      title: json['title'] ?? '',
      type: json['type'] ?? 'video',
      duration: json['duration'] != null ? int.parse(json['duration'].toString()) : null,
      youtubeUrl: json['youtube_url'],
      fileUrl: json['file_url'],
      order: json['order'] is int ? json['order'] : int.parse(json['order'].toString()),
      sectionId: json['section_id'] != null ? int.parse(json['section_id'].toString()) : null,
      isFree: json['is_free'] == true || json['is_free'] == 1,
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
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      title: json['title'] ?? '',
      description: json['description'],
      order: json['order'] is int ? json['order'] : int.parse(json['order'].toString()),
      parentId: json['parent_id'] != null ? int.parse(json['parent_id'].toString()) : null,
      modules: modulesList.map((m) => CourseModuleModel.fromJson(m)).toList(),
      subsections: subsectionsList.map((s) => CourseSectionModel.fromJson(s)).toList(),
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
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      title: json['title'] ?? '',
      description: json['description'],
      price: double.parse(json['price'].toString()),
      thumbnail: json['thumbnail'],
      category: json['category'],
      level: json['level'] ?? 'Beginner',
      instructorName: json['instructor_name'] ?? 'Instructor',
      modules: modulesList.map((m) => CourseModuleModel.fromJson(m)).toList(),
      sections: sectionsList.map((s) => CourseSectionModel.fromJson(s)).toList(),
      isBlocked: json['isBlocked'] == true || json['isBlocked'] == 1,
      blockReason: json['blockReason'],
      paidAmount: json['paidAmount'] != null ? double.parse(json['paidAmount'].toString()) : 0.0,
      remainingAmount: json['remainingAmount'] != null ? double.parse(json['remainingAmount'].toString()) : 0.0,
    );
  }
}
