const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5010/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  async getRides() {
    return request("/rides");
  },

  async getAccommodations() {
    return request("/accommodations");
  },

  async registerUser(userDetails) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userDetails),
    });
  },

  async loginUser(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async getCurrentUser(token) {
    return request("/auth/me", {
      method: "GET",
      token,
    });
  },

  async getProfile(token) {
    return request("/profile/me", {
      method: "GET",
      token,
    });
  },
};
