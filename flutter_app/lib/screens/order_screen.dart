import 'package:flutter/material.dart';
import '../services/django_service.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class OrderScreen extends StatelessWidget {
  const OrderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);
    final djangoService = DjangoService();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Orders'),
      ),
      body: FutureBuilder<List<dynamic>>(
        future: djangoService.getUserOrders(auth.user?.uid ?? ''),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final orders = snapshot.data ?? [];
          if (orders.isEmpty) {
            return const Center(child: Text('No orders found'));
          }
          return ListView.builder(
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final order = orders[index];
              return ListTile(
                title: Text('Order #${order['id'].toString().substring(0, 8)}'),
                subtitle: Text('Status: ${order['status']}'),
                trailing: Text('${order['total_amount']} ETB'),
              );
            },
          );
        },
      ),
    );
  }
}
