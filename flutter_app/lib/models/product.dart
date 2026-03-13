class Product {
  final String id;
  final String sellerId;
  final String sellerName;
  final String name;
  final String description;
  final double price;
  final String category;
  final String? image;
  final bool availability;
  final DateTime createdAt;

  Product({
    required this.id,
    required this.sellerId,
    required this.sellerName,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    this.image,
    required this.availability,
    required this.createdAt,
  });

  factory Product.fromMap(String id, Map<String, dynamic> map) {
    return Product(
      id: id,
      sellerId: map['seller']?.toString() ?? '',
      sellerName: map['seller_name'] ?? 'Unknown Seller',
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      price: double.tryParse(map['price']?.toString() ?? '0') ?? 0.0,
      category: map['category'] ?? 'food',
      image: map['image'],
      availability: map['availability'] ?? true,
      createdAt: DateTime.tryParse(map['created_at'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'seller': sellerId,
      'name': name,
      'description': description,
      'price': price,
      'category': category,
      'image': image,
      'availability': availability,
    };
  }
}
