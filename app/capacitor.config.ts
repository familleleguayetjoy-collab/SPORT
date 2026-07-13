import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.familleleguay.deficittracker',
  appName: 'Déficit Tracker',
  webDir: 'dist',
  backgroundColor: '#0a0d12',
  plugins: {
    SplashScreen: {
      launchShowDuration: 700,
      backgroundColor: '#0a0d12',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0d12',
    },
  },
};

export default config;
