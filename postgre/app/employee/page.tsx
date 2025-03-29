
import Link from "next/link";
import { getEmployeelist } from "@/lib/action";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/delete";
// import { DeleteButton } from "@/components/delete";

//const Employee = async () => {
const Employee = async ({
    query
}: {
    query: string;
}) => {
    const employees = await getEmployeelist(query);
    return (
        <div className="w-screen py-20 flex justify-center flex-col items-center">
            <div className="flex items-center justify-between gap-1 mb-5">
                <h1 className="text-4xl font-bold">Postgres Intigration</h1>
            </div>
            <div className="overflow-x-auto">
                <div className="mb-2 w-full text-right">
                    <Link
                        href="/employee/create"
                        className="btn btn-primary">
                        Create
                    </Link>
                </div>
                <table className="table table-zebra">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="py-3 px-6">#</th>
                            <th className="py-3 px-6">Name</th>
                            <th className="py-3 px-6">Email</th>
                            <th className="py-3 px-6">Phone Number</th>
                            <th className="py-3 px-6">Created At</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((rs, index) => (
                            <tr key={rs.id} className="border-b">
                                <td className="py-3 px-6">{index + 1}</td>
                                <td className="py-3 px-6">{rs.name}</td>
                                <td className="py-3 px-6">{rs.email}</td>
                                <td className="py-3 px-6">{rs.phone}</td>
                                <td className="py-3 px-6">
                                    {formatDate(rs.createdAt.toString())}
                                </td>
                                <td className="flex justify-center gap-1 py-3">
                                    <Link
                                        href={`/employee/edit/${rs.id}`}
                                        className="btn btn-info"
                                    >
                                        Edit
                                    </Link>
                                    <DeleteButton id={rs.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Employee;