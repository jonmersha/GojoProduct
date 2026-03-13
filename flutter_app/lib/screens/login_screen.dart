import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String selectedRole = 'buyer';
  bool isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context, listen: false);

    return Scaffold(
      body: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Gojo Marketplace',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                fontStyle: FontStyle.italic,
                fontFamily: 'Georgia',
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Traditional flavors, modern convenience.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 48),
            const Text(
              'CHOOSE YOUR ROLE',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _roleButton('buyer', Icons.shopping_bag, 'Buyer'),
                const SizedBox(width: 12),
                _roleButton('seller', Icons.store, 'Seller'),
                const SizedBox(width: 12),
                _roleButton('delivery', Icons.truck, 'Delivery'),
              ],
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: isSubmitting ? null : () async {
                  setState(() => isSubmitting = true);
                  try {
                    await auth.signInWithGoogle(selectedRole);
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Login failed: $e')),
                    );
                  } finally {
                    setState(() => isSubmitting = false);
                  }
                },
                icon: const Icon(Icons.login),
                label: Text(isSubmitting ? 'SIGNING IN...' : 'CONTINUE WITH GOOGLE'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _roleButton(String id, IconData icon, String label) {
    final isSelected = selectedRole == id;
    return GestureDetector(
      onTap: () => setState(() => selectedRole = id),
      child: Container(
        width: 100,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? Colors.black : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? Colors.black : Colors.grey[200]!),
          boxShadow: isSelected ? [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 8)] : [],
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? Colors.white : Colors.grey),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
