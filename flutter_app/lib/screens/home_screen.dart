import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/product.dart';
import '../widgets/product_card.dart';
import '../services/auth_service.dart';
import 'package:provider/provider.dart';
import '../firebase_options.dart';
import '../services/django_service.dart';

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
    {'id': 'all', 'label': 'All', 'icon': Icons.home},
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
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Gojo Marketplace', style: TextStyle(fontStyle: FontStyle.italic, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => auth.signOut(),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              onChanged: (value) => setState(() => searchQuery = value),
              decoration: InputDecoration(
                hintText: 'Search products...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          SizedBox(
            height: 50,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final cat = categories[index];
                final isSelected = selectedCategory == cat['id'];
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: FilterChip(
                    label: Text(cat['label']),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() => selectedCategory = cat['id']);
                    },
                    avatar: Icon(cat['icon'], size: 16, color: isSelected ? Colors.white : Colors.grey),
                    backgroundColor: Colors.white,
                    selectedColor: Colors.black,
                    labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                );
              },
            ),
          ),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: _djangoService.getProducts(
                category: selectedCategory == 'all' ? null : selectedCategory,
              ),
              builder: (context, snapshot) {
                if (snapshot.hasError) return Center(child: Text('Error: ${snapshot.error}'));
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                final products = snapshot.data!
                    .map((data) => Product.fromMap(data['id'], data as Map<String, dynamic>))
                    .where((p) => p.name.toLowerCase().contains(searchQuery.toLowerCase()))
                    .toList();

                if (products.isEmpty) {
                  return const Center(child: Text('No products found'));
                }

                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.7,
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
                        setState(() {}); // Refresh UI
                      },
                      onAddToCart: () {
                        // Implement checkout logic
                      },
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
