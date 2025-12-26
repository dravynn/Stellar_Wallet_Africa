'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getContacts, addContact, removeContact, updateContact, type Contact } from '@/lib/contacts';

export default function Contacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', memo: '' });

  useEffect(() => {
    setContacts(getContacts());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      return;
    }
    addContact(formData);
    setContacts(getContacts());
    setFormData({ name: '', address: '', memo: '' });
    setShowAddForm(false);
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setFormData({ name: contact.name, address: contact.address, memo: contact.memo || '' });
    setShowAddForm(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateContact(editingId, formData);
      setContacts(getContacts());
      setFormData({ name: '', address: '', memo: '' });
      setShowAddForm(false);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      removeContact(id);
      setContacts(getContacts());
    }
  };

  const isValidStellarAddress = (address: string): boolean => {
    return address.startsWith('G') && address.length === 56;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-accent-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            Address Book
          </h1>
          <Link
            href="/home"
            className="px-4 py-2 bg-earth-100 text-earth-700 rounded-lg hover:bg-earth-200 font-semibold"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-earth-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-earth-800">Contacts</h2>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                setFormData({ name: '', address: '', memo: '' });
              }}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-semibold text-sm"
            >
              {showAddForm ? 'Cancel' : '+ Add Contact'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={editingId ? handleUpdate : handleAdd} className="mb-6 p-4 bg-earth-50 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="Contact name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none font-mono text-sm"
                  placeholder="G..."
                  required
                />
                {formData.address && !isValidStellarAddress(formData.address) && (
                  <p className="text-xs text-red-500 mt-1">Invalid Stellar address</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Memo (Optional)</label>
                <input
                  type="text"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-earth-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="Default memo"
                  maxLength={28}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold"
              >
                {editingId ? 'Update Contact' : 'Add Contact'}
              </button>
            </form>
          )}

          {contacts.length === 0 ? (
            <div className="text-center py-8 text-earth-500">
              <p>No contacts saved</p>
              <p className="text-sm mt-2">Add contacts for quick access when sending payments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 bg-earth-50 rounded-lg hover:bg-earth-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-earth-800">{contact.name}</p>
                    <p className="text-sm font-mono text-earth-600 break-all">{contact.address}</p>
                    {contact.memo && (
                      <p className="text-xs text-earth-500 mt-1">Memo: {contact.memo}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="px-3 py-1 bg-secondary-500 hover:bg-secondary-600 text-white rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

