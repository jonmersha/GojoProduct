import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../firebase_options.dart';
import 'django_service.dart';

class AppUser {
  final String uid;
  final String? email;
  final String? displayName;
  final String role;

  AppUser({required this.uid, this.email, this.displayName, required this.role});
}

class AuthService with ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final DjangoService _djangoService = DjangoService();
  AppUser? _user;

  AppUser? get user => _user;

  FirebaseFirestore get _db => FirebaseFirestore.instanceFor(databaseId: DefaultFirebaseOptions.firestoreDatabaseId);

  AuthService() {
    _auth.authStateChanges().listen((firebaseUser) async {
      if (firebaseUser == null) {
        _user = null;
      } else {
        final doc = await _db.collection('users').doc(firebaseUser.uid).get();
        final role = doc.exists ? doc.data()?['role'] ?? 'buyer' : 'buyer';
        _user = AppUser(
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: role,
        );
      }
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
      final User? firebaseUser = userCredential.user;

      if (firebaseUser != null) {
        final doc = await _db.collection('users').doc(firebaseUser.uid).get();
        if (!doc.exists) {
          await _db.collection('users').doc(firebaseUser.uid).set({
            'name': firebaseUser.displayName,
            'email': firebaseUser.email,
            'role': role,
            'created_at': DateTime.now().toIso8601String(),
          });
        }
        
        await _djangoService.login(firebaseUser.email!, 'password123');
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
