const API_BASE_URL = "/api/contacts";

export async function fetchContacts() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch contacts");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addContact(contact) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    if (!response.ok) throw new Error("Failed to add contact");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
