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
import { IFilter, ISectionItem } from "@/types";
import { DELETE, FILTERLIST, REFDATA, UPDATE, VIEW } from "@/utils/apiMessage";
import { showErrorAlert, showSuccessAlert } from "@/utils/alert";
import Swal from "sweetalert2";
import withAuth from "@/utils/withAuth";

function Section() {
  const [loading, setLoading] = useState(true);
  const [sectionList, setSectionList] = useState<ISectionItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [size] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // Section filter state

  const [section, setSection] = useState<IFilter>({
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

  const [defaultStatus, setDefaultStatus] = useState([
    { code: "ACTIVE", description: "Active" },
    { code: "INACTIVE", description: "Inactive" },
  ]);

  // Pagination logic

  const handlePageChange = (newPage: number) => {
    setSection((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (section.page > 0) {
      const newPage = section.page - 1;
      setCurrentPage(newPage);
      setSection({ ...section, page: newPage });
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRecords / size);
    if (section.page < totalPages - 1) {
      const newPage = section.page + 1;
      setCurrentPage(newPage);
      setSection({ ...section, page: newPage });
    }
  };

  // sorting logic

  const handleSort = (column: string) => {
    setSection((prev) => ({
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
    const isActive = section.sortColumn === column;
    const direction = section.sortDirection;

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
    fetchSections();
  }, [section]);

  // Mosdal logic

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);

  // Filter logic

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [field]: value });
  };

  // Apply filters and reset filters logic
  const applyFilters = () => {
    setCurrentPage(0);
    setSection({
      ...section,
      page: 0,
      search: { ...selectedFilters },
    });
  };

  const resetFilters = () => {
    const clearedFilters = { code: "", description: "", status: "" };
    setSelectedFilters(clearedFilters);
    setSection({
      ...section,
      page: 0,
      search: clearedFilters,
    });
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Fetch reference data first before sections
  const fetchReferenceData = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/section/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setDefaultStatus(response.data.defaultStatus || []);
        fetchSections();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch sections logic

  const fetchSections = async () => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/section/filter-list",
        { ...section },
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        setSectionList(response.data.content || []);
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

  // Handle view, edit, save, and delete section logic

  const handleViewSection = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/section/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedSection(response.data);
        setModalMode("view");
        setShowModal(true);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("View error:", error);
    }
  };

  const handleEditSection = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/section/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedSection(response.data);
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
        "api/v1/section/update",
        selectedSection,
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
        fetchSections();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDeleteSection = async (id: number) => {
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
          "api/v1/section/delete",
          { id },
          DELETE,
          token,
          username,
        );

        if (response.success) {
          Swal.fire("Deleted!", "Page has been deleted.", "success");
          fetchSections();
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
      <Breadcrumb pageName="Section Management" />
      {privileges.search && (
        <>
          <div className="mt-3 items-center gap-2 space-y-3 md:flex md:space-y-0">
            <input
              type="text"
              placeholder="Code"
              className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
              value={selectedFilters.code}
              onChange={(e) => handleFilterChange("code", e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
              value={selectedFilters.description}
              onChange={(e) =>
                handleFilterChange("description", e.target.value)
              }
            />
            <div className="relative w-full">
              <select
                className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
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

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={applyFilters}
              className="w-20 rounded-lg border border-primary bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-hover"
            >
              Search
            </button>
            <button
              onClick={resetFilters}
              className="w-20 rounded-lg border border-gray-500 bg-gray-500 px-4 py-1.5 text-sm font-medium text-white hover:border-gray-400 hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </>
      )}

      <div className="mt-4 w-full">
        <div className="overflow-x-auto rounded-2xl shadow-md">
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
              {sectionList.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                sectionList.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b bg-white text-center dark:bg-gray-800"
                  >
                    <td className="w-[10%] px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {privileges.view && (
                          <button
                            onClick={() =>
                              handleViewSection(item.id.toString())
                            }
                            title="View User"
                          >
                            <ScanEye className="h-5 w-5 text-primary" />
                          </button>
                        )}
                        {privileges.update && (
                          <button
                            onClick={() =>
                              handleEditSection(item.id.toString())
                            }
                            title="Update User"
                          >
                            <FilePenLine className="h-5 w-5 text-success" />
                          </button>
                        )}
                        {privileges.delete && (
                          <button
                            onClick={() => handleDeleteSection(item.id)}
                            title="Delete User"
                          >
                            <Trash2 className="h-5 w-5 text-danger" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="w-[30%] px-6 py-4">{item.code}</td>
                    <td className="w-[50%] px-6 py-4">
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
          Page {section.page + 1} of {Math.ceil(totalRecords / size)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={section.page === 0}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              section.page === 0
                ? "cursor-not-allowed bg-gray-300 text-gray-600"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={section.page >= Math.ceil(totalRecords / size) - 1}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              section.page >= Math.ceil(totalRecords / size) - 1
                ? "cursor-not-allowed bg-gray-300 text-gray-600"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {showModal && selectedSection && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40 text-gray-600">
          <div className="relative m-2 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
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
              {modalMode === "view" ? "View Section" : "Edit Section"}
            </h2>

            <p className="mb-2">
              <strong>Code:</strong> {selectedSection.code}
            </p>
            <p className="mb-2">
              <strong>Description:</strong> {selectedSection.description}
            </p>
            {modalMode === "edit" ? (
              <div className="my-2">
                <strong>Status:</strong>

                <div className="relative w-full">
                  <select
                    className="mt-1 w-full appearance-none rounded-lg border p-2 focus:outline-none"
                    value={selectedSection.status}
                    onChange={(e) =>
                      setSelectedSection({
                        ...selectedSection,
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
                <strong>Status:</strong> {selectedSection.statusDescription}
              </p>
            )}
            <p className="mb-2">
              <strong>Created Date:</strong> {selectedSection.createdDate}
            </p>
            <p className="mb-2">
              <strong>Modified Date:</strong> {selectedSection.lastModifiedDate}
            </p>
            <p className="mb-2">
              <strong>Created By:</strong> {selectedSection.createdBy}
            </p>
            <p className="mb-2">
              <strong>Modified By:</strong> {selectedSection.lastModifiedBy}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-20 rounded-lg bg-gray-500 px-4 py-2 text-sm text-white"
              >
                Close
              </button>
              {modalMode === "edit" && (
                <button
                  onClick={handleSaveEdit}
                  className="w-20 rounded-lg bg-primary px-4 py-2 text-sm text-white"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}

export default withAuth(Section);
