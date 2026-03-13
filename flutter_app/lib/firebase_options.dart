import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const String firestoreDatabaseId = '(default)';

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyA-EXAMPLE-KEY',
    authDomain: 'gojo-marketplace.firebaseapp.com',
    projectId: 'gojo-marketplace',
    storageBucket: 'gojo-marketplace.appspot.com',
    messagingSenderId: '1234567890',
    appId: '1:1234567890:web:abcdef123456',
    measurementId: 'G-ABCDEF1234',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyA-EXAMPLE-KEY',
    appId: '1:1234567890:android:abcdef123456',
    messagingSenderId: '1234567890',
    projectId: 'gojo-marketplace',
    storageBucket: 'gojo-marketplace.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyA-EXAMPLE-KEY',
    appId: '1:1234567890:ios:abcdef123456',
    messagingSenderId: '1234567890',
    projectId: 'gojo-marketplace',
    storageBucket: 'gojo-marketplace.appspot.com',
    iosBundleId: 'com.example.gojoMarketplace',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyA-EXAMPLE-KEY',
    appId: '1:1234567890:ios:abcdef123456',
    messagingSenderId: '1234567890',
    projectId: 'gojo-marketplace',
    storageBucket: 'gojo-marketplace.appspot.com',
    iosBundleId: 'com.example.gojoMarketplace',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyA-EXAMPLE-KEY',
    appId: '1:1234567890:windows:abcdef123456',
    messagingSenderId: '1234567890',
    projectId: 'gojo-marketplace',
    storageBucket: 'gojo-marketplace.appspot.com',
  );
}
