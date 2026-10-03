const { success, error } = require('../utils/response');
const { AppSetting } = require('../models');

// Helper to get setting value with fallback
const getSetting = async (key, fallback) => {
  try {
    const setting = await AppSetting.findByPk(key);
    return setting ? setting.value : fallback;
  } catch (err) {
    return fallback;
  }
};

// Helper to set setting value
const setSetting = async (key, value) => {
  await AppSetting.upsert({ key, value: String(value) });
};

// @desc    Latest mobile app version (used by Flutter for update popup)
// @route   GET /api/app/version
// @access  Public
exports.getAppVersion = async (req, res) => {
  try {
    const latestVersion = await getSetting('app_latest_version', process.env.APP_LATEST_VERSION || '1.0.1');
    const minVersion = await getSetting('app_min_version', process.env.APP_MIN_VERSION || '1.0.1');
    const forceUpdateStr = await getSetting('app_force_update', process.env.APP_FORCE_UPDATE || 'false');
    const forceUpdate = forceUpdateStr.toLowerCase() === 'true';
    const androidUrl = await getSetting('app_android_url', process.env.APP_ANDROID_UPDATE_URL || 'https://play.google.com/store/apps/details?id=com.royalneetacademy.student');
    const iosUrl = await getSetting('app_ios_url', process.env.APP_IOS_UPDATE_URL || 'https://apps.apple.com/app/id000000000');
    const message = await getSetting('app_update_message', process.env.APP_UPDATE_MESSAGE || 'A new version of Royal NEET Academy is available. Please update to continue.');

    return success(res, {
      latestVersion,
      minVersion,
      forceUpdate,
      androidUrl,
      iosUrl,
      message,
    }, 'App version retrieved successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// @desc    Update app version and update message settings (Admin)
// @route   PUT /api/app/version
// @access  Private (Admin)
exports.updateAppVersion = async (req, res) => {
  try {
    const { latestVersion, minVersion, forceUpdate, androidUrl, iosUrl, message } = req.body;

    if (latestVersion !== undefined) await setSetting('app_latest_version', latestVersion);
    if (minVersion !== undefined) await setSetting('app_min_version', minVersion);
    if (forceUpdate !== undefined) await setSetting('app_force_update', forceUpdate);
    if (androidUrl !== undefined) await setSetting('app_android_url', androidUrl);
    if (iosUrl !== undefined) await setSetting('app_ios_url', iosUrl);
    if (message !== undefined) await setSetting('app_update_message', message);

    return exports.getAppVersion(req, res);
  } catch (err) {
    return error(res, err.message, 500);
  }
};
