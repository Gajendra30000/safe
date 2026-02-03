import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Trash2, User, Phone, Mail } from "lucide-react";

interface Contact {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
}

export default function Favorites() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "",
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data } = await api.get("/favorites");
      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/favorites", formData);
      setFormData({ name: "", phone: "", email: "", relationship: "" });
      setIsAdding(false);
      fetchContacts();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add contact");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await api.delete(`/favorites/${id}`);
      fetchContacts();
    } catch (error) {
      alert("Failed to delete contact");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Emergency Contacts
          </h1>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Add Contact Form */}
        {isAdding && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Add New Contact
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Name"
                  className="px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-700 text-white"
                />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Phone Number"
                  className="px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-700 text-white"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Email (optional)"
                  className="px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-700 text-white"
                />
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) =>
                    setFormData({ ...formData, relationship: e.target.value })
                  }
                  placeholder="Relationship (optional)"
                  className="px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-700 text-white"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  Add Contact
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contacts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className="bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {contact.name}
                    </h3>
                    {contact.relationship && (
                      <p className="text-sm text-gray-400">
                        {contact.relationship}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(contact._id)}
                  className="p-2 text-red-600 hover:bg-red-900/20 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </div>
                {contact.email && (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{contact.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {contacts.length === 0 && !isAdding && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              No emergency contacts yet. Add one to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
