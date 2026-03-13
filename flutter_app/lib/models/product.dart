class Product {
  final String id;
  final String sellerId;
  final String? sellerName;
  final String name;
  final String description;
  final double price;
  final String category;
  final String? image;
  final bool availability;

  Product({
    required this.id,
    required this.sellerId,
    this.sellerName,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    this.image,
    this.availability = true,
  });

  factory Product.fromMap(String id, Map<String, dynamic> map) {
    return Product(
      id: id,
      sellerId: map['seller_id'] ?? '',
      sellerName: map['seller_name'],
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      price: (map['price'] ?? 0).toDouble(),
      category: map['category'] ?? 'food',
      image: map['image'],
      availability: map['availability'] ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'seller_id': sellerId,
      'seller_name': sellerName,
      'name': name,
      'description': description,
      'price': price,
      'category': category,
      'image': image,
      'availability': availability,
    };
  }
}
