import React, { useState, useEffect } from "react";
import ContactList from "./components/ContactList";
import AddContactForm from "./components/AddContactForm";
import { fetchContacts, addContact } from "./services/api";

function App() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const loadContacts = async () => {
      const data = await fetchContacts();
      setContacts(data);
    };
    loadContacts();
  }, []);

  const handleAddContact = async (contact) => {
    const newContact = await addContact(contact);
    setContacts((prevContacts) => [...prevContacts, newContact]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Contact Manager</h1>
      <AddContactForm onAddContact={handleAddContact} />
      <ContactList contacts={contacts} />
    </div>
  );
}

export default App;
