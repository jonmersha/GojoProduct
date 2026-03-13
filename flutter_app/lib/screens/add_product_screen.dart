import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../services/django_service.dart';

class AddProductScreen extends StatefulWidget {
  const AddProductScreen({super.key});

  @override
  State<AddProductScreen> createState() => _AddProductScreenState();
}

class _AddProductScreenState extends State<AddProductScreen> {
  final _formKey = GlobalKey<FormState>();
  final DjangoService _djangoService = DjangoService();
  final ImagePicker _picker = ImagePicker();

  String name = '';
  String description = '';
  double price = 0.0;
  String category = 'food';
  String? base64Image;
  bool isUploading = false;

  final List<String> categories = ['food', 'drinks', 'clothing', 'crafts'];

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 85,
    );

    if (image != null) {
      final bytes = await image.readAsBytes();
      if (bytes.lengthInBytes > 500 * 1024) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Image must be less than 500KB')),
          );
        }
        return;
      }

      setState(() {
        base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      });
    }
  }

  Future<void> _submit() async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final user = auth.user;

    if (!_formKey.currentState!.validate() || base64Image == null || user == null) {
      if (base64Image == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please upload an image')),
        );
      }
      if (user == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('User not authenticated')),
        );
      }
      return;
    }

    _formKey.currentState!.save();
    setState(() => isUploading = true);

    try {
      await _djangoService.addProduct({
        'seller': user.uid,
        'name': name,
        'description': description,
        'price': price,
        'category': category,
        'image': base64Image,
        'availability': true,
      });
      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => isUploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Add Product',
          style: GoogleFonts.playfairDisplay(
            fontWeight: FontWeight.bold,
            fontStyle: FontStyle.italic,
            color: Colors.black,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'VISUAL REPRESENTATION',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                  color: Colors.grey[400],
                ),
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: _pickImage,
                child: Container(
                  width: double.infinity,
                  height: 200,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F5F4),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFFE5E5E5), style: BorderStyle.solid),
                  ),
                  child: base64Image != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: Image.memory(
                            base64Decode(base64Image!.split(',').last),
                            fit: BoxFit.cover,
                          ),
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(LucideIcons.upload, color: Colors.grey, size: 32),
                            const SizedBox(height: 8),
                            Text(
                              'Tap to upload image',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey,
                              ),
                            ),
                            Text(
                              'Max 500KB',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                color: Colors.grey[400],
                              ),
                            ),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'PRODUCT SPECIFICATIONS',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                  color: Colors.grey[400],
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: _inputDecoration('Product Name'),
                style: GoogleFonts.inter(fontSize: 14),
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onSaved: (v) => name = v!,
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: _inputDecoration('Description'),
                style: GoogleFonts.inter(fontSize: 14),
                maxLines: 3,
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onSaved: (v) => description = v!,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      decoration: _inputDecoration('Price (ETB)'),
                      style: GoogleFonts.inter(fontSize: 14),
                      keyboardType: TextInputType.number,
                      validator: (v) => v!.isEmpty ? 'Required' : null,
                      onSaved: (v) => price = double.parse(v!),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF5F5F4),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: category,
                          isExpanded: true,
                          items: categories.map((c) => DropdownMenuItem(
                            value: c,
                            child: Text(c.toUpperCase(), style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                          )).toList(),
                          onChanged: (v) => setState(() => category = v!),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: isUploading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1A1A1A),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: isUploading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'LIST PRODUCT',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.bold,
                            letterSpacing: 2,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      hintText: label,
      hintStyle: GoogleFonts.inter(color: Colors.grey[400], fontSize: 14),
      filled: true,
      fillColor: const Color(0xFFF5F5F4),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }
}
