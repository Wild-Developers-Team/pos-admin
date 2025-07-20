"use client";
import {
  ChevronDown,
  ChevronUp,
  Delete,
  Edit,
  Eye,
  FilePenLine,
  House,
  Save,
  ScanEye,
  ScanSearch,
  Trash2,
  User,
  View,
  CircleCheckBig,
  CircleX,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { getSessionData } from "@/utils/session";
import { postLoginRequest } from "@/services/api.service";
import {
  IAddTransfer,
  ICartTransferItem,
  ITransferFilter,
  ITransferItem,
} from "@/types";
import {
  ADD,
  DELETE,
  FILTERLIST,
  REFDATA,
  UPDATE,
  VIEW,
} from "@/utils/apiMessage";
import { showErrorAlert, showSuccessAlert } from "@/utils/alert";
import withAuth from "@/utils/withAuth";
import { Search, PlusCircle, FolderPlus } from "lucide-react";

function NewTransfer() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [transferList, setTransferList] = useState<ITransferItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [size] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);

  const [cartItems, setCartItems] = useState<ICartTransferItem[]>([]);
  const [modalItem, setModalItem] = useState<any>({
    id: "",
    itemCode: "",
    description: "",
    qty: "",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Section filter state

  const [viewTransfer, setViewTransfer] = useState<ITransferFilter>({
    page: 0,
    size: size,
    sortColumn: "lastModifiedDate",
    sortDirection: "DESC",
    search: {
      code: "",
      description: "",
      fromLocation: "",
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

  const [locations, setLocations] = useState<
    { code: string; description: string }[]
  >([]);

  const [newTransfer, setNewTransfer] = useState<IAddTransfer>({
    fromLocation: "",
    toLocation: "",
    senderRemark: "",
    transferItemList: [
      {
        id: "",
        qty: 0,
      },
    ],
  });

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setModalItem((prev: any) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleAddOrEditItem = (e: React.FormEvent) => {
    e.preventDefault(); // prevent default form behavior

    const requiredFields = [{ key: "qty", label: "Quantity" }];
    for (let field of requiredFields) {
      if (
        modalItem[field.key] === "" ||
        modalItem[field.key] === null ||
        modalItem[field.key] === undefined
      ) {
        showErrorAlert(`${field.label} is required`);
        return;
      }
    }
    if (!modalItem.itemCode) {
      showErrorAlert("Item code is required");
      return;
    }

    if (editIndex !== null) {
      // Update existing item
      const updatedItems = [...cartItems];
      updatedItems[editIndex] = modalItem;
      setCartItems(updatedItems);
      showSuccessAlert("Success", "Item updated in cart");
    } else {
      // Add new item
      setCartItems((prev) => [...prev, modalItem]);
      showSuccessAlert("Success", "Item added to cart");
    }

    setShowModal(false);
    setModalItem({});
    setEditIndex(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewTransfer((prevData) => ({
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

      // Map cartItems to itemGRNS correctly
      const transferItemList = cartItems.map((item) => ({
        id: item.id,
        qty: Number(item.qty) || 0,
      }));

      const response = await postLoginRequest(
        "api/v1/item-transfer/transfer",
        {
          ...newTransfer,
          transferItemList,
          fromLocation: selectedFilters.fromLocation,
        },
        ADD,
        token,
        userProfile?.username,
      );

      if (response.success) {
        showSuccessAlert(
          "Success",
          response.message || "Transfer item created successfully",
        );
        // fetchGRN();
        setNewTransfer({
          fromLocation: "",
          toLocation: "",
          senderRemark: "",
          transferItemList: [
            {
              id: "",
              qty: 0,
            },
          ],
        });
        setCartItems([]);
      } else {
        showErrorAlert(
          "Transfer Create Failed",
          response.message || "Something went wrong!",
        );
      }
    } catch (err) {
      console.error("Error calling API:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.qty * item.itemCost,
    0,
  );

  // If no paid amount entered, show credit as full total
  const computedCredit =
    paidAmount === "" ? totalAmount : totalAmount - Number(paidAmount);

  const handlePaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const paidValue = e.target.value;
    if (paidValue === "") {
      setPaidAmount("");
    } else {
      setPaidAmount(parseFloat(paidValue));
    }
  };

  // Pagination logic

  const fetchTransfer = async () => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/item-transfer/filter-list",
        { ...viewTransfer },
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        if (viewTransfer.page === 0) {
          setTransferList(response.data.content || []);
        } else {
          setTransferList((prev) => [
            ...prev,
            ...(response.data.content || []),
          ]);
        }
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.getElementById("scrollable-table");
      if (
        scrollContainer &&
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 50 &&
        !isFetchingMore &&
        transferList.length < totalRecords
      ) {
        setIsFetchingMore(true);
        setViewTransfer((prev) => ({
          ...prev,
          page: prev.page + 1,
        }));
      }
    };

    const scrollContainer = document.getElementById("scrollable-table");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [transferList, totalRecords, isFetchingMore]);

  // Short Keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showModal) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setShowModal(false);
      } else if (event.key === "Enter") {
        event.preventDefault();
        handleAddOrEditItem(new Event("submit") as any); // simulate form submit
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleAddOrEditItem]);

  useEffect(() => {
    fetchTransfer();
  }, [
    viewTransfer.search.code,
    viewTransfer.search.description,
    viewTransfer.search.fromLocation,
  ]);

  useEffect(() => {
    if (viewTransfer.page > 0) {
      fetchTransfer();
    }
  }, [viewTransfer.page]);

  const handlePageChange = (newPage: number) => {
    setViewTransfer((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // sorting logic

  const handleSort = (column: string) => {
    setViewTransfer((prev) => ({
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
    const isActive = viewTransfer.sortColumn === column;
    const direction = viewTransfer.sortDirection;

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
    fromLocation: "",
  });

  // inside your component before return
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setViewTransfer((prev) => ({
        ...prev,
        page: 0,
        search: {
          code: selectedFilters.code,
          description: selectedFilters.description,
          fromLocation: selectedFilters.fromLocation,
        },
      }));
    }, 400);

    return () => clearTimeout(debounceTimeout);
  }, [selectedFilters]);

  useEffect(() => {
    fetchTransfer();
  }, []);

  // Modal logic

  const [showModal, setShowModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);

  // Filter logic

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [field]: value });
  };

  // Apply filters and reset filters logic
  const applyFilters = () => {
    setCurrentPage(0);
    setViewTransfer({
      ...viewTransfer,
      page: 0,
      search: {
        ...selectedFilters,
        code: "",
        description: "",
        fromLocation: "",
      },
    });
  };

  const resetFilters = () => {
    const clearedFilters = { code: "", description: "", fromLocation: "" };
    setSelectedFilters(clearedFilters);
    setViewTransfer({
      ...viewTransfer,
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
        "api/v1/item-transfer/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setLocations(response.data.locations || []);
        fetchTransfer();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden md:flex-row">
        {/* Left Column */}
        <div className="flex w-full flex-col overflow-hidden p-4 md:w-1/2">
          <div className="flex grow flex-col overflow-hidden">
            {privileges.search && (
              <>
                <div className="mb-4 items-center gap-2 space-y-3 md:flex md:space-y-0">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="me-2 inline-flex items-center rounded-full bg-primary p-2.5 text-center text-sm font-medium text-white hover:bg-hover focus:outline-none  dark:bg-primary dark:hover:bg-hover"
                  >
                    {/* Left Arrow Icon */}
                    <svg
                      className="h-4 w-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 5H1m0 0l4 4M1 5l4-4"
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    ref={searchInputRef}
                    placeholder="Code"
                    className="w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                    value={selectedFilters.code}
                    onChange={(e) =>
                      setSelectedFilters({
                        ...selectedFilters,
                        code: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    ref={searchInputRef}
                    className="w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                    value={selectedFilters.description}
                    onChange={(e) =>
                      setSelectedFilters({
                        ...selectedFilters,
                        description: e.target.value,
                      })
                    }
                  />
                  <div className="relative w-full">
                    <select
                      className="w-full appearance-none rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                      value={selectedFilters.fromLocation}
                      onChange={(e) =>
                        setSelectedFilters({
                          ...selectedFilters,
                          fromLocation: e.target.value,
                        })
                      }
                    >
                      <option value="">From Location</option>
                      {locations.map((location) => (
                        <option key={location.code} value={location.code}>
                          {location.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              </>
            )}
            <div className="grow overflow-hidden">
              <div
                id="scrollable-table"
                className="hide-scrollbar h-full overflow-y-auto rounded-xl"
              >
                <div className="rounded-2xl border border-gray-200 bg-white p-4  dark:border-gray-700 dark:bg-gray-900">
                  {/* Header Row */}
                  <div className="hidden grid-cols-5 gap-4 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 md:grid">
                    <div className="text-center">Code</div>
                    <div className="text-center">Item Name</div>
                    <div className="text-center">Cost</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-center">Status</div>
                  </div>

                  <div className="mt-2 cursor-pointer space-y-3">
                    {transferList.length === 0 ? (
                      <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                        No records found.
                      </div>
                    ) : (
                      transferList.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedTransfer(item);
                            setModalItem({
                              id: item.id,
                              itemCode: item.item.code,
                              description: item.item.description,
                              itemCost: item.itemCost,
                              qty: "",
                            });
                            setEditIndex(null);
                            setShowModal(true);
                          }}
                          className="grid grid-cols-1 gap-y-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm shadow-sm transition hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 md:grid-cols-5 md:gap-4"
                        >
                          <div className="text-center font-medium text-gray-800 dark:text-white md:text-center">
                            {item.item.code}
                          </div>
                          <div className="text-center text-gray-700 dark:text-gray-200 md:text-center">
                            {item.item.description}
                          </div>
                          <div className="text-center text-gray-700 dark:text-gray-200 md:text-center">
                            {item.itemCost.toFixed(2)}
                          </div>
                          <div className="text-center text-gray-700 dark:text-gray-200 md:text-center">
                            {item.qty.toFixed(2)}
                          </div>
                          <div className="text-center md:text-center">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                item.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {item.statusDescription}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex w-full flex-col overflow-hidden p-4 md:w-1/2">
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <div className="grow overflow-hidden">
              <div className="hide-scrollbar h-full overflow-y-auto rounded-xl border border-gray-300 bg-gray-200 p-2 dark:border-gray-700 dark:bg-gray-900">
                <div className="w-full space-y-2 text-white">
                  {/* Table Header */}
                  <div className="mb-1 flex w-full items-center justify-between text-sm font-bold">
                    <div className="text-md w-[60%] px-2 text-primary">
                      Name
                    </div>
                    <div className="text-md flex w-[40%] justify-between px-2">
                      <span className="text-primary">Cost</span>
                      <span className="text-primary">Quantity</span>
                    </div>
                  </div>

                  {/* Table Body */}
                  {cartItems.length === 0 ? (
                    <div className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-center text-sm text-gray-500 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
                      No items added
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex w-full justify-between gap-2 rounded-2xl border border-gray-200 bg-gray-100 p-2 shadow dark:border-gray-500 dark:bg-gray-800"
                      >
                        {/* Left: Description & Code */}
                        <div className="flex w-[60%] flex-col justify-center rounded-xl border bg-gray-100 px-3 py-2 dark:border-gray-500 dark:bg-gray-800">
                          <p className="text-sm font-medium text-black dark:text-white">
                            {index + 1}. {item.description} - {item.qty}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {item.itemCode}
                          </p>
                        </div>

                        {/* Right: Prices, QTY, Actions */}
                        <div className="flex w-[40%] flex-col justify-between rounded-xl border border-gray-200  bg-gray-100 p-2 px-3 py-2 text-right text-sm shadow dark:border-gray-500 dark:bg-gray-800">
                          {/* Prices & Quantity Row */}
                          <div className="text-md flex justify-between font-bold">
                            <span className="text-primary">
                              {item.itemCost?.toFixed(2)}
                            </span>
                            <span className="text-hover">{item.qty}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setModalItem(item);
                                setEditIndex(index);
                                setShowModal(true);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                const updated = cartItems.filter(
                                  (_, i) => i !== index,
                                );
                                setCartItems(updated);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-0">
              <div className="flex flex-col gap-2 pb-2 sm:flex-row">
                <div className="relative w-full">
                  <select
                    className="h-full w-full appearance-none rounded-xl border bg-[#EAF4FE] p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                    value={newTransfer.toLocation}
                    required
                    name="toLocation"
                    onChange={(e) =>
                      setNewTransfer({
                        ...newTransfer,
                        toLocation: e.target.value,
                      })
                    }
                  >
                    <option value="">To Location</option>
                    {locations.map((location) => (
                      <option key={location.code} value={location.code}>
                        {location.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-gray-200 p-1 text-gray-500 dark:bg-gray-700 dark:text-gray-200" />
                </div>

                <input
                  className="w-full  rounded-xl border border-gray-200  bg-[#EAF4FE] p-3 text-gray-500 placeholder-gray-500 transition-all duration-200 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2 dark:placeholder-gray-300"
                  placeholder="Type Remarks Here"
                  name="senderRemark"
                  value={newTransfer.senderRemark}
                  onChange={handleChange}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => {
                    setNewTransfer({
                      fromLocation: "",
                      toLocation: "",
                      senderRemark: "",
                      transferItemList: [
                        {
                          id: "",
                          qty: 0,
                        },
                      ],
                    });
                    setCartItems([]);
                  }}
                  className="text-md flex w-full items-center justify-center gap-2 rounded-xl bg-red-100 py-3 font-bold text-red-500 dark:bg-red-500 dark:text-white"
                >
                  <CircleX className="cursor-pointer text-red-500 dark:text-white" />
                  Clear Transfer
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="text-md flex w-full items-center justify-center gap-2 rounded-xl bg-[#4FB7E4] py-3 font-bold text-white"
                >
                  <Save className="cursor-pointer text-white" />
                  {loading ? "Transfering..." : "Save Transfer"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showModal && selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[90%] max-w-md rounded-lg bg-white p-6 text-gray-500 shadow-lg dark:border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200">
            <h2 className="mb-2 text-center text-xl font-semibold">
              {selectedTransfer.item.description}
            </h2>
            <p className="mb-4 text-center text-sm">
              <strong>ID :</strong> {selectedTransfer.id}
            </p>
            <p className="mb-4 text-center text-sm">
              <strong>Item Code :</strong> {selectedTransfer.item.code}
            </p>
            <hr />
            <form>
              <div className="mb-4 mt-4">
                <div className="flex-col justify-center">
                  <div className="ustify-between flex w-full gap-4">
                    <div className="w-full">
                      <strong>Quantity</strong>
                      <input
                        type="number"
                        name="qty"
                        required
                        value={modalItem.qty}
                        onChange={handleModalInputChange}
                        className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-md mt-4 rounded-lg bg-hover px-4 py-3 font-bold text-white hover:bg-primary"
                >
                  Cancel{" "}
                  <span className="ml-2 inline rounded-md bg-black-2 p-1 px-2">
                    Esc
                  </span>
                </button>
                <button
                  onClick={handleAddOrEditItem}
                  className="text-md mt-4 rounded-lg bg-red-500 px-4 py-3 font-bold text-white hover:bg-red-400"
                >
                  {editIndex !== null ? "Update" : "Add"}{" "}
                  <span className="ml-2 inline rounded-md bg-black-2 p-1 px-2">
                    Enter
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default withAuth(NewTransfer);
