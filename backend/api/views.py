from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Product, Order, Message
from .serializers import UserSerializer, ProductSerializer, OrderSerializer, MessageSerializer
from django.db.models import Q

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'])
    def delivery_partners(self, request):
        partners = User.objects.filter(role='delivery')
        serializer = self.get_serializer(partners, many=True)
        return Response(serializer.data)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
        queryset = Product.objects.filter(availability=True)
        category = self.request.query_params.get('category')
        seller_id = self.request.query_params.get('seller_id')
        
        if category:
            queryset = queryset.filter(category=category)
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
            
        return queryset

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_orders(self, request, user_id=None):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if user.role == 'buyer':
            orders = Order.objects.filter(buyer_id=user_id)
        elif user.role == 'seller':
            orders = Order.objects.filter(seller_id=user_id)
        else:
            orders = Order.objects.filter(Q(delivery_partner_id=user_id) | Q(status='ready'))
            
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        delivery_id = request.data.get('delivery_id')
        
        if new_status:
            order.status = new_status
        if delivery_id:
            order.delivery_partner_id = delivery_id
            
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    @action(detail=False, methods=['get'], url_path='chat/(?P<user_id>[^/.]+)/(?P<other_id>[^/.]+)')
    def chat_history(self, request, user_id=None, other_id=None):
        messages = Message.objects.filter(
            (Q(sender_id=user_id) & Q(receiver_id=other_id)) |
            (Q(sender_id=other_id) & Q(receiver_id=user_id))
        ).order_by('created_at')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
