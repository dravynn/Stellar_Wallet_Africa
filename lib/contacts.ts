const CONTACTS_KEY = 'stellar_contacts';

export interface Contact {
  id: string;
  name: string;
  address: string;
  memo?: string;
}

export function getContacts(): Contact[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CONTACTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addContact(contact: Omit<Contact, 'id'>): void {
  if (typeof window === 'undefined') return;
  const contacts = getContacts();
  const newContact: Contact = {
    ...contact,
    id: Date.now().toString(),
  };
  contacts.push(newContact);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

export function removeContact(id: string): void {
  if (typeof window === 'undefined') return;
  const contacts = getContacts();
  const filtered = contacts.filter(c => c.id !== id);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(filtered));
}

export function updateContact(id: string, updates: Partial<Contact>): void {
  if (typeof window === 'undefined') return;
  const contacts = getContacts();
  const updated = contacts.map(c => c.id === id ? { ...c, ...updates } : c);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
}

