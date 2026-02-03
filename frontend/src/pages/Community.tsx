import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, MessageSquare, ThumbsUp, Clock } from "lucide-react";

interface Discussion {
  _id: string;
  title: string;
  content: string;
  author: { name: string };
  category: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  createdAt: string;
}

export default function Community() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRadius, setSelectedRadius] = useState("all");
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "safety-tips",
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
  }, [selectedCategory, selectedRadius]);

  const fetchDiscussions = async () => {
    try {
      const params: any = { sort: "recent" };
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      if (selectedRadius !== "all") {
        params.radius = selectedRadius;
      }
      const { data } = await api.get("/community/discussions", { params });
      setDiscussions(data.data || data);
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/community/discussions", formData);
      setFormData({ title: "", content: "", category: "safety-tips" });
      setShowNewDiscussion(false);
      fetchDiscussions();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create discussion");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Community Discussions
          </h1>
          <button
            onClick={() => setShowNewDiscussion(!showNewDiscussion)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Discussion</span>
          </button>
        </div>

        {/* New Discussion Form */}
        {showNewDiscussion && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Start a Discussion
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Title"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
              <textarea
                required
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="What's on your mind?"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewDiscussion(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Radius Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
                Distance:
              </label>
              <select
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {radiusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    selectedCategory === cat
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

        {/* Category Filter */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2" style={{display: 'none'}}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Discussions List */}
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div
              key={discussion._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {discussion.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {discussion.content}
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {discussion.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>by {discussion.author.name}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(discussion.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{discussion.upvotes - discussion.downvotes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{discussion.replyCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && discussions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              No discussions yet. Start one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
