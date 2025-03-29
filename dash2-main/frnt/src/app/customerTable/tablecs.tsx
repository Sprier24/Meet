"use client";
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Edit, Trash2, Loader2, PlusCircle, SearchIcon, ChevronDownIcon, Printer, FileDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Selection } from "@heroui/react"
import axios from "axios";
import { format } from "date-fns"
import { Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Pagination, Tooltip, User } from "@heroui/react"
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Customer {
  _id: string;
  customerName: string;
  Location: string;
}

type SortDescriptor = {
  column: string;
  direction: 'ascending' | 'descending';
}

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
};

const columns = [
  { name: "CUSTOMER", uid: "customerName", sortable: true, width: "120px" },
  { name: "LOCATION", uid: "location", sortable: true, width: "120px" },
];

export default function CustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(columns.map(column => column.uid)));
  const [statusFilter, setStatusFilter] = React.useState<Selection>(new Set([]));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "certificateNo",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const router = useRouter();

  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/customers/getCustomer",
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      // Log the response structure
      console.log('Full API Response:', {
        status: response.status,
        data: response.data,
        type: typeof response.data,
        hasData: 'data' in response.data
      });

      // Handle the response based on its structure
      let customersData;
      if (typeof response.data === 'object' && 'data' in response.data) {
        // Response format: { data: [...customers] }
        customersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Response format: [...customers]
        customersData = response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format');
      }

      // Ensure customersData is an array
      if (!Array.isArray(customersData)) {
        customersData = [];
      }

      // Map the data with safe key generation
      const customersWithKeys = customersData.map((customer: Customer) => ({
        ...customer,
        key: customer._id || generateUniqueId()
      }));

      setCustomers(customersWithKeys);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching leads:", error);
      if (axios.isAxiosError(error)) {
        setError(`Failed to fetch leads: ${error.response?.data?.message || error.message}`);
      } else {
        setError("Failed to fetch leads.");
      }
      setCustomers([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const [filterValue, setFilterValue] = useState("");
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredCustomers = [...customers];

    if (hasSearchFilter) {
      filteredCustomers = filteredCustomers.filter((customer) =>
        customer.customerName.toLowerCase().includes(filterValue.toLowerCase()) ||
        customer.Location.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredCustomers;
  }, [customers, hasSearchFilter, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Customer];
      const second = b[sortDescriptor.column as keyof Customer];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[80%]" // Full width on small screens, 44% on larger screens
            placeholder="Search by name..."
            startContent={<SearchIcon className="h-4 w-10 text-muted-foreground" />}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            onClear={() => setFilterValue("")}
          />


        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {customers.length} customers</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent dark:bg-gray-800 outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              defaultValue="15"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    customers.length,
    onSearchChange,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">

        </span>
        <Pagination
          isCompact
          // showControls
          showShadow
          color="success"
          page={page}
          total={pages}
          onChange={setPage}
          classNames={{
            // base: "gap-2 rounded-2xl shadow-lg p-2 dark:bg-default-100",
            cursor: "bg-[hsl(339.92deg_91.04%_52.35%)] shadow-md",
            item: "data-[active=true]:bg-[hsl(339.92deg_91.04%_52.35%)] data-[active=true]:text-white rounded-lg",
          }}
        />

        <div className="rounded-lg bg-default-100 hover:bg-default-200 hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            className="bg-[hsl(339.92deg_91.04%_52.35%)]"
            variant="default"
            size="sm"
            disabled={pages === 1} // Use the `disabled` prop
            onClick={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            className="bg-[hsl(339.92deg_91.04%_52.35%)]"
            variant="default"
            size="sm"
            onClick={onNextPage} // Use `onClick` instead of `onPress`
          >
            Next
          </Button>

        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") {
      setSelectedKeys(new Set(customers.map(customer => customer._id)));
    } else {
      setSelectedKeys(keys as Set<string>);
    }
  };

  const handleVisibleColumnsChange = (keys: Selection) => {
    setVisibleColumns(keys);
  };

  const renderCell = React.useCallback((customer: Customer, columnKey: string): React.ReactNode => {
    const cellValue = customer[columnKey as keyof Customer];

    return cellValue;
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15 max-h-screen-xl max-w-screen-xl">
      <Table
        isHeaderSticky
        aria-label="Leads table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px] ower-flow-y-auto",
        }}
        selectedKeys={selectedKeys}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={handleSelectionChange}
        onSortChange={(descriptor) => {
          setSortDescriptor({
            column: descriptor.column as string,
            direction: descriptor.direction as "ascending" | "descending",
          });
        }}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No customer found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => <TableCell style={{ fontSize: "16px", padding: "8px" }}>{renderCell(item as Customer, columnKey as string)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

    </div>

  );
}
