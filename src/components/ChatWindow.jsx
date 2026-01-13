
import { useState, useEffect, useRef } from 'react';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import { getMessages, sendMessage, markMessageAsRead } from '../services/api';
import './ChatWindow.css';

const ChatWindow = ({ group, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);

    // Initial fetch and polling setup
    useEffect(() => {
        if (group?.id) {
            setMessages([]); // Clear previous messages
            fetchMessages();

            // Poll for new messages every 3 seconds (simple real-time)
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(fetchMessages, 3000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [group?.id]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        if (!group?.id) return;
        try {
            const response = await getMessages(group.id);
            if (response.success) {
                setMessages(response.data);
                // Mark as read immediately when messages are fetched/viewed
                markMessageAsRead(group.id, currentUser.id).catch(console.error);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !group?.id) return;

        // Optimistic update
        const tempMsg = {
            id: 'temp-' + Date.now(),
            content: newMessage,
            senderId: currentUser.id,
            senderName: currentUser.name,
            timestamp: { _seconds: Date.now() / 1000 }
        };

        setNewMessage('');

        try {
            await sendMessage(group.id, {
                senderId: currentUser.id,
                senderName: currentUser.name,
                content: tempMsg.content
            });
            fetchMessages(); // Refresh immediately
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!group) {
        return (
            <div className="chat-window empty">
                <div className="empty-chat">
                    <FiMessageSquare />
                    <h3>Select a group to start chatting</h3>
                    <p>Choose a group from the list on the left</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="header-info">
                    <h3>{group.name}</h3>
                    <span>{group.members?.length} members</span>
                </div>
            </div>

            <div className="messages-area">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <p>No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.senderId === currentUser.id;
                        return (
                            <div key={msg.id} className={`message ${isOwn ? 'sent' : 'received'}`}>
                                {!isOwn && <span className="message-sender">{msg.senderName}</span>}
                                <div className="message-content">{msg.content}</div>
                                <span className="message-time">{formatTime(msg.timestamp)}</span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
                    <FiSend />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
