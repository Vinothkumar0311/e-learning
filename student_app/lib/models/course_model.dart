class CourseModel {
  final int id;
  final String title;
  final String? description;
  final double price;
  final String? thumbnail;
  final String? category;
  final String level;
  final String instructorName;

  CourseModel({
    required this.id,
    required this.title,
    this.description,
    required this.price,
    this.thumbnail,
    this.category,
    required this.level,
    required this.instructorName,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      price: double.parse(json['price'].toString()),
      thumbnail: json['thumbnail'],
      category: json['category'],
      level: json['level'],
      instructorName: json['instructor_name'] ?? 'Instructor',
    );
  }
}
