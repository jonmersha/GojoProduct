from rest_framework import serializers
from .models import User, Product, Order, Message
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'username', 'password', 'role')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'vehicle_type', 'rating']

class ProductSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'seller', 'seller_name', 'name', 'description', 'price', 'category', 'image', 'availability', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    delivery_partner_name = serializers.CharField(source='delivery_partner.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'buyer', 'buyer_name', 'seller', 'seller_name', 'delivery_partner', 'delivery_partner_name', 'total_amount', 'delivery_address', 'status', 'items_json', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'created_at']
