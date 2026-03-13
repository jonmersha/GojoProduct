import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/auth_service.dart';
import 'package:lucide_icons/lucide_icons.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String selectedRole = 'buyer';

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);

    return Scaffold(
      body: Stack(
        children: [
          // Background Image with Overlay
          Positioned.fill(
            child: Image.network(
              'https://images.unsplash.com/photo-1511317558626-64490e7ee89a?q=80&w=1000&auto=format&fit=crop',
              fit: BoxFit.cover,
              referrerPolicy: ReferrerPolicy.noReferrer,
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF1A4D2E).withOpacity(0.8),
                    const Color(0xFF1A1A1A).withOpacity(0.95),
                  ],
                ),
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(),
                  // Logo
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: const Icon(LucideIcons.shoppingBag, size: 60, color: Colors.white),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'GOJO',
                    style: GoogleFonts.playfairDisplay(
                      color: Colors.white,
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 8,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'MARKETPLACE',
                    style: GoogleFonts.inter(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 4,
                    ),
                  ),
                  const SizedBox(height: 64),
                  // Role Selection
                  Text(
                    'SELECT YOUR ROLE',
                    style: GoogleFonts.inter(
                      color: Colors.white.withOpacity(0.4),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _roleButton('buyer', LucideIcons.user),
                      const SizedBox(width: 16),
                      _roleButton('seller', LucideIcons.store),
                      const SizedBox(width: 16),
                      _roleButton('delivery', LucideIcons.truck),
                    ],
                  ),
                  const SizedBox(height: 48),
                  // Google Sign In
                  SizedBox(
                    width: double.infinity,
                    height: 60,
                    child: ElevatedButton.icon(
                      onPressed: () => auth.signInWithGoogle(selectedRole),
                      icon: Image.network(
                        'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
                        height: 24,
                      ),
                      label: Text(
                        'CONTINUE WITH GOOGLE',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    'Empowering Ethiopian Artisans',
                    style: GoogleFonts.playfairDisplay(
                      color: Colors.white.withOpacity(0.5),
                      fontStyle: FontStyle.italic,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _roleButton(String role, IconData icon) {
    final isSelected = selectedRole == role;
    return GestureDetector(
      onTap: () => setState(() => selectedRole = role),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? Colors.white : Colors.white.withOpacity(0.1),
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: Colors.white.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, 10))]
              : [],
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? Colors.black : Colors.white, size: 24),
            const SizedBox(height: 8),
            Text(
              role.toUpperCase(),
              style: GoogleFonts.inter(
                color: isSelected ? Colors.black : Colors.white,
                fontSize: 9,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
