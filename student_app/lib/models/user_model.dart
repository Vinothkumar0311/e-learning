class UserModel {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? mobileNumber;
  final String? avatar;

  UserModel({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.mobileNumber,
    this.avatar,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'].toString(),
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      mobileNumber: json['mobile_number'],
      avatar: json['avatar'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'mobile_number': mobileNumber,
      'avatar': avatar,
    };
  }
}
