import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.restokita.app',
  appName: 'RestoKita',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
