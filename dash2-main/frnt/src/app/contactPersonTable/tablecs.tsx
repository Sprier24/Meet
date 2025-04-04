"use client";
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Selection, Pagination } from "@heroui/react"
import axios from "axios";

interface ContactPerson {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  contactNo: string;
  email: string;
  designation: string;
}

type SortDescriptor = {
  column: string;
  direction: 'ascending' | 'descending';
}


const generateUniqueId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const columns = [
  { name: "FIRST NAME", uid: "firstName", sortable: true, width: "120px" },
  { name: "MIDDLE NAME", uid: "middleName", sortable: true, width: "120px" },
  { name: "LAST NAME", uid: "lastName", sortable: true, width: "120px" },
  { name: "CONTACT NO", uid: "contactNo", sortable: true, width: "120px" },
  { name: "EMAIL", uid: "email", sortable: true, width: "120px" },
  { name: "DESIGNATION", uid: "designation", sortable: true, width: "120px"}

];
const INITIAL_VISIBLE_COLUMNS = ["firstName", "middleName", "lastName", "contactNo", "email", "designation"];

export default function ContactPersonTable() {
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(columns.map(column => column.uid)));
  const [statusFilter, setStatusFilter] = React.useState<Selection>(new Set([]));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "firstName",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);

  const fetchContactPersons = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/contactPersons/getContactPersons",
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      console.log('Full API Response:', {
        status: response.status,
        data: response.data,
        type: typeof response.data,
        hasData: 'data' in response.data
      });

      let contactPersonsData;
      if (typeof response.data === 'object' && 'data' in response.data) {
        contactPersonsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        contactPersonsData = response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format');
      }

      if (!Array.isArray(contactPersonsData)) {
        contactPersonsData = [];
      }

      const contactPersonsWithKeys = contactPersonsData.map((contactPerson: ContactPerson) => ({
        ...contactPerson,
        key: contactPerson._id || generateUniqueId()
      }));

      setContactPersons(contactPersonsWithKeys);
      setError(null);
    } catch (error) {
      console.error("Error fetching leads:", error);
      if (axios.isAxiosError(error)) {
        setError(`Failed to fetch leads: ${error.response?.data?.message || error.message}`);
      } else {
        setError("Failed to fetch leads.");
      }
      setContactPersons([]);
    }
  };

  useEffect(() => {
    fetchContactPersons();
  }, []);

  const [filterValue, setFilterValue] = useState("");
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredContactPersons = [...contactPersons];

    if (hasSearchFilter) {
      filteredContactPersons = filteredContactPersons.filter((contactPerson) =>
        contactPerson.firstName.toLowerCase().includes(filterValue.toLowerCase()) ||
        contactPerson.middleName.toLowerCase().includes(filterValue.toLowerCase()) ||
        contactPerson.lastName.toLowerCase().includes(filterValue.toLowerCase()) ||
        contactPerson.contactNo.toLowerCase().includes(filterValue.toLowerCase()) ||
        contactPerson.email.toLowerCase().includes(filterValue.toLowerCase()) ||
        contactPerson.designation.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredContactPersons;
  }, [contactPersons, hasSearchFilter, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof ContactPerson];
      const second = b[sortDescriptor.column as keyof ContactPerson];
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
            className="w-full sm:max-w-[80%]"
            placeholder="Search by name..."
            startContent={<SearchIcon className="h-4 w-10 text-muted-foreground" />}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            onClear={() => setFilterValue("")}
          />

        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {contactPersons.length} Contact Person</span>
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
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    contactPersons.length,
    onSearchChange,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">

        </span>
        <Pagination
          isCompact
          showShadow
          color="success"
          page={page}
          total={pages}
          onChange={setPage}
          classNames={{
            cursor: "bg-[hsl(339.92deg_91.04%_52.35%)] shadow-md",
            item: "data-[active=true]:bg-[hsl(339.92deg_91.04%_52.35%)] data-[active=true]:text-white rounded-lg",
          }}
        />

        <div className="rounded-lg bg-default-100 hover:bg-default-200 hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            className="bg-[hsl(339.92deg_91.04%_52.35%)]"
            variant="default"
            size="sm"
            disabled={pages === 1}
            onClick={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            className="bg-[hsl(339.92deg_91.04%_52.35%)]"
            variant="default"
            size="sm"
            onClick={onNextPage}
            disabled={pages === 1}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") {
      setSelectedKeys(new Set(contactPersons.map(contactPerson => contactPerson._id)));
    } else {
      setSelectedKeys(keys as Set<string>);
    }
  };

  const handleVisibleColumnsChange = (keys: Selection) => {
    setVisibleColumns(keys);
  };

  const renderCell = React.useCallback((contactPerson: ContactPerson, columnKey: keyof ContactPerson): React.ReactNode => {
    const cellValue = contactPerson[columnKey];

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
        <TableBody emptyContent={"No contact person found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => <TableCell style={{ fontSize: "12px", padding: "8px" }}>{renderCell(item as ContactPerson, columnKey as keyof ContactPerson)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
