"use client";

import { useState } from "react";
import axios from "axios";

interface CompanyRequest {
    companyName: string;
    address: string;
    gstNumber: string;
    industries: string;
    website: string;
    industriesType: string;
    flag: string;
}

export default function CompanyForm() {
    const [formData, setFormData] = useState<CompanyRequest>({
        companyName: "",
        address: "",
        gstNumber: "",
        industries: "",
        website: "",
        industriesType: "",
        flag: ""
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
                "http://localhost:5000/api/v1/companies/generateCompany",
                formData
            );
            // Reset form after successful submission
            setFormData({
                companyName: "",
                address: "",
                gstNumber: "",
                industries: "",
                website: "",
                industriesType: "",
                flag: ""
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
                        name="companyName"
                        placeholder="Enter Company Name"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="Enter Address"
                        value={formData.address}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <input
                        type="text"
                        name="gstNumber"
                        placeholder="Enter GST Number"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="industries"
                        placeholder="Enter Industries"
                        value={formData.industries}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <input
                        type="text"
                        name="website"
                        placeholder="Enter Website"
                        value={formData.website}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="industriesType"
                        placeholder="Enter Industries Type"
                        value={formData.industriesType}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <input
                        type="text"
                        name="flag"
                        placeholder="Enter Flag"
                        value={formData.flag}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-950 hover:bg-blue-900 text-white p-2 rounded-md"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Submit Company Detail"}
                </button>
            </form>

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}
