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
import { ILocation, ILocationFilter, IAddLocation } from "@/types";
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

function Location() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationList, setLocationList] = useState<ILocation[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [size] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // task filter state

  const [location, setLocation] = useState<ILocationFilter>({
    page: 0,
    size: size,
    sortColumn: "lastModifiedDate",
    sortDirection: "DESC",
    search: {
      code: "",
      description: "",
      status: "",
      city: "",
      contactNumber: "",
      locationType: "",
    },
  });

  // Privileges and defaultStatus state
  const [privileges, setPrivileges] = useState({
    add: false,
    update: false,
    view: false,
    search: false,
    delete: false,
    useritemPrivilegeAssign: false,
  });

  const [defaultStatus, setDefaultStatus] = useState<
    { code: string; description: string }[]
  >([]);

  const [locations, setLocations] = useState<
    { code: string; description: string }[]
  >([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocation, setNewLocation] = useState<IAddLocation>({
    code: "",
    description: "",
    city: "",
    contactNumber: "",
    status: "ACTIVE",
    locationType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLocation((prevData) => ({
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
        "api/v1/location/add",
        {
          ...newLocation,
        },
        ADD,
        token,
        userProfile?.username,
      );

      if (response.success) {
        showSuccessAlert(
          "Success",
          response.message || "User item created successfully",
        );
        setShowAddModal(false);
        // Reset form fields
        setNewLocation({
          code: "",
          description: "",
          city: "",
          contactNumber: "",
          status: "",
          locationType: "",
        });
        fetchLocation();
      } else {
        showErrorAlert(
          "Location Create Failed",
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
    setLocation((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (location.page > 0) {
      const newPage = location.page - 1;
      setCurrentPage(newPage);
      setLocation({ ...location, page: newPage });
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRecords / size);
    if (location.page < totalPages - 1) {
      const newPage = location.page + 1;
      setCurrentPage(newPage);
      setLocation({ ...location, page: newPage });
    }
  };

  // sorting logic

  const handleSort = (column: string) => {
    setLocation((prev) => ({
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
    const isActive = location.sortColumn === column;
    const direction = location.sortDirection;

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
    city: "",
    contactNumber: "",
    locationType: "",
  });

  useEffect(() => {
    fetchLocation();
  }, [location]);

  // Mosdal logic

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Filter logic

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [field]: value });
  };

  // Apply filters and reset filters logic
  const applyFilters = () => {
    setCurrentPage(0);
    setLocation({
      ...location,
      page: 0,
      search: { ...selectedFilters },
    });
  };

  const resetFilters = () => {
    const clearedFilters = {
      code: "",
      description: "",
      status: "",
      city: "",
      contactNumber: "",
      locationType: "",
    };
    setSelectedFilters(clearedFilters);
    setLocation({
      ...location,
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
        "api/v1/location/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setDefaultStatus(response.data.defaultStatus || []);
        setLocations(response.data.locations || []);
        fetchLocation();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch tasks logic

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/location/filter-list",
        { ...location },
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        setLocationList(response.data.content || []);
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

  const handleViewItem = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/location/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedLocation(response.data);
        setModalMode("view");
        setShowModal(true);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("View error:", error);
    }
  };

  const handleEditLocation = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/location/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedLocation(response.data);
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
        "api/v1/location/update",
        selectedLocation,
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
        fetchLocation();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDeleteLocation = async (id: number) => {
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
          "api/v1/location/delete",
          { id },
          DELETE,
          token,
          username,
        );

        if (response.success) {
          Swal.fire("Deleted!", "Location has been deleted.", "success");
          fetchLocation();
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
      <Breadcrumb pageName="Branch Management" />

      <>
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
              <input
                type="text"
                placeholder="City"
                className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                value={selectedFilters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
              />
            </div>
            <div className="mt-3 items-center gap-2 space-y-3 md:flex md:space-y-0">
              <input
                type="text"
                placeholder="Mobile"
                className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                value={selectedFilters.contactNumber}
                onChange={(e) =>
                  handleFilterChange("contactNumber", e.target.value)
                }
              />
              <div className="relative w-full">
                <select
                  className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.locationType}
                  onChange={(e) =>
                    handleFilterChange("locationType", e.target.value)
                  }
                >
                  <option value="">Location Type</option>
                  {locations.map((location) => (
                    <option key={location.code} value={location.code}>
                      {location.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
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
          </>
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
          <div className="overflow-x-auto rounded-2xl shadow-md">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="w-[10%] px-6 py-3 text-center">Action</th>
                  <th
                    className="w-[10%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center justify-center">
                      Code {renderSortIcons("code")}
                    </div>
                  </th>
                  <th
                    className="w-[20%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("desription")}
                  >
                    <div className="flex items-center justify-center">
                      Description {renderSortIcons("description")}
                    </div>
                  </th>
                  <th
                    className="w-[25%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("city")}
                  >
                    <div className="flex items-center justify-center">
                      City {renderSortIcons("city")}
                    </div>
                  </th>
                  <th
                    className="w-[25%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("locationTypeDescription")}
                  >
                    <div className="flex items-center justify-center">
                      Location Type {renderSortIcons("locationTypeDescription")}
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
                {locationList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  locationList.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b bg-white text-center dark:bg-gray-800"
                    >
                      <td className="w-[10%] px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {privileges.view && (
                            <button
                              onClick={() => handleViewItem(item.id.toString())}
                              title="View"
                            >
                              <ScanEye className="h-5 w-5 text-primary" />
                            </button>
                          )}
                          {privileges.update && (
                            <button
                              onClick={() =>
                                handleEditLocation(item.id.toString())
                              }
                              title="Update"
                            >
                              <FilePenLine className="h-5 w-5 text-success" />
                            </button>
                          )}
                          {privileges.delete && (
                            <button
                              onClick={() => handleDeleteLocation(item.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5 text-danger" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="w-[10%] px-6 py-4">{item.code}</td>
                      <td className="w-[20%] px-6 py-4">{item.description}</td>
                      <td className="w-[25%] px-6 py-4">{item.city}</td>
                      <td className="w-[25%] px-6 py-4">
                        {item.locationTypeDescription}
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
            Page {location.page + 1} of {Math.ceil(totalRecords / size)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={location.page === 0}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                location.page === 0
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={location.page >= Math.ceil(totalRecords / size) - 1}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                location.page >= Math.ceil(totalRecords / size) - 1
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {showModal && selectedLocation && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40 text-gray-600">
            <div className="hide-scrollbar relative m-2 h-[450px] w-full max-w-md overflow-auto rounded-2xl bg-white p-6 shadow-lg">
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
                {modalMode === "view" ? "View Location" : "Edit Location"}
              </h2>

              <p className="mb-2">
                <strong>Code:</strong> {selectedLocation.code}
              </p>

              {modalMode === "edit" ? (
                <div className="mb-2">
                  <strong>Description:</strong>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border p-2"
                    value={selectedLocation.description}
                    onChange={(e) =>
                      setSelectedLocation({
                        ...selectedLocation,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Description:</strong> {selectedLocation.description}
                </p>
              )}

              <p className="mb-2">
                <strong>Location Type:</strong>{" "}
                {selectedLocation.locationTypeDescription}
              </p>

              {modalMode === "edit" ? (
                <div className="mb-2">
                  <strong>City:</strong>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border p-2"
                    value={selectedLocation.city}
                    onChange={(e) =>
                      setSelectedLocation({
                        ...selectedLocation,
                        city: e.target.value,
                      })
                    }
                  />
                </div>
              ) : (
                <p className="mb-2">
                  <strong>City:</strong> {selectedLocation.city}
                </p>
              )}

              {modalMode === "edit" ? (
                <div className="mb-2">
                  <strong>Mobile:</strong>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border p-2"
                    value={selectedLocation.contactNumber}
                    onChange={(e) =>
                      setSelectedLocation({
                        ...selectedLocation,
                        contactNumber: e.target.value,
                      })
                    }
                  />
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Mobile:</strong> {selectedLocation.contactNumber}
                </p>
              )}

              {modalMode === "edit" ? (
                <div className="my-2">
                  <strong>Status:</strong>

                  <div className="relative w-full">
                    <select
                      className="mt-1 w-full appearance-none rounded-lg border p-2 focus:outline-none"
                      value={selectedLocation.status}
                      onChange={(e) =>
                        setSelectedLocation({
                          ...selectedLocation,
                          status: e.target.value,
                        })
                      }
                    >
                      {defaultStatus.map((status) => (
                        <option key={status.code} value={status.code}>
                          {status.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Status:</strong> {selectedLocation.statusDescription}
                </p>
              )}

              <p className="mb-2">
                <strong>Created Date:</strong> {selectedLocation.createdDate}
              </p>

              <p className="mb-2">
                <strong>Last Modified Date:</strong>{" "}
                {selectedLocation.lastModifiedDate}
              </p>

              <p className="mb-2">
                <strong>Created By:</strong> {selectedLocation.createdBy}
              </p>

              <p className="mb-2">
                <strong>Last Modified By:</strong>{" "}
                {selectedLocation.lastModifiedBy}
              </p>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white"
                >
                  Close
                </button>
                {modalMode === "edit" && (
                  <button
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add  modal  */}
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
              <h2 className="mb-4 text-lg font-semibold">Add New Location</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Location Code"
                  name="code"
                  onChange={handleChange}
                  required
                  pattern="^\S+$"
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none"
                  value={newLocation.code}
                />
                <input
                  type="text"
                  placeholder="Description"
                  name="description"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none"
                  value={newLocation.description}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  placeholder="City"
                  name="city"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none"
                  value={newLocation.city}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  placeholder="Mobile"
                  name="contactNumber"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                  minLength={10}
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none"
                  value={newLocation.contactNumber}
                  onChange={handleChange}
                />
                <div className="relative">
                  <select
                    className="mb-2 w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none"
                    value={newLocation.locationType}
                    name="category"
                    required
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        locationType: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Location Type</option>
                    {locations.map((location) => (
                      <option key={location.code} value={location.code}>
                        {location.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                </div>

                <div className="relative mb-4">
                  <select
                    className="w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none"
                    value={newLocation.status}
                    name="status"
                    required
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, status: e.target.value })
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
                    {loading ? "Adding..." : "Add Location"}
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

export default withAuth(Location);
