const { User } = require('../models');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { email: 'admin@eduadmin.com' } });
    
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@eduadmin.com',
        password: 'admin123',
        role: 'super_admin'
      });
      console.log('✅ Default admin created: admin@eduadmin.com / admin123');
    } else {
      console.log('ℹ️ Admin already exists.');
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  }
};

if (require.main === module) {
  seedAdmin().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedAdmin;
