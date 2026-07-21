/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'app.carecircle',
  appName: 'CareCircle',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: false,       // we hide it manually after app ready
      backgroundColor: '#050510',  // matches the dark bg
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#6366f1',
    },
    StatusBar: {
      style: 'Dark',               // white icons — good on our dark bg
      backgroundColor: '#050510',
      overlaysWebView: false,
    },
  },
  ios: {
    scheme: 'carecircle',          // enables carecircle:// deep links
    contentInset: 'always',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // set true during dev
  },
}

export default config
