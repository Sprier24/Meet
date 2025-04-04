"use client";

import { useState } from "react";
import axios from "axios";

interface CompanyRequest {
    firstName: string;
    middleName: string;
    lastName: string;
    contactNo: string;
    email: string;
    designation: string;
}

export default function ContactPersonForm() {
    const [formData, setFormData] = useState<CompanyRequest>({
        firstName: "",
        middleName: "",
        lastName: "",
        contactNo: "",
        email: "",
        designation: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post(
                "http://localhost:5000/api/v1/contactPersons/generateContactPerson",
                formData
            );
            setFormData({
                firstName: "",
                middleName: "",
                lastName: "",
                contactNo: "",
                email: "",
                designation: ""
            });
        } catch (err: any) {
            console.error('Error submitting form:', err);
            setError(err.response?.data?.error || "Failed to submit company details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <input
                        type="text"
                        name="firstName"
                        placeholder="Enter First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="middleName"
                        placeholder="Enter Middle Name"
                        value={formData.middleName}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Enter Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="contactNo"
                        placeholder="Enter Contact Number"
                        value={formData.contactNo}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <input
                        type="text"
                        name="email"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="designation"
                        placeholder="Enter Designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                </div>


                <button
                    type="submit"
                    className="bg-blue-950 hover:bg-blue-900 text-white p-2 rounded-md"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Submit Contact Person Detail"}
                </button>
            </form>

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}
