import React, { useState, useEffect } from 'react';
import { 
  Users, MessageCircle, UserPlus, TrendingUp, Search, Send, 
  Check, X, Building2, Star, Sparkles, Award, BarChart3,
  MapPin, Briefcase, GraduationCap, Mail, Globe, Github,
  Linkedin, ExternalLink, Filter, ChevronRight, Clock, Eye
} from 'lucide-react';
import { User } from '../types';
import { UserProfileModal } from './UserProfileModal';

interface NetworkDashboardProps {
  currentUser: User;
}

interface NetworkSuggestion {
  user: User;
  matchScore: number;
  reasons: string[];
  mutualConnections: number;
  extendedProfile?: any;
}

interface Connection {
  connection: any;
  user: User;
  extendedProfile?: any;
}

interface ConnectionRequest {
  request: any;
  fromUser?: User;
  toUser?: User;
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  partnerTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  isLastMessageFromMe: boolean;
  unreadCount: number;
}

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const NetworkDashboard: React.FC<NetworkDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'connections' | 'messages' | 'discover'>('suggestions');
  const [suggestions, setSuggestions] = useState<NetworkSuggestion[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [networkScore, setNetworkScore] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Messaging states
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Profile modal state
  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null);

  // User search states
  const [discoverSearchQuery, setDiscoverSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchNetworkData();
  }, [currentUser.id]);

  const fetchNetworkData = async () => {
    setIsLoading(true);
    try {
      const [suggestionsRes, connectionsRes, requestsRes, conversationsRes, scoreRes] = await Promise.all([
        fetch(`/api/network/suggestions?userId=${currentUser.id}`),
        fetch(`/api/network/connections?userId=${currentUser.id}`),
        fetch(`/api/network/connections/requests?userId=${currentUser.id}`),
        fetch(`/api/network/messages/conversations?userId=${currentUser.id}`),
        fetch(`/api/network/score?userId=${currentUser.id}`)
      ]);

      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data.suggestions || []);
      }

      if (connectionsRes.ok) {
        const data = await connectionsRes.json();
        setConnections(data.connections || []);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setIncomingRequests(data.incoming || []);
        setOutgoingRequests(data.outgoing || []);
      }

      if (conversationsRes.ok) {
        const data = await conversationsRes.json();
        setConversations(data.conversations || []);
      }

      if (scoreRes.ok) {
        const data = await scoreRes.json();
        setNetworkScore(data.score);
      }
    } catch (err) {
      console.error('Network data fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendConnectionRequest = async (toUserId: string) => {
    try {
      const res = await fetch('/api/network/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: currentUser.id,
          toUserId,
          message: 'Bağlantı kurmak isterim.'
        })
      });

      if (res.ok) {
        fetchNetworkData();
      }
    } catch (err) {
      console.error('Send connection request failed:', err);
    }
  };

  const handleRespondToRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/network/connections/request/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        fetchNetworkData();
      }
    } catch (err) {
      console.error('Respond to request failed:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const res = await fetch('/api/network/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: currentUser.id,
          toUserId: selectedConversation,
          content: messageInput
        })
      });

      if (res.ok) {
        setMessageInput('');
        await loadMessages(selectedConversation);
        fetchNetworkData();
      }
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const loadMessages = async (partnerId: string) => {
    try {
      const res = await fetch(`/api/network/messages/${partnerId}?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Load messages failed:', err);
    }
  };

  const handleSelectConversation = (partnerId: string) => {
    setSelectedConversation(partnerId);
    loadMessages(partnerId);
  };

  // Search users in Discover tab
  const handleSearchUsers = async (query: string) => {
    setDiscoverSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/network/search?query=${encodeURIComponent(query)}&userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch (err) {
      console.error('User search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConnections = connections.filter(c =>
    c.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Network
              </h1>
              <p className="text-sm text-slate-500 mt-1">Profesyonel bağlantılarınızı geliştirin</p>
            </div>

            {/* Network Score Card */}
            {networkScore && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-600">{networkScore.totalScore}</div>
                    <div className="text-xs text-slate-600 font-semibold">Network Skoru</div>
                  </div>
                  <div className="h-12 w-px bg-blue-200"></div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Award className="h-3 w-3 text-emerald-600" />
                      <span className="text-slate-600">Profil: {networkScore.profileCompletionScore}/50</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="h-3 w-3 text-blue-600" />
                      <span className="text-slate-600">Bağlantılar: {networkScore.connectionsScore}/30</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="h-3 w-3 text-purple-600" />
                      <span className="text-slate-600">Etkileşim: {networkScore.engagementScore}/20</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === 'suggestions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="h-4 w-4 inline mr-1.5" />
              Öneriler ({suggestions.length})
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === 'connections'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="h-4 w-4 inline mr-1.5" />
              Bağlantılar ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-1.5" />
              Mesajlar ({conversations.length})
              {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === 'discover'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Search className="h-4 w-4 inline mr-1.5" />
              Keşfet
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            
            {/* Incoming Requests Section */}
            {incomingRequests.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  Bekleyen İstekler ({incomingRequests.length})
                </h3>
                <div className="space-y-3">
                  {incomingRequests.map((req) => (
                    <div key={req.request.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        {req.fromUser?.avatarUrl ? (
                          <img src={req.fromUser.avatarUrl} alt={req.fromUser.fullName} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {req.fromUser?.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{req.fromUser?.fullName}</p>
                          <p className="text-sm text-slate-600">{req.fromUser?.title || 'Kullanıcı'}</p>
                          {req.request.message && (
                            <p className="text-xs text-slate-500 mt-1 italic">"{req.request.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespondToRequest(req.request.id, 'accept')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                        >
                          <Check className="h-4 w-4 inline mr-1" />
                          Kabul Et
                        </button>
                        <button
                          onClick={() => handleRespondToRequest(req.request.id, 'reject')}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition"
                        >
                          <X className="h-4 w-4 inline mr-1" />
                          Reddet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Tanıyor Olabileceğiniz Kişiler
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Kişi ara..."
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuggestions.map((suggestion) => (
                  <div key={suggestion.user.id} className="border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition">
                    <div className="flex items-start gap-3 mb-3 cursor-pointer group" onClick={() => setViewProfileUser(suggestion.user)}>
                      {suggestion.user.avatarUrl ? (
                        <img src={suggestion.user.avatarUrl} alt={suggestion.user.fullName} className="h-14 w-14 rounded-lg object-cover group-hover:opacity-90 transition" />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:opacity-90 transition">
                          {suggestion.user.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition">{suggestion.user.fullName}</h4>
                        <p className="text-sm text-slate-600">{suggestion.user.title || 'Kullanıcı'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {suggestion.user.location || 'Konum belirtilmemiş'}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="px-2 py-1 bg-purple-50 rounded-lg border border-purple-100">
                          <span className="text-xs font-bold text-purple-700">%{suggestion.matchScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Why Suggested */}
                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Neden önerildi?
                      </p>
                      <ul className="space-y-1">
                        {suggestion.reasons.map((reason, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <ChevronRight className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                      {suggestion.mutualConnections > 0 && (
                        <p className="text-xs text-blue-600 font-semibold mt-2">
                          🤝 {suggestion.mutualConnections} ortak bağlantı
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSendConnectionRequest(suggestion.user.id)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                    >
                      <UserPlus className="h-4 w-4 inline mr-1.5" />
                      Bağlan
                    </button>
                  </div>
                ))}
              </div>

              {filteredSuggestions.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">Şu an için öneri yok</p>
                  <p className="text-sm text-slate-500 mt-1">Profilinizi doldurun ve daha fazla bağlantı kurun!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Bağlantılarım ({connections.length})
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bağlantı ara..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnections.map((conn) => (
                <div key={conn.connection.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition">
                  <div className="flex items-center gap-3 mb-3 cursor-pointer group" onClick={() => setViewProfileUser(conn.user)}>
                    {conn.user.avatarUrl ? (
                      <img src={conn.user.avatarUrl} alt={conn.user.fullName} className="h-12 w-12 rounded-lg object-cover group-hover:opacity-90 transition" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold group-hover:opacity-90 transition">
                        {conn.user.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition">{conn.user.fullName}</h4>
                      <p className="text-xs text-slate-600">{conn.user.title || 'Kullanıcı'}</p>
                    </div>
                  </div>

                  {conn.extendedProfile && (
                    <div className="space-y-1 mb-3 text-xs text-slate-600">
                      {conn.extendedProfile.company && (
                        <p className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3" />
                          {conn.extendedProfile.company}
                        </p>
                      )}
                      {conn.extendedProfile.university && (
                        <p className="flex items-center gap-1.5">
                          <GraduationCap className="h-3 w-3" />
                          {conn.extendedProfile.university}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('messages');
                      handleSelectConversation(conn.user.id);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                  >
                    <Send className="h-4 w-4 inline mr-1.5" />
                    Mesaj Gönder
                  </button>
                </div>
              ))}
            </div>

            {filteredConnections.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">Henüz bağlantınız yok</p>
                <p className="text-sm text-slate-500 mt-1">Öneriler sekmesinden bağlantı kurmaya başlayın!</p>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
            
            {/* Conversations List */}
            <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Mesajlar</h3>
              
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 text-sm">Henüz mesaj yok</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.partnerId}
                      onClick={() => handleSelectConversation(conv.partnerId)}
                      className={`w-full text-left p-3 rounded-xl transition ${
                        selectedConversation === conv.partnerId
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'hover:bg-slate-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {conv.partnerAvatar ? (
                          <img src={conv.partnerAvatar} alt={conv.partnerName} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {conv.partnerName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-slate-900 text-sm truncate">{conv.partnerName}</p>
                            {conv.unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {conv.isLastMessageFromMe ? 'Sen: ' : ''}{conv.lastMessage}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{conv.lastMessageTime}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Window */}
            <div className="col-span-12 md:col-span-8 bg-white rounded-2xl border border-slate-200 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200">
                    {(() => {
                      const conv = conversations.find(c => c.partnerId === selectedConversation);
                      return conv ? (
                        <div className="flex items-center gap-3">
                          {conv.partnerAvatar ? (
                            <img src={conv.partnerAvatar} alt={conv.partnerName} className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                              {conv.partnerName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{conv.partnerName}</p>
                            <p className="text-xs text-slate-500">{conv.partnerTitle}</p>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {messages.map((msg) => {
                      const isMe = msg.fromUserId === currentUser.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                              {msg.createdAt}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-slate-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        disabled={isSendingMessage}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={isSendingMessage || !messageInput.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-semibold">Mesajlaşmaya başlayın</p>
                    <p className="text-sm text-slate-500 mt-1">Sol taraftan bir konuşma seçin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            
            {/* Network Stats */}
            {networkScore && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Network İstatistikleriniz</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="h-8 w-8 text-blue-600" />
                      <span className="text-2xl font-black text-blue-900">{networkScore.profileCompletionScore}</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-900">Profil Tamamlanma</p>
                    <p className="text-xs text-blue-700 mt-1">Maksimum 50 puan</p>
                    <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${(networkScore.profileCompletionScore / 50) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-8 w-8 text-emerald-600" />
                      <span className="text-2xl font-black text-emerald-900">{networkScore.connectionsScore}</span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-900">Bağlantı Skoru</p>
                    <p className="text-xs text-emerald-700 mt-1">{networkScore.totalConnections} bağlantı</p>
                    <div className="mt-2 h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full" 
                        style={{ width: `${(networkScore.connectionsScore / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <span className="text-2xl font-black text-purple-900">{networkScore.engagementScore}</span>
                    </div>
                    <p className="text-sm font-semibold text-purple-900">Etkileşim Skoru</p>
                    <p className="text-xs text-purple-700 mt-1">{networkScore.totalMessagesSent + networkScore.totalMessagesReceived} mesaj</p>
                    <div className="mt-2 h-2 bg-purple-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full" 
                        style={{ width: `${(networkScore.engagementScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Suggestions */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Bu Hafta Tanışman Gereken Kişiler</h3>
                  <p className="text-sm text-slate-600">Yapay zeka tarafından önerildi</p>
                </div>
              </div>

              <div className="space-y-3">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <div key={suggestion.user.id} className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setViewProfileUser(suggestion.user)}>
                      {suggestion.user.avatarUrl ? (
                        <img src={suggestion.user.avatarUrl} alt={suggestion.user.fullName} className="h-12 w-12 rounded-lg object-cover group-hover:opacity-90 transition" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold group-hover:opacity-90 transition">
                          {suggestion.user.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition">{suggestion.user.fullName}</p>
                        <p className="text-sm text-slate-600">{suggestion.user.title}</p>
                        <p className="text-xs text-purple-600 font-semibold mt-1">
                          🎯 {suggestion.matchScore}% eşleşme
                        </p>
                      </div>
                      <button
                        onClick={() => handleSendConnectionRequest(suggestion.user.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition"
                      >
                        Bağlan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Network Skorunuzu Artırın</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                    <Award className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Profilinizi Tamamlayın</p>
                    <p className="text-xs text-slate-600 mt-1">Üniversite, şirket, sektör ve bio bilgilerini ekleyin</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                  <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0">
                    <Users className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Daha Fazla Bağlantı Kurun</p>
                    <p className="text-xs text-slate-600 mt-1">Her yeni bağlantı 2 puan kazandırır</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="p-1.5 bg-purple-100 rounded-lg shrink-0">
                    <MessageCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Aktif Olun</p>
                    <p className="text-xs text-slate-600 mt-1">Bağlantılarınızla mesajlaşın, etkileşim skorunuz artsın</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {viewProfileUser && (
        <UserProfileModal user={viewProfileUser} onClose={() => setViewProfileUser(null)} />
      )}
    </div>
  );
};
