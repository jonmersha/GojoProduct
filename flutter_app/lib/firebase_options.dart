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

  static const String firestoreDatabaseId = 'ai-studio-62c8bd19-b811-4395-8222-f2982fdc90dd';

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyB4dutrdz81MZ2ykfQExTR1rnfn3iH7ZOo',
    authDomain: 'besheger-apps.firebaseapp.com',
    projectId: 'besheger-apps',
    storageBucket: 'besheger-apps.firebasestorage.app',
    messagingSenderId: '129694048718',
    appId: '1:129694048718:web:f181e3326bc2d4d3a64b9f',
    measurementId: '',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyB4dutrdz81MZ2ykfQExTR1rnfn3iH7ZOo',
    appId: '1:129694048718:android:f181e3326bc2d4d3a64b9f', // Placeholder for android appId
    messagingSenderId: '129694048718',
    projectId: 'besheger-apps',
    storageBucket: 'besheger-apps.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyB4dutrdz81MZ2ykfQExTR1rnfn3iH7ZOo',
    appId: '1:129694048718:ios:f181e3326bc2d4d3a64b9f', // Placeholder for ios appId
    messagingSenderId: '129694048718',
    projectId: 'besheger-apps',
    storageBucket: 'besheger-apps.firebasestorage.app',
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
