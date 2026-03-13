import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/product.dart';
import 'package:lucide_icons/lucide_icons.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final bool isOwner;
  final Function(bool) onToggleAvailability;
  final VoidCallback onAddToCart;

  const ProductCard({
    super.key,
    required this.product,
    required this.isOwner,
    required this.onToggleAvailability,
    required this.onAddToCart,
  });

  Widget _buildImage() {
    if (product.image == null || product.image!.isEmpty) {
      return Container(
        color: const Color(0xFFF5F5F4),
        child: const Icon(LucideIcons.image, color: Color(0xFFD6D3D1), size: 40),
      );
    }

    if (product.image!.startsWith('data:image')) {
      try {
        final base64String = product.image!.split(',').last;
        return Image.memory(
          base64Decode(base64String),
          fit: BoxFit.cover,
          width: double.infinity,
          errorBuilder: (context, error, stackTrace) => Container(
            color: const Color(0xFFF5F5F4),
            child: const Icon(LucideIcons.alertCircle, color: Colors.red),
          ),
        );
      } catch (e) {
        return Container(
          color: const Color(0xFFF5F5F4),
          child: const Icon(LucideIcons.alertCircle, color: Colors.red),
        );
      }
    }

    return Image.network(
      product.image!,
      fit: BoxFit.cover,
      width: double.infinity,
      errorBuilder: (context, error, stackTrace) => Container(
        color: const Color(0xFFF5F5F4),
        child: const Icon(LucideIcons.package, color: Color(0xFFD6D3D1)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF5F5F4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: BorderRadius.circular(20)),
                  child: _buildImage(),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: Text(
                      '${product.price.toStringAsFixed(0)} ETB',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: const Color(0xFF1A1A1A),
                      ),
                    ),
                  ),
                ),
                if (!product.availability)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.7),
                        borderRadius: const BorderRadius.vertical(top: BorderRadius.circular(20)),
                      ),
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'UNAVAILABLE',
                            style: GoogleFonts.inter(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: GoogleFonts.playfairDisplay(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    fontStyle: FontStyle.italic,
                    color: const Color(0xFF1A1A1A),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  product.category.toUpperCase(),
                  style: GoogleFonts.inter(
                    color: Colors.grey[400],
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 12),
                if (isOwner)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Available',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[600],
                        ),
                      ),
                      SizedBox(
                        height: 24,
                        child: Switch(
                          value: product.availability,
                          onChanged: onToggleAvailability,
                          activeColor: const Color(0xFF1A4D2E),
                          scale: 0.8,
                        ),
                      ),
                    ],
                  )
                else
                  SizedBox(
                    width: double.infinity,
                    height: 36,
                    child: ElevatedButton(
                      onPressed: product.availability ? onAddToCart : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1A1A1A),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: EdgeInsets.zero,
                      ),
                      child: Text(
                        product.availability ? 'ADD TO CART' : 'OUT OF STOCK',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
