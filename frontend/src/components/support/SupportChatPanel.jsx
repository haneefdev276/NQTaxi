import { useState } from 'react'
import { Send, Phone, MoreVertical, ArrowLeft, Paperclip, Smile } from 'lucide-react'
import { Link } from 'react-router-dom'
import { chatConversations, chatMessages } from '@data/mockData'

export default function SupportChatPanel() {
  const [activeChat, setActiveChat] = useState(1)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(chatMessages)

  const conversation = chatConversations.find((c) => c.id === activeChat)
  const currentMessages = messages[activeChat] || []

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [
        ...(prev[activeChat] || []),
        { id: Date.now(), sender: 'admin', text: message, time: 'Now' },
      ],
    }))
    setMessage('')
  }

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[#1A1D21] rounded-2xl border border-white/5 overflow-hidden">
      {/* Conversation list */}
      <div className="w-[300px] border-r border-white/5 flex flex-col">
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/support" className="text-white/40 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h3 className="text-white font-semibold">Support Chat</h3>
          </div>
          <p className="text-white/40 text-xs pl-6">{chatConversations.length} conversations</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatConversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-white/5 transition hover:bg-white/[0.03] ${
                activeChat === chat.id ? 'bg-brand-yellow/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={chat.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  {chat.user.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#1A1D21]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium truncate">{chat.user.name}</p>
                    <span className="text-white/30 text-[10px] flex-shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-white/40 text-xs truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="w-5 h-5 bg-brand-yellow text-brand-black text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
              <p className="text-white/20 text-[10px] mt-1 ml-[52px] font-mono">{chat.ticketId}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {conversation ? (
          <>
            {/* Chat header */}
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-3">
              <img src={conversation.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-white font-medium">{conversation.user.name}</p>
                <p className="text-white/40 text-xs">
                  {conversation.user.online ? (
                    <span className="text-green-400">Online</span>
                  ) : (
                    'Offline'
                  )}{' '}
                  · {conversation.ticketId}
                </p>
              </div>
              <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === 'admin'
                        ? 'bg-brand-yellow text-brand-black rounded-br-md'
                        : 'bg-[#111214] text-white/90 rounded-bl-md border border-white/5'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.sender === 'admin' ? 'text-brand-black/50' : 'text-white/30'
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="px-5 py-4 border-t border-white/5 flex items-center gap-3">
              <button type="button" className="p-2 rounded-lg hover:bg-white/5 text-white/30 transition">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[#111214] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-yellow/50"
              />
              <button type="button" className="p-2 rounded-lg hover:bg-white/5 text-white/30 transition">
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="p-2.5 bg-brand-yellow text-brand-black rounded-xl hover:brightness-110 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/30">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
