import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../firebase_options.dart';
import 'django_service.dart';

class AuthService with ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final DjangoService _djangoService = DjangoService();
  User? _user;

  User? get user => _user;

  FirebaseFirestore get _db => FirebaseFirestore.instanceFor(databaseId: DefaultFirebaseOptions.firestoreDatabaseId);

  AuthService() {
    _auth.authStateChanges().listen((user) {
      _user = user;
      notifyListeners();
    });
  }

  Future<void> signInWithGoogle(String role) async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return;

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final UserCredential userCredential = await _auth.signInWithCredential(credential);
      final User? user = userCredential.user;

      if (user != null) {
        // Sync with Django if needed, or just handle login
        // For now, we assume signup is Firebase, but login to Django is required for API access
        // We might need to use a fixed password or the firebase token as password for Django login
        // if we want to use Djoser JWT.
        // Alternatively, we can implement a custom Django auth backend that accepts Firebase tokens.
        // For simplicity, let's assume the user logs in to Django with their email.
        
        // Check if user exists in Firestore (keeping this as requested "except for signup")
        final doc = await _db.collection('users').doc(user.uid).get();
        if (!doc.exists) {
          await _db.collection('users').doc(user.uid).set({
            'name': user.displayName,
            'email': user.email,
            'role': role,
            'created_at': DateTime.now().toIso8601String(),
          });
        }
        
        // Attempt Django login (this assumes the user exists in Django with a known password)
        // In a real app, you'd sync the user to Django during signup.
        await _djangoService.login(user.email!, 'password123'); // Placeholder password
      }
    } catch (e) {
      print('Error signing in with Google: $e');
      rethrow;
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
    await _djangoService.logout();
  }
}
