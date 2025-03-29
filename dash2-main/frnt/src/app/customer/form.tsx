"use client";

import { useState } from "react";
import axios from "axios";

interface CustomerRequest {
  customerName: string;
  location: string;
}

interface CustomerResponse {
  _id: string;
  customerName: string;
  location: string;
}

export default function GenerateCustomer() {
  const [formData, setFormData] = useState<CustomerRequest>({
    customerName: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const updatedValue = e.target.type === "date"
      ? new Date(e.target.value).toISOString().split("T")[0]
      : value;

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue
    }));

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/customers/generateCustomer",
        formData
      );
      setCustomer(response.data);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.error || "Failed to generate customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* <h1 className="text-2xl font-bold mb-4">Generate Your Certificate</h1> */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <input
            type="text"
            name="customerName"
            placeholder="Enter Name"
            value={formData.customerName}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="location"
            placeholder="Enter Site Location"
            value={formData.location}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-950 hover:bg-blue-900 text-white p-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Customer"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

    </div>
  );
}
