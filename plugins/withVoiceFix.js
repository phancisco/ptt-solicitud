const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withVoiceFix(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const buildGradlePath = path.join(
        config.modRequest.projectRoot,
        'node_modules',
        '@react-native-voice',
        'voice',
        'android',
        'build.gradle'
      );

      if (fs.existsSync(buildGradlePath)) {
        let content = fs.readFileSync(buildGradlePath, 'utf8');
        
        content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
        
        content = content.replace(/def DEFAULT_COMPILE_SDK_VERSION = 28/g, 'def DEFAULT_COMPILE_SDK_VERSION = 34');
        content = content.replace(/def DEFAULT_TARGET_SDK_VERSION = 28/g, 'def DEFAULT_TARGET_SDK_VERSION = 34');
        content = content.replace(/compileSdkVersion/g, 'compileSdk');
        content = content.replace(/targetSdkVersion/g, 'targetSdk');
        
        content = content.replace(
          /implementation ['"]com\.android\.support:appcompat-v7:.*['"]/g, 
          'implementation "androidx.appcompat:appcompat:1.6.1"'
        );
        
        fs.writeFileSync(buildGradlePath, content);
      }
      return config;
    },
  ]);
};