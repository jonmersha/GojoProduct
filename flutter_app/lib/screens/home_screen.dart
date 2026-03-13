import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/product.dart';
import '../widgets/product_card.dart';
import '../services/auth_service.dart';
import 'package:provider/provider.dart';
import '../firebase_options.dart';
import '../services/django_service.dart';
import 'add_product_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String selectedCategory = 'all';
  String searchQuery = '';
  final DjangoService _djangoService = DjangoService();

  FirebaseFirestore get _db => FirebaseFirestore.instanceFor(databaseId: DefaultFirebaseOptions.firestoreDatabaseId);

  final List<Map<String, dynamic>> categories = [
    {'id': 'all', 'label': 'All', 'icon': Icons.grid_view},
    {'id': 'food', 'label': 'Food', 'icon': Icons.restaurant},
    {'id': 'drinks', 'label': 'Drinks', 'icon': Icons.local_cafe},
    {'id': 'clothing', 'label': 'Clothing', 'icon': Icons.checkroom},
    {'id': 'crafts', 'label': 'Crafts', 'icon': Icons.palette},
  ];

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);
    final user = auth.user;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F4),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        title: Text(
          'Gojo Marketplace',
          style: GoogleFonts.playfairDisplay(
            fontStyle: FontStyle.italic,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF1A1A1A),
            fontSize: 24,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF1A1A1A)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_outlined),
            onPressed: () => auth.signOut(),
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: Color(0xFF1A4D2E)),
              child: Center(
                child: Text(
                  'GOJO',
                  style: GoogleFonts.playfairDisplay(
                    color: Colors.white,
                    fontSize: 40,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 4,
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'CATEGORIES',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                  color: Colors.grey[400],
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: EdgeInsets.zero,
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final cat = categories[index];
                  final isSelected = selectedCategory == cat['id'];
                  return ListTile(
                    leading: Icon(
                      cat['icon'],
                      color: isSelected ? const Color(0xFF1A4D2E) : Colors.grey,
                    ),
                    title: Text(
                      cat['label'],
                      style: GoogleFonts.inter(
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? const Color(0xFF1A4D2E) : Colors.black87,
                      ),
                    ),
                    selected: isSelected,
                    onTap: () {
                      setState(() => selectedCategory = cat['id']);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: TextField(
              onChanged: (value) => setState(() => searchQuery = value),
              style: GoogleFonts.inter(fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search handcrafted items...',
                hintStyle: GoogleFonts.inter(color: Colors.grey[400]),
                prefixIcon: const Icon(Icons.search, size: 20),
                filled: true,
                fillColor: const Color(0xFFF5F5F5),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: _djangoService.getProducts(
                category: selectedCategory == 'all' ? null : selectedCategory,
              ),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.red),
                        const SizedBox(height: 16),
                        Text('Error: ${snapshot.error}', style: GoogleFonts.inter()),
                      ],
                    ),
                  );
                }
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF1A4D2E)));
                }

                final products = snapshot.data!
                    .map((data) => Product.fromMap(data['id'], data as Map<String, dynamic>))
                    .where((p) => p.name.toLowerCase().contains(searchQuery.toLowerCase()))
                    .toList();

                if (products.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search_off, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        Text(
                          'No products found',
                          style: GoogleFonts.playfairDisplay(
                            fontSize: 20,
                            fontStyle: FontStyle.italic,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.68,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: products.length,
                  itemBuilder: (context, index) {
                    final product = products[index];
                    return ProductCard(
                      product: product,
                      isOwner: user?.uid == product.sellerId,
                      onToggleAvailability: (newStatus) {
                        _djangoService.updateProductAvailability(product.id, newStatus);
                        setState(() {});
                      },
                      onAddToCart: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${product.name} added to cart'),
                            backgroundColor: const Color(0xFF1A4D2E),
                          ),
                        );
                      },
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: user?.role == 'seller'
          ? FloatingActionButton(
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AddProductScreen()),
                );
                if (result == true) {
                  setState(() {});
                }
              },
              backgroundColor: const Color(0xFF1A4D2E),
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
    );
  }
}
