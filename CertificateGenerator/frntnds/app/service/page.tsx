"use client"; // Required for useState & useEffect in App Router

import { useState } from "react";
import axios from "axios";

interface EngineerRemarks {
  serviceSpares: string;
  partNo: string;
  rate: string;
  quantity: string;
  poNo: string;
}

interface ServiceRequest {
  nameAndLocation: string;
  contactPerson: string;
  contactNumber: string;
  serviceEngineer: string;
  date: string;
  place: string;
  placeOptions: string;
  natureOfJob: string;
  reportNo: string;
  makeModelNumberoftheInstrumentQuantity: string;
  serialNumberoftheInstrumentCalibratedOK: string;
  serialNumberoftheFaultyNonWorkingInstruments: string;
  engineerRemarks: EngineerRemarks[];
  engineerName: string;
}

interface ServiceResponse {
  serviceId: string;
  message: string;
  downloadUrl: string;
}

export default function ServiceCertificate() {
  const [formData, setFormData] = useState<ServiceRequest>({
    nameAndLocation: "",
    contactPerson: "",
    contactNumber: "",
    serviceEngineer: "",
    date: new Date().toISOString().split('T')[0],
    place: "",
    placeOptions: "At Site", // Default value
    natureOfJob: "AMC",
    reportNo: "",
    makeModelNumberoftheInstrumentQuantity: "",
    serialNumberoftheInstrumentCalibratedOK: "",
    serialNumberoftheFaultyNonWorkingInstruments: "",
    engineerRemarks: [{ serviceSpares: "", partNo: "", rate: "", quantity: "", poNo: "" }],
    engineerName: "",
  });
  const [service, setService] = useState<ServiceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    const updatedValue = e.target.type === "date"
      ? new Date(e.target.value).toISOString().split("T")[0]
      : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
  };

  const handleengineerRemarksChange = (index: number, field: keyof EngineerRemarks, value: string) => {
    const updatedengineerRemarks = [...formData.engineerRemarks];
    updatedengineerRemarks[index] = { ...updatedengineerRemarks[index], [field]: value };
    setFormData({ ...formData, engineerRemarks: updatedengineerRemarks });
  };

  const addengineerRemarks = () => {
    if (formData.engineerRemarks.length < 10) {
      setFormData({
        ...formData,
        engineerRemarks: [...formData.engineerRemarks, { serviceSpares: "", partNo: "", rate: "", quantity: "", poNo: "" }]
      });
    }
  };

  const removeengineerRemarks = (index: number) => {
    const updatedengineerRemarks = [...formData.engineerRemarks];
    updatedengineerRemarks.splice(index, 1);
    setFormData({ ...formData, engineerRemarks: updatedengineerRemarks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate engineer remarks
    const invalidRemarks = formData.engineerRemarks.some(remark => {
      return !remark.serviceSpares ||
        !remark.partNo || remark.partNo === '-' ||
        !remark.rate ||
        !remark.quantity || isNaN(Number(remark.quantity)) ||
        !remark.poNo;
    });

    if (invalidRemarks) {
      setError("Please fill all engineer remarks fields correctly. Quantity must be a number.");
      setLoading(false);
      return;
    }

    // Validate required fields
    const requiredFields = [
      'nameAndLocation',
      'contactPerson',
      'contactNumber',
      'serviceEngineer',
      'date',
      'place',
      'placeOptions',
      'natureOfJob',
      'reportNo',
      'makeModelNumberoftheInstrumentQuantity',
      'serialNumberoftheInstrumentCalibratedOK',
      'serialNumberoftheFaultyNonWorkingInstruments',
      'engineerName'
    ];

    const emptyFields = requiredFields.filter(field => !formData[field as keyof ServiceRequest]);

    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/services/generateService",
        {
          ...formData,
          engineerRemarks: formData.engineerRemarks.map(remark => ({
            ...remark,
            quantity: String(Number(remark.quantity)) // Ensure quantity is a valid number string
          }))
        }
      );
      setService(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate service report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!service?.downloadUrl) return;

    try {
      const response = await axios.get(
        `http://localhost:5000${service.downloadUrl}`,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf'
          }
        }
      );

      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `service-${service.serviceId}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      setError(null);
    } catch (err: any) {
      console.error("Download error:", err);
      setError(err.response?.data?.error || "Failed to download service report. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-2xl p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">Service Report Generator</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="nameAndLocation"
            placeholder="Name and Location"
            value={formData.nameAndLocation}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="contactPerson"
            placeholder="Contact Person"
            value={formData.contactPerson}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="contactNumber"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="serviceEngineer"
            placeholder="Service Engineer"
            value={formData.serviceEngineer}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="place"
            placeholder="Enter Place"
            value={formData.place}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center gap-4 p-2 border rounded">
            <label className="font-medium text-gray-700">Place:</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="placeOptions"
                  value="At Site"
                  checked={formData.placeOptions === "At Site"}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">At Site</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="placeOptions"
                  value="In House"
                  checked={formData.placeOptions === "In House"}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">In House</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 border rounded">
            <label className="font-medium text-gray-700">Nature of Job:</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="natureOfJob"
                  value="AMC"
                  checked={formData.natureOfJob === "AMC"}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">AMC</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="natureOfJob"
                  value="Charged"
                  checked={formData.natureOfJob === "Charged"}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Charged</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="natureOfJob"
                  value="Warranty"
                  checked={formData.natureOfJob === "Warranty"}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Warranty</span>
              </label>
            </div>
          </div>


          <input
            type="text"
            name="reportNo"
            placeholder="Report Number"
            value={formData.reportNo}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-4">
          <textarea
            name="makeModelNumberoftheInstrumentQuantity"
            placeholder="Make & Model Number of the Instrument Quantity"
            value={formData.makeModelNumberoftheInstrumentQuantity}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            name="serialNumberoftheInstrumentCalibratedOK"
            placeholder="Serial Number of the Instrument Calibrated & OK"
            value={formData.serialNumberoftheInstrumentCalibratedOK}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            name="serialNumberoftheFaultyNonWorkingInstruments"
            placeholder="Serial Number of Faulty/Non-Working Instruments"
            value={formData.serialNumberoftheFaultyNonWorkingInstruments}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Engineer Remarks</h2>
          {formData.engineerRemarks.map((remark, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded">
              <input
                type="text"
                placeholder="Service/Spares"
                value={remark.serviceSpares}
                onChange={(e) => handleengineerRemarksChange(index, 'serviceSpares', e.target.value)}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Part No."
                value={remark.partNo}
                onChange={(e) => handleengineerRemarksChange(index, 'partNo', e.target.value)}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Rate"
                value={remark.rate}
                onChange={(e) => handleengineerRemarksChange(index, 'rate', e.target.value)}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={remark.quantity}
                onChange={(e) => handleengineerRemarksChange(index, 'quantity', e.target.value)}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="PO No."
                value={remark.poNo}
                onChange={(e) => handleengineerRemarksChange(index, 'poNo', e.target.value)}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeengineerRemarks(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {formData.engineerRemarks.length < 10 && (
            <button
              type="button"
              onClick={addengineerRemarks}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Add Engineer Remark
            </button>
          )}
        </div>

        <select
          name="engineerName"
          value={formData.engineerName}
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Engineer Name</option>
          <option value="MR. Pintu Rathod">MR. Pintu Rathod</option>
          <option value="MR. Vivek">MR. Vivek</option>
        </select>

        <div className="flex gap-4 justify-end mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
          >
            {loading ? 'Generating...' : 'Generate Service Report'}
          </button>

          {service && (
            <button
              type="button"
              onClick={handleDownload}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Download PDF
            </button>
          )}
        </div>
      </form>

      {service && (
        <div className="mt-4 text-center">
          <p className="text-green-600 mb-2">{service.message}</p>
        </div>
      )}
    </div>
  );
}
