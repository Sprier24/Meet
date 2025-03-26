"use client"; 

import { useState } from "react";
import axios from "axios";

interface Observation {
  gas: string;
  before: string;
  after: string;
}

interface CertificateRequest {
  certificateNo: String,
  customerName: String,
  siteLocation: String,
  makeModel: String,
  range: String,
  serialNo: String,
  calibrationGas: String,
  gasCanisterDetails: String,
  dateOfCalibration: Date,
  calibrationDueDate: Date,
  observations: Observation[],
  engineerName: String
}

interface CertificateResponse {
  certificateId: string;
  message: string;
  downloadUrl: string;
}

export default function GenerateCertificate() {
  const [formData, setFormData] = useState<CertificateRequest>({
    customerName: "",
    siteLocation: "",
    makeModel: "",
    range: "",
    serialNo: "",
    calibrationGas: "",
    gasCanisterDetails: "",
    dateOfCalibration: new Date().toISOString().split('T')[0],
    calibrationDueDate: new Date().toISOString().split('T')[0],
    observations: [{ gas: "", before: "", after: "" }],
    engineerName: ""
  });
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    const updatedValue = e.target.type === "date"
      ? new Date(e.target.value).toISOString().split("T")[0]
      : value;

    let updatedObservations = formData.observations;

    if (name === "makeModel") {
      switch (value) {
        case "GT":
          updatedObservations = Array(4).fill({ gas: "", before: "", after: "" });
          break;
        case "PS200M1":
          updatedObservations = Array(2).fill({ gas: "", before: "", after: "" });
          break;
        case "PS200M2":
          updatedObservations = Array(3).fill({ gas: "", before: "", after: "" });
          break;
        case "PS200M3":
          updatedObservations = Array(4).fill({ gas: "", before: "", after: "" });
          break;
        case "IR700":
          updatedObservations = Array(2).fill({ gas: "", before: "", after: "" });
          break;
        case "Leak":
          updatedObservations = Array(3).fill({ gas: "", before: "", after: "" });
          break;
        case "GS700":
          updatedObservations = Array(5).fill({ gas: "", before: "", after: "" });
          break;
        default:
          updatedObservations = [{ gas: "", before: "", after: "" }];
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
      observations: updatedObservations,
    }));
  };

  const handleObservationChange = (index: number, field: keyof Observation, value: string) => {
    const updatedObservations = [...formData.observations];
    updatedObservations[index] = { ...updatedObservations[index], [field]: value };
    setFormData({ ...formData, observations: updatedObservations });
  };

  const addObservation = () => {
    if (formData.observations.length < 5) {
      setFormData({
        ...formData,
        observations: [...formData.observations, { gas: "", before: "", after: "" }]
      });
    }
  };

  const removeObservation = (index: number) => {
    const updatedObservations = [...formData.observations];
    updatedObservations.splice(index, 1);
    setFormData({ ...formData, observations: updatedObservations });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/certificates/generateCertificate",
        formData
      );
      setCertificate(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate?.downloadUrl) return;

    try {
      const response = await axios.get(
        `http://localhost:5000${certificate.downloadUrl}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download certificate. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Generate Your Certificate</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          name="siteLocation"
          placeholder="Enter Site Location"
          value={formData.siteLocation}
          onChange={handleChange}
          className="p-2 border rounded"

        />
        <select
          name="makeModel"
          value={formData.makeModel}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Select Make and Model</option>
          <option value="GT">GT</option>
          <option value="PS200M1">PS200M1</option>
          <option value="PS200M2">PS200M2</option>
          <option value="PS200M3">PS200M3</option>
          <option value="IR700">IR700</option>
          <option value="Leak">Leak Severe</option>
          <option value="GS700">GS700</option>
        </select>

        <input
          type="text"
          name="range"
          placeholder="Enter Range"
          value={formData.range}
          onChange={handleChange}
          className="p-2 border rounded"

        />
        <input
          type="text"
          name="serialNo"
          placeholder="Enter Serial Number"
          value={formData.serialNo}
          onChange={handleChange}
          className="p-2 border rounded"

        />
        <input
          type="text"
          name="calibrationGas"
          placeholder="Enter Calibration Gas"
          value={formData.calibrationGas}
          onChange={handleChange}
          className="p-2 border rounded"

        />
        <input
          type="text"
          name="gasCanisterDetails"
          placeholder="Enter Gas Canister Details"
          value={formData.gasCanisterDetails}
          onChange={handleChange}
          className="p-2 border rounded"

        />
        <input
          type="date"
          name="dateOfCalibration"
          placeholder="Enter Date of Calibration"
          value={formData.dateOfCalibration.toString().split('T')[0]}
          onChange={handleChange}
          className="p-2 border rounded"

        />
        <input
          type="date"
          name="calibrationDueDate"
          placeholder="Enter Calibration Due Date"
          value={formData.calibrationDueDate.toString().split('T')[0]}
          onChange={handleChange}
          className="p-2 border rounded"

        />
        <select
          name="engineerName"
          value={formData.engineerName}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Select Engineer Name</option>
          <option value="MR. Pintu Rathod">MR. Pintu Rathod</option>
          <option value="MR. Vivek">MR. Vivek</option>
        </select>

        <h2 className="text-lg font-bold mt-4">Observation Table</h2>
        <div className="flex justify-end mb-4">
          <button
            onClick={addObservation}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={formData.observations.length >= 5}
          >
            Add Observation
          </button>
        </div>
        <table className="table-auto border-collapse border border-gray-500 w-full">
          <thead>
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Gas</th>
              <th className="border p-2">Before Calibration</th>
              <th className="border p-2">After Calibration</th>
              <th className="border p-2">Remove</th>
            </tr>
          </thead>
          <tbody>
            {formData.observations.map((observation, index) => (
              <tr key={index}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">
                  <input
                    type="text"
                    name="gas"
                    value={observation.gas}
                    onChange={(e) => handleObservationChange(index, 'gas', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    name="before"
                    value={observation.before}
                    onChange={(e) => handleObservationChange(index, 'before', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    name="after"
                    value={observation.after}
                    onChange={(e) => handleObservationChange(index, 'after', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => removeObservation(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {formData.observations.length === 0 && (
              <tr>
                <td colSpan={5} className="border p-2 text-center text-gray-500">
                  No observations added yet. Click "Add Observation" to add one.
                </td>
              </tr>
            )}
            {formData.observations.length >= 5 && (
              <tr>
                <td colSpan={5} className="border p-2 text-center text-yellow-600">
                  Maximum limit of 5 observations reached.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Certificate"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {certificate && (
        <div className="mt-4 text-center">
          <p className="text-green-600 mb-2">{certificate.message}</p>
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Download Certificate
          </button>
        </div>
      )}
    </div>
  );
}

// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import * as z from "zod"
// import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { toast } from "@/hooks/use-toast"
// import { cn } from "@/lib/utils"
// import { format } from "date-fns"
// import { CalendarIcon, Loader2 } from "lucide-react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import axios from "axios";

// const formSchema = z.object({
//   customerName: z.string().min(2, { message: "Customer name is required" }),
//   siteLocation: z.string().min(2, { message: "Site location is required" }),
//   makeModel: z.string().min(1, { message: "Make/Model is required" }),
//   range: z.string().min(1, { message: "Range is required" }),
//   serialNo: z.string().min(1, { message: "Serial number is required" }),
//   calibrationGas: z.string().min(1, { message: "Calibration gas is required" }),
//   gasCanisterDetails: z.string().min(1, { message: "Gas canister details are required" }),
//   dateOfCalibration: z.date({ required_error: "Date of calibration is required" }),
//   calibrationDueDate: z.date({ required_error: "Calibration due date is required" }),
//   engineerName: z.string().min(1, { message: "Engineer name is required" }),
//   observations: z.array(z.object({
//     gas: z.string().min(1, { message: "Gas is required" }),
//     before: z.string().min(1, { message: "Before calibration value is required" }),
//     after: z.string().min(1, { message: "After calibration value is required" })
//   })).min(1, { message: "At least one observation is required" })
// })

// interface Observation {
//   gas: string;
//   before: string;
//   after: string;
// }

// interface CertificateRequest {
//   certificateNo: string;
//   customerName: string;
//   siteLocation: string;
//   makeModel: string;
//   range: string;
//   serialNo: string;
//   calibrationGas: string;
//   gasCanisterDetails: string;
//   dateOfCalibration: Date;
//   calibrationDueDate: Date;
//   observations: Observation[];
//   engineerName: string;
// }

// interface CertificateResponse {
//   certificateId: string;
//   message: string;
//   downloadUrl: string;
// }
// export default function CertificateNWForm() {
//   const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter()
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       customerName: "",
//       siteLocation: "",
//       makeModel: "",
//       range: "",
//       serialNo: "",
//       calibrationGas: "",
//       gasCanisterDetails: "",
//       dateOfCalibration: undefined,
//       calibrationDueDate: undefined,
//       engineerName: "",
//       observations: [{ gas: "", before: "", after: "" }]
//     },
//   })

//   const { watch, setValue, register } = form;
//   const formValues = watch();

//   const getDefaultObservations = (model: string): Observation[] => {
//     switch (model) {
//       case 'GT':
//         return [
//           { gas: "CO", before: "", after: "" },
//           { gas: "H2S", before: "", after: "" }
//         ];
//       case 'PS200M1':
//       case 'PS200M2':
//       case 'PS200M3':
//         return [
//           { gas: "O2", before: "", after: "" },
//           { gas: "LEL", before: "", after: "" },
//           { gas: "CO", before: "", after: "" },
//           { gas: "H2S", before: "", after: "" }
//         ];
//       case 'IR700':
//         return [
//           { gas: "CO2", before: "", after: "" }
//         ];
//       case 'Leak':
//         return [
//           { gas: "CH4", before: "", after: "" }
//         ];
//       case 'GS700':
//         return [
//           { gas: "H2S", before: "", after: "" }
//         ];
//       default:
//         return [{ gas: "", before: "", after: "" }];
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setValue(name as any, value);
//   };

//   const handleObservationChange = (index: number, field: keyof Observation, value: string) => {
//     const updatedObservations = [...formValues.observations];
//     updatedObservations[index] = { ...updatedObservations[index], [field]: value };
//     setValue('observations', updatedObservations);
//   };

//   const addObservation = () => {
//     const newObservation = { gas: "", before: "", after: "" };
//     setValue('observations', [...formValues.observations, newObservation]);
//   };

//   const removeObservation = (index: number) => {
//     const updatedObservations = [...formValues.observations];
//     updatedObservations.splice(index, 1);
//     setValue('observations', updatedObservations);
//   };

//   const handleDateChange = (field: 'dateOfCalibration' | 'calibrationDueDate', value: Date | undefined) => {
//     setValue(field, value);
//   };

//   const handleDownload = async () => {
//     if (!certificate?.downloadUrl) return;

//     try {
//       const response = await axios.get(
//         `http://localhost:5000${certificate.downloadUrl}`,
//         { responseType: 'blob' }
//       );

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `certificate-${certificate.certificateId}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       setError("Failed to download certificate. Please try again.");
//     }
//   };
  
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const formData = {
//       ...formValues,
//       dateOfCalibration: formValues.dateOfCalibration ? new Date(formValues.dateOfCalibration) : new Date(),
//       calibrationDueDate: formValues.calibrationDueDate ? new Date(formValues.calibrationDueDate) : new Date()
//     };

//     // Validate all required fields
//     const validationResult = formSchema.safeParse(formData);
//     if (!validationResult.success) {
//       setError("Please fill in all required fields");
//       setLoading(false);
//       toast({
//         title: "Validation Error",
//         description: "Please fill in all required fields",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/v1/certificates/generateCertificate",
//         formData
//       );
//       setCertificate(response.data);
//       toast({
//         title: "Success",
//         description: "Certificate generated successfully",
//       });
//     } catch (err: any) {
//       setError(err.response?.data?.error || "Failed to generate certificate. Please try again.");
//       toast({
//         title: "Error",
//         description: err.response?.data?.error || "Failed to generate certificate",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     } 
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//           <FormItem>
//             <FormLabel>Customer Name</FormLabel>
//             <FormControl>
//               <Input
//                 type="text"
//                 name="customerName"
//                 placeholder="Enter Customer Name"
//                 value={formValues.customerName}
//                 onChange={handleChange}
//               />
//             </FormControl>
//           </FormItem>
//           <FormItem>
//             <FormLabel>Site Location</FormLabel>
//             <FormControl>
//               <Input
//                 type="text"
//                 name="siteLocation"
//                 placeholder="Enter Site Location"
//                 value={formValues.siteLocation}
//                 onChange={handleChange}
//               />
//             </FormControl>
//           </FormItem>
//         </div>

//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//           <FormItem>
//             <FormLabel>Make & Model</FormLabel>
//             <FormControl>
//               <Select
//                 name="makeModel"
//                 value={formValues.makeModel}
//                 onValueChange={(value) => {
//                   setValue("makeModel", value);
//                   setValue("observations", getDefaultObservations(value));
//                 }}
//               >
//                 <SelectTrigger className="w-[300px]">
//                   <SelectValue placeholder="Select Make Model" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="GT">GT</SelectItem>
//                   <SelectItem value="PS200M1">PS200M1</SelectItem>
//                   <SelectItem value="PS200M2">PS200M2</SelectItem>
//                   <SelectItem value="PS200M3">PS200M3</SelectItem>
//                   <SelectItem value="IR700">IR700</SelectItem>
//                   <SelectItem value="Leak">Leak Severe</SelectItem>
//                   <SelectItem value="GS700">GS700</SelectItem>
//                 </SelectContent>
//               </Select>
//             </FormControl>
//           </FormItem>

//           <FormItem>
//             <FormLabel>Range</FormLabel>
//             <FormControl>
//               <Input
//                 type="text"
//                 name="range"
//                 placeholder="Enter Range"
//                 value={formValues.range}
//                 onChange={handleChange}
//               />
//             </FormControl>
//           </FormItem>
//         </div>

//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//           <FormItem>

//             <FormLabel>Serial No</FormLabel>
//             <FormControl>

//               <Input
//                 type="text"
//                 name="serialNo"
//                 placeholder="Ente Serial No"
//                 value={formValues.serialNo}
//                 onChange={handleChange}
//               />
//             </FormControl>
//           </FormItem>
//           <FormItem>

//             <FormLabel>Calibration Gas</FormLabel>
//             <FormControl>

//               <Input
//                 type="text"
//                 name="calibrationGas"
//                 placeholder="Enter Calibration Gas"
//                 value={formValues.calibrationGas}
//                 onChange={handleChange}
//               />
//             </FormControl>
//           </FormItem>
//         </div>
//         <FormItem>

//           <FormLabel>Gas Canister Details</FormLabel>
//           <FormControl>

//             <Input
//               type="text"
//               name="gasCanisterDetails"
//               placeholder="Enter Gas Canister Details"
//               value={formValues.gasCanisterDetails}
//               onChange={handleChange}
//             />
//           </FormControl>
//         </FormItem>
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//           <FormField
//             control={form.control}
//             name="dateOfCalibration"
//             render={({ field }) => (
//               <FormItem className="flex flex-col">
//                 <FormLabel>Date of Calibration</FormLabel>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <FormControl>
//                       <Button
//                         variant={"outline"}
//                         className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
//                       >
//                         {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                         <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                       </Button>
//                     </FormControl>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={field.value}
//                       onSelect={(date) => handleDateChange('dateOfCalibration', date)}
//                       disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="calibrationDueDate"
//             render={({ field }) => (
//               <FormItem className="flex flex-col">
//                 <FormLabel>Calibration Due Date</FormLabel>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <FormControl>
//                       <Button
//                         variant={"outline"}
//                         className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
//                       >
//                         {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                         <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                       </Button>
//                     </FormControl>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={field.value}
//                       onSelect={(date) => handleDateChange('calibrationDueDate', date)}
//                       disabled={(date) => date < new Date()}
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <FormItem>
//           <FormLabel>Engineer Name</FormLabel>
//           <FormControl>
//             <Select
//               name="engineerName"
//               value={formValues.engineerName}
//               onValueChange={(value) => setValue("engineerName", value)}
//             >
//               <SelectTrigger className="w-[625px]">
//                 <SelectValue placeholder="Select Engineer Name" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="MR. Pintu Rathod">MR. Pintu Rathod</SelectItem>
//                 <SelectItem value="MR. Vivek">MR. Vivek</SelectItem>

//               </SelectContent>
//             </Select>
//           </FormControl>
//         </FormItem>

//         <h2 className="text-lg font-bold mt-4">Observation Table</h2>
//         <div className="flex justify-end mb-4">
//           <button
//             onClick={addObservation}
//             className="bg-black-500 text-white px-4 py-2 border rounded hover:bg-gray-900"
//             disabled={formValues.observations.length >= 5 || formValues.makeModel !== ""}
//           >
//             Add Observation
//           </button>
//         </div>
//         <table className="table-auto border-collapse border border-gray-500 w-full">
//           <thead>
//             <tr>
//               <th className="border p-2">#</th>
//               <th className="border p-2">Gas</th>
//               <th className="border p-2">Before Calibration</th>
//               <th className="border p-2">After Calibration</th>
//               <th className="border p-2">Remove</th>
//             </tr>
//           </thead>
//           <tbody>
//             {formValues.observations.map((observation, index) => (
//               <tr key={index}>
//                 <td className="border p-2">{index + 1}</td>
//                 <td className="border p-2">
//                   <input
//                     type="text"
//                     name="gas"
//                     value={observation.gas}
//                     onChange={(e) => handleObservationChange(index, 'gas', e.target.value)}
//                     className="w-full p-1 border rounded"
//                     readOnly={formValues.makeModel !== ""}
//                   />
//                 </td>
//                 <td className="border p-2">
//                   <input
//                     type="text"
//                     name="before"
//                     value={observation.before}
//                     onChange={(e) => handleObservationChange(index, 'before', e.target.value)}
//                     className="w-full p-1 border rounded"
//                   />
//                 </td>
//                 <td className="border p-2">
//                   <input
//                     type="text"
//                     name="after"
//                     value={observation.after}
//                     onChange={(e) => handleObservationChange(index, 'after', e.target.value)}
//                     className="w-full p-1 border rounded"
//                   />
//                 </td>
//                 <td className="border p-2">
//                   <button
//                     onClick={() => removeObservation(index)}
//                     className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
//                     disabled={formValues.makeModel !== ""}
//                   >
//                     Remove
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {formValues.observations.length === 0 && (
//               <tr>
//                 <td colSpan={5} className="border p-2 text-center text-gray-500">
//                   No observations added yet. Click "Add Observation" to add one.
//                 </td>
//               </tr>
//             )}
//             {formValues.observations.length >= 5 && (
//               <tr>
//                 <td colSpan={5} className="border p-2 text-center text-yellow-600">
//                   Maximum limit of 5 observations reached.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>


//         <Button type="submit" className="w-full" disabled={isSubmitting}>
//           {isSubmitting ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Submitting...
//             </>
//           ) : (
//             "Submit Certificate"
//           )}
//         </Button>
//       </form>
//     </Form>
//   )
// }
