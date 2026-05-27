import 'course_model.dart';

class CartModel {
  final int id;
  final String studentId;
  final String status;
  final List<CartItemModel> items;

  CartModel({
    required this.id,
    required this.studentId,
    required this.status,
    required this.items,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) {
    var list = json['items'] as List? ?? [];
    List<CartItemModel> itemList = list.map((i) => CartItemModel.fromJson(i)).toList();

    return CartModel(
      id: json['cart']['id'],
      studentId: json['cart']['student_id'].toString(),
      status: json['cart']['status'] ?? 'active',
      items: itemList,
    );
  }
}

class CartItemModel {
  final int id;
  final int cartId;
  final int courseId;
  final double priceAtAdd;
  final CourseModel? course;

  CartItemModel({
    required this.id,
    required this.cartId,
    required this.courseId,
    required this.priceAtAdd,
    this.course,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      id: json['id'],
      cartId: json['cart_id'],
      courseId: json['course_id'],
      priceAtAdd: double.parse(json['price_at_add'].toString()),
      course: json['Course'] != null ? CourseModel.fromJson(json['Course']) : null,
    );
  }
}
