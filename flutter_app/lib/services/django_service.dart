import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DjangoService {
  static const String baseUrl = 'http://localhost:8000'; // Update with your actual backend URL
  final _storage = const Flutter_secure_storage();

  Future<String?> get _token async => await _storage.read(key: 'jwt_token');

  Future<Map<String, String>> get _headers async {
    final token = await _token;
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'JWT $token',
    };
  }

  // Auth
  Future<bool> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/jwt/create/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _storage.write(key: 'jwt_token', value: data['access']);
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
  }

  // Products
  Future<List<dynamic>> getProducts({String? category, String? sellerId}) async {
    final queryParams = {
      if (category != null) 'category': category,
      if (sellerId != null) 'seller_id': sellerId,
    };
    final uri = Uri.parse('$baseUrl/api/products/').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: await _headers);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load products');
  }

  Future<void> addProduct(Map<String, dynamic> productData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/products/'),
      headers: await _headers,
      body: jsonEncode(productData),
    );

    if (response.statusCode != 201) {
      throw Exception('Failed to add product: ${response.body}');
    }
  }

  Future<void> updateProductAvailability(String productId, bool availability) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/api/products/$productId/'),
      headers: await _headers,
      body: jsonEncode({'availability': availability}),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update product');
    }
  }

  // Orders
  Future<List<dynamic>> getUserOrders(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/orders/user/$userId/'),
      headers: await _headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load orders');
  }

  Future<void> updateOrderStatus(String orderId, String status, {String? deliveryId}) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/api/orders/$orderId/status/'),
      headers: await _headers,
      body: jsonEncode({
        'status': status,
        if (deliveryId != null) 'delivery_id': deliveryId,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update order status');
    }
  }

  // Messages
  Future<List<dynamic>> getChatHistory(String userId, String otherId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/messages/chat/$userId/$otherId/'),
      headers: await _headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load chat history');
  }
}
