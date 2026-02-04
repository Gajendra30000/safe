import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import toast from 'react-hot-toast';
import { Plus, MessageSquare, Image as ImageIcon, X, Send, Heart } from "lucide-react";
import { useLocation } from "../contexts/LocationContext";
import { useAuth } from "../contexts/AuthContext";

interface Discussion {
  _id: string;
  title: string;
  content: string;
  author: { _id: string; name: string };
  category: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  createdAt: string;
  imageUrl?: string;
}

interface Reply {
  _id: string;
  content: string;
  author: { _id: string; name: string };
  createdAt: string;
}

export default function Community() {
  const { location } = useLocation();
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRadius, setSelectedRadius] = useState("all");
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isRepliesLoading, setIsRepliesLoading] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedDiscussion) {
      scrollToBottom();
    }
  }, [replies, selectedDiscussion]);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
  });

  const categories = [
    "all",
    "safety-tips",
    "housing-rent",
    "recommendations",
    "general",
  ];

  const radiusOptions = [
    { value: "all", label: "All Locations" },
    { value: "1", label: "1 km" },
    { value: "5", label: "5 km" },
    { value: "10", label: "10 km" },
    { value: "25", label: "25 km" },
  ];

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory, selectedRadius, location]);

  useEffect(() => {
    if (discussions.length > 0 && user) {
      fetchUserVotes();
    }
  }, [discussions, user]);

  const fetchDiscussions = async () => {
    try {
      const params: any = { sort: "recent" };
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (selectedRadius !== "all" && location) {
        params.radius = selectedRadius;
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      }

      const { data } = await api.get("/community/discussions", { params });
      setDiscussions(data.data || data);
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const targetIds = discussions.map(d => d._id).join(',');
      const { data } = await api.get("/community/votes", {
        params: { targetIds, targetType: 'discussion' }
      });
      setUserVotes(data.data || {});
    } catch (error) {
      console.error("Failed to fetch user votes:", error);
    }
  };

  const fetchReplies = async (discussionId: string) => {
    setIsRepliesLoading(true);
    try {
      const { data } = await api.get(`/community/discussions/${discussionId}/replies`);
      setReplies(data.data || []);
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    } finally {
      setIsRepliesLoading(false);
    }
  };

  const handleVote = async (e: React.MouseEvent, targetId: string, targetType: 'discussion' | 'reply') => {
    e.stopPropagation();
    try {

      const { data } = await api.post("/community/vote", {
        targetId,
        targetType,
        voteType: 'upvote' // Only upvote like telegram
      });

      if (data.success) {
        // Update local state
        setUserVotes(prev => ({
          ...prev,
          [targetId]: data.data.action === 'removed' ? '' : 'upvote'
        }));

        // Refresh discussions to update counts
        fetchDiscussions();
        if (selectedDiscussion && selectedDiscussion._id === targetId) {
          const updatedDisc = discussions.find(d => d._id === targetId);
          if (updatedDisc) setSelectedDiscussion(updatedDisc);
        }
      }
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedDiscussion) return;

    try {
      const { data } = await api.post(`/community/discussions/${selectedDiscussion._id}/replies`, {
        content: replyText
      });
      setReplies(prev => [...prev, data.data]);
      setReplyText("");
      // Update reply count locally
      setDiscussions(prev => prev.map(d =>
        d._id === selectedDiscussion._id ? { ...d, replyCount: d.replyCount + 1 } : d
      ));
    } catch (error) {
      toast.error("Failed to post reply");
    }
  };

  const openDiscussion = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    fetchReplies(discussion._id);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const payload: any = { ...formData };

      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', selectedImage);
        const { data: uploadData } = await api.post('/upload/image', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadData.url) payload.imageUrl = uploadData.url;
      }

      if (location) {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
      }

      await api.post("/community/discussions", payload);
      setFormData({ title: "", content: "", category: "general" });
      setSelectedImage(null);
      setImagePreview(null);
      setShowNewDiscussion(false);
      toast.success('Discussion created successfully! 🎉');
      fetchDiscussions();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create discussion";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.getHours().toString().padStart(2, '0') + ':' +
      date.getMinutes().toString().padStart(2, '0');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Community Help
          </h1>
          <button
            onClick={() => setShowNewDiscussion(!showNewDiscussion)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Discussion</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-300 whitespace-nowrap">Distance:</label>
              <select
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {radiusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${selectedCategory === cat
                    ? "bg-primary text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                >
                  {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* New Discussion Form */}
        {showNewDiscussion && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-primary/20 animate-in slide-in-from-top duration-300">
            <h2 className="text-xl font-bold text-white mb-4">Start a Discussion</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text" required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title"
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary outline-none"
              />
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary outline-none"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary outline-none"
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Add Image (Optional)</label>
                {imagePreview ? (
                  <div className="relative group">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-700 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-400">Click to upload image</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }} />
                  </label>
                )}
              </div>

              <div className="flex space-x-3">
                <button type="submit" disabled={uploading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
                  {uploading ? 'Posting...' : 'Post'}
                </button>
                <button type="button" onClick={() => setShowNewDiscussion(false)} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Discussions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discussions.map((discussion) => (
            <div
              key={discussion._id}
              onClick={() => openDiscussion(discussion)}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:border-primary/50 transition cursor-pointer group flex flex-col h-full"
            >
              {discussion.imageUrl && (
                <div className="relative h-48 overflow-hidden">
                  <img src={discussion.imageUrl} alt={discussion.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-xs text-white uppercase tracking-wider">
                    {discussion.category.replace('-', ' ')}
                  </div>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-primary transition">{discussion.title}</h3>
                </div>
                {!discussion.imageUrl && (
                  <div className="px-2 py-1 bg-gray-700 rounded self-start text-xs text-gray-300 uppercase tracking-wider mb-3">
                    {discussion.category.replace('-', ' ')}
                  </div>
                )}
                <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">{discussion.content}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700 mt-auto">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                      {discussion.author.name.charAt(0)}
                    </div>
                    <span>{discussion.author.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => handleVote(e, discussion._id, 'discussion')}
                      className={`flex items-center space-x-1 transition ${userVotes[discussion._id] === 'upvote' ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                    >
                      <Heart className={`w-4 h-4 ${userVotes[discussion._id] === 'upvote' ? 'fill-current' : ''}`} />
                      <span className="text-xs font-semibold">{discussion.upvotes}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-semibold">{discussion.replyCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && discussions.length === 0 && (
          <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <MessageSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No discussions found. Be the first to start one!</p>
          </div>
        )}
      </div>

      {/* Discussion Detail Sidebar/Overlay (Telegram Style) */}
      {selectedDiscussion && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDiscussion(null)} />
          <div className="relative w-full max-w-lg bg-gray-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  {selectedDiscussion.author.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-bold leading-none">{selectedDiscussion.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{selectedDiscussion.replyCount} replies</p>
                </div>
              </div>
              <button onClick={() => setSelectedDiscussion(null)} className="p-2 text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content & Replies Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-900/50">
              {/* Main Discussion Post */}
              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                <p className="text-white text-sm whitespace-pre-wrap">{selectedDiscussion.content}</p>
                {selectedDiscussion.imageUrl && (
                  <img src={selectedDiscussion.imageUrl} alt="Attached" className="mt-3 rounded-lg w-full max-h-60 object-cover" />
                )}
                <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center text-[10px] text-gray-500 uppercase">
                  <span>{selectedDiscussion.category.replace('-', ' ')}</span>
                  <span>{new Date(selectedDiscussion.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="divider text-center border-b border-gray-700 relative">
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-gray-900 px-3 text-xs text-gray-500">Replies</span>
              </div>

              {/* Replies (Telegram Style) */}
              <div className="space-y-4 pt-2">
                {isRepliesLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                  </div>
                ) : replies.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">No replies yet. Start the conversation!</p>
                ) : (
                  replies.map((reply) => {
                    const replyAuthorId = typeof reply.author === 'string' ? reply.author : (reply.author._id || (reply.author as any).id);
                    const currentUserId = user?._id || (user as any)?.id;
                    const isOwnMessage = currentUserId && replyAuthorId && replyAuthorId.toString() === currentUserId.toString();

                    return (
                      <div key={reply._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 relative ${isOwnMessage
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                          }`}>
                          {!isOwnMessage && (
                            <p className="text-[10px] text-primary font-bold mb-1">{reply.author.name}</p>
                          )}
                          <p className="text-sm">{reply.content}</p>
                          <div className={`text-[9px] mt-1 flex ${isOwnMessage ? 'justify-end' : 'justify-end'} opacity-70`}>
                            {formatTime(reply.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={repliesEndRef} />
              </div>
            </div>

            {/* Reply Input (Sticky at bottom) */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <form onSubmit={handleReply} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

