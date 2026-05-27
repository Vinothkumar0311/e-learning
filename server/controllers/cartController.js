const { Cart, CartItem, Course, Enrollment, Student } = require('../models');
const { success, error } = require('../utils/response');

// @desc    Add course to cart
// @route   POST /api/student/cart/add
// @access  Private (Student)
exports.addToCart = async (req, res) => {
  const { course_id } = req.body;
  const student_id = req.user.id;

  try {
    const course = await Course.findByPk(course_id);
    if (!course) return error(res, 'Course not found', 404);

    // Check existing enrollment state
    const existingEnrollment = await Enrollment.findOne({ where: { student_id, course_id } });

    if (existingEnrollment) {
      const s = (existingEnrollment.request_status || '').toLowerCase();
      const st = (existingEnrollment.status || '').toLowerCase();
      if (s === 'enrolled' || s === 'paymentverified' || st === 'enrolled') {
        return error(res, 'ALREADY_PURCHASED', 400);
      }
      if (s === 'paymentsubmitted' || s === 'paymentpending' || s === 'approved' || s === 'amountassigned') {
        return error(res, 'PENDING_APPROVAL', 400);
      }
      return error(res, 'ALREADY_ENROLLED', 400);
    }

    // Get or create active cart
    let [cart] = await Cart.findOrCreate({ where: { student_id, status: 'active' } });

    // Check if item already in cart
    const existingItem = await CartItem.findOne({ where: { cart_id: cart.id, course_id } });
    if (existingItem) return error(res, 'ALREADY_IN_CART', 400);

    const cartItem = await CartItem.create({
      cart_id: cart.id,
      course_id,
      price_at_add: course.price
    });

    success(res, cartItem, 'Course added to cart successfully', 201);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get student cart
// @route   GET /api/student/cart
// @access  Private (Student)
exports.getCart = async (req, res) => {
  const student_id = req.user.id;

  try {
    let [cart] = await Cart.findOrCreate({
      where: { student_id, status: 'active' }
    });

    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [{ model: Course, attributes: ['id', 'title', 'price', 'thumbnail', 'category', 'level', 'instructor_name'] }]
    });

    success(res, { cart, items: cartItems });
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/student/cart/:id
// @access  Private (Student)
exports.removeFromCart = async (req, res) => {
  const student_id = req.user.id;
  const itemId = req.params.id;

  try {
    const item = await CartItem.findByPk(itemId, {
      include: [{ model: Cart }]
    });

    if (!item || item.Cart.student_id !== student_id) {
      return error(res, 'Cart item not found', 404);
    }

    await item.destroy();
    success(res, null, 'Item removed from cart');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Checkout cart (submit enrollment requests)
// @route   POST /api/student/cart/checkout
// @access  Private (Student)
exports.checkout = async (req, res) => {
  const student_id = req.user.id;

  try {
    const cart = await Cart.findOne({
      where: { student_id, status: 'active' }
    });

    if (!cart) {
      return error(res, 'Active cart not found', 404);
    }

    const items = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [{ model: Course }]
    });

    if (items.length === 0) {
      return error(res, 'Cart is empty', 400);
    }

    const createdEnrollments = [];

    // Create enrollment request for each item
    for (const item of items) {
      // Check if already exists in enrollments to prevent duplicates
      const existing = await Enrollment.findOne({
        where: { student_id, course_id: item.course_id }
      });

      if (!existing) {
        const enrollment = await Enrollment.create({
          student_id,
          course_id: item.course_id,
          status: 'pending', // compatibility
          request_status: 'Pending',
          fee_status: 'Pending',
          payment_status: 'Pending',
          final_amount: item.Course.price
        });
        createdEnrollments.push(enrollment);
      }
    }

    // Set cart status as checked out
    await cart.update({ status: 'checked_out' });

    success(res, createdEnrollments, 'Checkout complete. Enrollment requests submitted successfully', 201);
  } catch (err) {
    error(res, err.message);
  }
};
