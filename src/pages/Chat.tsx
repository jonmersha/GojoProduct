import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Message, User } from '../types';
import { Send, User as UserIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy, or, and, getDocs } from 'firebase/firestore';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<User | null>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch potential contacts (other users)
    const fetchContacts = async () => {
      const q = query(collection(db, 'users'), where('role', '!=', user.role));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user.id) as User[];
      setContacts(usersData);
    };

    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (user && activeChat) {
      // Note: We use an 'or' query to match security rules (user must be sender or receiver).
      // We remove the 'orderBy' from the query to avoid requiring a composite index,
      // and instead sort the results client-side.
      const q = query(
        collection(db, 'messages'),
        or(
          where('sender_id', '==', user.id),
          where('receiver_id', '==', user.id)
        )
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Message))
          .filter(m => 
            (m.sender_id === user.id && m.receiver_id === activeChat.id) ||
            (m.sender_id === activeChat.id && m.receiver_id === user.id)
          );
        
        // Sort client-side since we removed orderBy from the query
        msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        setMessages(msgs);
      }, (error) => {
        console.error('Firestore Error (list messages):', error);
      });

      return () => unsubscribe();
    }
  }, [user, activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChat || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        sender_id: user.id,
        receiver_id: activeChat.id,
        content: newMessage.trim(),
        created_at: new Date().toISOString()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Firestore Error (send message):', error);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-serif italic font-bold text-stone-900">Messages</h2>
          <p className="text-stone-500 text-sm">Chat with buyers and sellers</p>
        </div>

        <div className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setActiveChat(contact)}
              className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-4 hover:border-stone-400 transition-all text-left shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                <UserIcon size={24} />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="font-bold text-stone-900">{contact.name}</span>
                <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">{contact.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-4 pb-4 border-b border-stone-200">
        <button onClick={() => setActiveChat(null)} className="text-stone-400 hover:text-stone-900">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
            <UserIcon size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-stone-900 leading-tight">{activeChat.name}</span>
            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{activeChat.role}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4 scrollbar-hide">
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[80%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                isMine 
                  ? 'bg-stone-900 text-white rounded-tr-none' 
                  : 'bg-white text-stone-900 border border-stone-200 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-stone-400 mt-1 px-1">
                {format(new Date(msg.created_at), 'h:mm a')}
              </span>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSendMessage} className="pt-4 flex gap-2">
        <input 
          type="text" 
          placeholder="Type a message..."
          className="flex-1 bg-white border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/5"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-stone-900 text-white p-3 rounded-2xl shadow-lg hover:bg-stone-800 transition-all"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
