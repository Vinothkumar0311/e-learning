const { User } = require('../models');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { email: 'admin@eduadmin.com' } });
    
    if (adminExists) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    await User.create({
      name: 'Super Admin',
      email: 'admin@eduadmin.com',
      password: 'admin123', // Will be hashed by hooks
      role: 'super_admin'
    });

    console.log('✅ Default admin created: admin@eduadmin.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedAdmin();
