const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5010/api";

export const api = {
  async getRides() {
    const response = await fetch(`${API_BASE_URL}/rides`);

    if (!response.ok) {
      throw new Error("Failed to load rides");
    }

    return response.json();
  },

  async getAccommodations() {
    const response = await fetch(`${API_BASE_URL}/accommodations`);

    if (!response.ok) {
      throw new Error("Failed to load accommodations");
    }

    return response.json();
  },
};
