class CourseProgressModel {
  final int courseId;
  final String courseTitle;
  final int totalModules;
  final int completedModules;
  final int completionPercent;
  final int totalDurationMins;
  final int watchedDurationMins;
  final List<int> completedModuleIds;
  final List<ProgressModuleModel> modules;

  CourseProgressModel({
    required this.courseId,
    required this.courseTitle,
    required this.totalModules,
    required this.completedModules,
    required this.completionPercent,
    required this.totalDurationMins,
    required this.watchedDurationMins,
    required this.completedModuleIds,
    required this.modules,
  });

  factory CourseProgressModel.fromJson(Map<String, dynamic> json) {
    return CourseProgressModel(
      courseId: json['courseId'] is int ? json['courseId'] : int.parse(json['courseId'].toString()),
      courseTitle: json['courseTitle'] ?? '',
      totalModules: json['totalModules'] is int ? json['totalModules'] : int.parse(json['totalModules'].toString()),
      completedModules: json['completedModules'] is int ? json['completedModules'] : int.parse(json['completedModules'].toString()),
      completionPercent: json['completionPercent'] is int ? json['completionPercent'] : int.parse(json['completionPercent'].toString()),
      totalDurationMins: json['totalDurationMins'] is int ? json['totalDurationMins'] : int.parse(json['totalDurationMins'].toString()),
      watchedDurationMins: json['watchedDurationMins'] is int ? json['watchedDurationMins'] : int.parse(json['watchedDurationMins'].toString()),
      completedModuleIds: List<int>.from(json['completedModuleIds'] ?? []),
      modules: (json['modules'] as List? ?? [])
          .map((m) => ProgressModuleModel.fromJson(m))
          .toList(),
    );
  }
}

class ProgressModuleModel {
  final int id;
  final String title;
  final String type;
  final int? duration;
  final bool isCompleted;

  ProgressModuleModel({
    required this.id,
    required this.title,
    required this.type,
    this.duration,
    required this.isCompleted,
  });

  factory ProgressModuleModel.fromJson(Map<String, dynamic> json) {
    return ProgressModuleModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      title: json['title'] ?? '',
      type: json['type'] ?? 'video',
      duration: json['duration'] != null ? int.parse(json['duration'].toString()) : null,
      isCompleted: json['isCompleted'] == true || json['isCompleted'] == 1,
    );
  }
}

class ProgressSummaryModel {
  final int totalCourses;
  final int totalModules;
  final int completedModules;
  final int overallCompletionPercent;
  final int totalDurationMins;
  final int watchedDurationMins;

  ProgressSummaryModel({
    required this.totalCourses,
    required this.totalModules,
    required this.completedModules,
    required this.overallCompletionPercent,
    required this.totalDurationMins,
    required this.watchedDurationMins,
  });

  factory ProgressSummaryModel.fromJson(Map<String, dynamic> json) {
    return ProgressSummaryModel(
      totalCourses: json['totalCourses'] is int ? json['totalCourses'] : int.parse(json['totalCourses'].toString()),
      totalModules: json['totalModules'] is int ? json['totalModules'] : int.parse(json['totalModules'].toString()),
      completedModules: json['completedModules'] is int ? json['completedModules'] : int.parse(json['completedModules'].toString()),
      overallCompletionPercent: json['overallCompletionPercent'] is int ? json['overallCompletionPercent'] : int.parse(json['overallCompletionPercent'].toString()),
      totalDurationMins: json['totalDurationMins'] is int ? json['totalDurationMins'] : int.parse(json['totalDurationMins'].toString()),
      watchedDurationMins: json['watchedDurationMins'] is int ? json['watchedDurationMins'] : int.parse(json['watchedDurationMins'].toString()),
    );
  }
}

class PerformanceDashboardModel {
  final ProgressSummaryModel summary;
  final List<CourseProgressModel> courses;

  PerformanceDashboardModel({
    required this.summary,
    required this.courses,
  });

  factory PerformanceDashboardModel.fromJson(Map<String, dynamic> json) {
    return PerformanceDashboardModel(
      summary: ProgressSummaryModel.fromJson(json['summary'] ?? {}),
      courses: (json['courses'] as List? ?? [])
          .map((c) => CourseProgressModel.fromJson(c))
          .toList(),
    );
  }
}
