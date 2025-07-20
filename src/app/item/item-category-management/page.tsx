"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  ChevronDown,
  ChevronUp,
  FilePenLine,
  ScanEye,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSessionData } from "@/utils/session";
import { postLoginRequest } from "@/services/api.service";
import { IFilter, ICategory, IAddCategory } from "@/types";
import {
  ADD,
  DELETE,
  FILTERLIST,
  REFDATA,
  UPDATE,
  VIEW,
} from "@/utils/apiMessage";
import { showErrorAlert, showSuccessAlert } from "@/utils/alert";
import Swal from "sweetalert2";
import withAuth from "@/utils/withAuth";

function Category() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryList, setCategoryList] = useState<ICategory[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [size] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // task filter state

  const [role, setRole] = useState<IFilter>({
    page: 0,
    size: size,
    sortColumn: "lastModifiedDate",
    sortDirection: "DESC",
    search: {
      code: "",
      description: "",
      status: "",
    },
  });

  // Privileges and defaultStatus state
  const [privileges, setPrivileges] = useState({
    add: false,
    update: false,
    view: false,
    search: false,
    delete: false,
    userRolePrivilegeAssign: false,
  });

  const [defaultStatus, setDefaultStatus] = useState<
    { code: string; description: string }[]
  >([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState<IAddCategory>({
    code: "",
    description: "",
    status: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCategory((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getSessionData("accessToken") || "";
      const userProfile = getSessionData("userProfile");
      const response = await postLoginRequest(
        "api/v1/item-category/add",
        {
          ...newCategory,
        },
        ADD,
        token,
        userProfile?.username,
      );

      if (response.success) {
        showSuccessAlert(
          "Success",
          response.message || "Category created successfully",
        );
        setShowAddModal(false);
        // Reset form fields
        setNewCategory({
          code: "",
          description: "",
          status: "",
        });
        fetchCategory();
      } else {
        showErrorAlert(
          "Category Create Failed",
          response.message || "Something went wrong!",
        );
      }
    } catch (err) {
      console.error("Error calling API:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic

  const handlePageChange = (newPage: number) => {
    setRole((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (role.page > 0) {
      const newPage = role.page - 1;
      setCurrentPage(newPage);
      setRole({ ...role, page: newPage });
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRecords / size);
    if (role.page < totalPages - 1) {
      const newPage = role.page + 1;
      setCurrentPage(newPage);
      setRole({ ...role, page: newPage });
    }
  };

  // sorting logic

  const handleSort = (column: string) => {
    setRole((prev) => ({
      ...prev,
      sortColumn: column,
      sortDirection:
        prev.sortColumn === column && prev.sortDirection === "ASC"
          ? "DESC"
          : "ASC",
    }));
  };

  // Pagination logic

  const renderSortIcons = (column: string) => {
    const isActive = role.sortColumn === column;
    const direction = role.sortDirection;

    return (
      <span className="ml-1 inline-block">
        <span
          className={`block ${
            isActive && direction === "ASC" ? "text-black" : "text-gray-400"
          }`}
        >
          <ChevronUp className="h-3 w-3 text-black" />
        </span>
        <span
          className={`block ${
            isActive && direction === "DESC" ? "text-black" : "text-gray-400"
          } -mt-1`}
        >
          <ChevronDown className="h-3 w-3 text-black" />
        </span>
      </span>
    );
  };

  // Filter logic

  const [selectedFilters, setSelectedFilters] = useState({
    code: "",
    description: "",
    status: "",
  });

  useEffect(() => {
    fetchCategory();
  }, [role]);

  // Mosdal logic

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Filter logic

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [field]: value });
  };

  // Apply filters and reset filters logic
  const applyFilters = () => {
    setCurrentPage(0);
    setRole({
      ...role,
      page: 0,
      search: { ...selectedFilters },
    });
  };

  const resetFilters = () => {
    const clearedFilters = { code: "", description: "", status: "" };
    setSelectedFilters(clearedFilters);
    setRole({
      ...role,
      page: 0,
      search: clearedFilters,
    });
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Fetch reference data first before tasks
  const fetchReferenceData = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/item-category/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setDefaultStatus(response.data.defaultStatus || []);

        fetchCategory();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch tasks logic

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/item-category/filter-list",
        { ...role },
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        setCategoryList(response.data.content || []);
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view, edit, save, and delete task logic

  const handleViewCategory = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/item-category/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedCategory(response.data);
        setModalMode("view");
        setShowModal(true);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("View error:", error);
    }
  };

  const handleEditCategory = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/item-category/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedCategory(response.data);
        setModalMode("edit");
        setShowModal(true);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Edit load error:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/item-category/update",
        selectedCategory,
        UPDATE,
        token,
        username,
      );

      if (response.success) {
        showSuccessAlert(
          "Successfully Updated",
          "Check & verify updated details.",
        );
        setShowModal(false);
        fetchCategory();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = getSessionData("accessToken") || "";
        const username = getSessionData("userProfile")?.username || "";
        const response = await postLoginRequest(
          "api/v1/item-category/delete",
          { id },
          DELETE,
          token,
          username,
        );

        if (response.success) {
          Swal.fire("Deleted!", "User has been deleted.", "success");
          fetchCategory();
        } else {
          showErrorAlert(response.message);
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Item Category Management" />

      <>
        {privileges.search && (
          <div className="mt-3 items-center gap-2 space-y-3 md:flex md:space-y-0">
            <input
              type="text"
              placeholder="Code"
              className="w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
              value={selectedFilters.code}
              onChange={(e) => handleFilterChange("code", e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              className="w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
              value={selectedFilters.description}
              onChange={(e) =>
                handleFilterChange("description", e.target.value)
              }
            />
            <div className="relative w-full">
              <select
                className="w-full appearance-none rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                value={selectedFilters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">Status</option>
                {defaultStatus.map((status) => (
                  <option key={status.code} value={status.code}>
                    {status.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          {/* Add Button on the left */}
          {privileges.add && (
            <button
              onClick={() => {
                setShowAddModal(true);
              }}
              className="rounded-lg border border-primary bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-hover"
            >
              Add
            </button>
          )}

          {/* Search and Reset buttons on the right */}
          {privileges.search && (
            <div className="flex items-center gap-2">
              <button
                onClick={applyFilters}
                className="rounded-lg border border-primary bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-hover"
              >
                Search
              </button>
              <button
                onClick={resetFilters}
                className="rounded-lg border border-gray-500 bg-gray-500 px-4 py-1.5 text-sm font-medium text-white hover:border-gray-400 hover:bg-gray-400"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 w-full">
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="w-[10%] px-6 py-3 text-center">Action</th>
                  <th
                    className="w-[20%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center justify-center">
                      Code {renderSortIcons("code")}
                    </div>
                  </th>
                  <th
                    className="w-[60%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center justify-center">
                      Description {renderSortIcons("description")}
                    </div>
                  </th>
                  <th
                    className="w-[10%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center">
                      Status {renderSortIcons("status")}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {categoryList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  categoryList.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b bg-white text-center dark:bg-gray-800"
                    >
                      <td className="w-[10%] px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {privileges.view && (
                            <button
                              onClick={() =>
                                handleViewCategory(item.id.toString())
                              }
                              title="View User"
                            >
                              <ScanEye className="h-5 w-5 text-primary" />
                            </button>
                          )}
                          {privileges.update && (
                            <button
                              onClick={() =>
                                handleEditCategory(item.id.toString())
                              }
                              title="Update User"
                            >
                              <FilePenLine className="h-5 w-5 text-success" />
                            </button>
                          )}
                          {privileges.delete && (
                            <button
                              onClick={() => handleDeleteCategory(item.id)}
                              title="Delete User"
                            >
                              <Trash2 className="h-5 w-5 text-danger" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="w-[30%] px-6 py-4">{item.code}</td>
                      <td className="w-[50%] px-6 py-4 text-start">
                        {item.description}
                      </td>
                      <td className="w-[10%] px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {item.statusDescription}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {role.page + 1} of {Math.ceil(totalRecords / size)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={role.page === 0}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                role.page === 0
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={role.page >= Math.ceil(totalRecords / size) - 1}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                role.page >= Math.ceil(totalRecords / size) - 1
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {showModal && selectedCategory && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40 text-gray-600">
            <div className="relative m-2 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              {/* Close Icon Top-Right */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="mb-4 text-lg font-semibold">
                {modalMode === "view" ? "View Category" : "Edit Category"}
              </h2>

              <p className="mb-2">
                <strong>Code:</strong> {selectedCategory.code}
              </p>
              {modalMode === "edit" ? (
                <div className="mb-2">
                  <strong>Description:</strong>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border p-2"
                    value={selectedCategory.description}
                    onChange={(e) =>
                      setSelectedCategory({
                        ...selectedCategory,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Description:</strong> {selectedCategory.description}
                </p>
              )}

              {modalMode === "edit" ? (
                <div className="my-2">
                  <strong>Status:</strong>

                  <div className="relative w-full">
                    <select
                      className="mt-1 w-full appearance-none rounded-lg border p-2 focus:outline-none"
                      value={selectedCategory.status}
                      onChange={(e) =>
                        setSelectedCategory({
                          ...selectedCategory,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Status:</strong> {selectedCategory.statusDescription}
                </p>
              )}
              <p className="mb-2">
                <strong>Created Date:</strong> {selectedCategory.createdDate}
              </p>
              <p className="mb-2">
                <strong>Modified Date:</strong>{" "}
                {selectedCategory.lastModifiedDate}
              </p>
              <p className="mb-2">
                <strong>Created By:</strong> {selectedCategory.createdBy}
              </p>
              <p className="mb-2">
                <strong>Modified By:</strong> {selectedCategory.lastModifiedBy}
              </p>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded bg-gray-500 px-4 py-2 text-sm text-white"
                >
                  Close
                </button>
                {modalMode === "edit" && (
                  <button
                    onClick={handleSaveEdit}
                    className="rounded bg-primary px-4 py-2 text-sm text-white"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add user modal  */}
        {showAddModal && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40 text-gray-600">
            <div className="relative m-2 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              {/* Close Icon Top-Right */}
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="mb-4 text-lg font-semibold">Add New Category</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Category Code"
                  name="code"
                  onChange={handleChange}
                  required
                  pattern="^\S+$"
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none"
                  value={newCategory.code}
                />
                <input
                  type="text"
                  placeholder="Description"
                  name="description"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none"
                  value={newCategory.description}
                  onChange={handleChange}
                />

                <div className="relative">
                  <select
                    className="mb-2 w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none"
                    value={newCategory.status}
                    name="status"
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, status: e.target.value })
                    }
                  >
                    <option value="">Select Status</option>
                    {defaultStatus.map((status) => (
                      <option key={status.code} value={status.code}>
                        {status.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-hover"
                  >
                    {loading ? "Adding..." : "Add Category"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    </DefaultLayout>
  );
}

export default withAuth(Category);
