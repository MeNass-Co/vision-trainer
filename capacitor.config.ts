import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.visiontrainer.app',
  appName: 'Vision Trainer',
  webDir: 'dist',
  ios: {
    minVersion: '16.0',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 500,
      backgroundColor: '#1C1916',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1C1916',
    },
  },
};

export default config;
