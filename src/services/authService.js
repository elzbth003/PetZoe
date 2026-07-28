// Mock Authentication Service using localStorage

const DEFAULT_USERS = [
  {
    name: "Dr. Sarah Jenkins",
    email: "vet@pawnexus.com",
    password: "Password123!",
    phone: "9876543210",
    role: "Veterinarian"
  },
  {
    name: "Alex Carter",
    email: "owner@pawnexus.com",
    password: "Password123!",
    phone: "9876543211",
    role: "Pet Owner"
  }
];

// Initialize mock DB
const initializeDB = () => {
  if (!localStorage.getItem('pawnexus_users')) {
    localStorage.setItem('pawnexus_users', JSON.stringify(DEFAULT_USERS));
  }
};

initializeDB();

export const authService = {
  // Register user
  register: async (userData) => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = JSON.parse(localStorage.getItem('pawnexus_users') || '[]');
    
    // Check if user already exists
    const exists = users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      throw new Error("An account with this email address already exists.");
    }

    // Save new user
    const newUser = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role
    };

    users.push(newUser);
    localStorage.setItem('pawnexus_users', JSON.stringify(users));
    return newUser;
  },

  // Login user
  login: async (email, password) => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const users = JSON.parse(localStorage.getItem('pawnexus_users') || '[]');
    
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error("Invalid email address or password.");
    }

    // Save current session
    const sessionUser = { name: user.name, email: user.email, role: user.role };
    localStorage.setItem('pawnexus_current_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('pawnexus_current_user');
  },

  // Get current user session
  getCurrentUser: () => {
    const session = localStorage.getItem('pawnexus_current_user');
    return session ? JSON.parse(session) : null;
  }
};
