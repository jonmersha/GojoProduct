import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_view
from .models import Message, User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'chat_{self.user_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data['content']
        receiver_id = data['receiver_id']
        sender_id = data['sender_id']

        # Save message to database
        await self.save_message(sender_id, receiver_id, message_content)

        # Send message to receiver's group
        await self.channel_layer.group_send(
            f'chat_{receiver_id}',
            {
                'type': 'chat_message',
                'message': {
                    'sender_id': sender_id,
                    'receiver_id': receiver_id,
                    'content': message_content,
                }
            }
        )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    @database_sync_to_view
    def save_message(self, sender_id, receiver_id, content):
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)
        return Message.objects.create(sender=sender, receiver=receiver, content=content)
