import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myani.li',
  appName: 'MyAniLi',
  webDir: 'dist/frontend',
  server: {
    androidScheme: 'https',
    cleartext: true // Allow localhost for development
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
