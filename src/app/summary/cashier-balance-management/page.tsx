"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useEffect, useState } from "react";
import { getSessionData } from "@/utils/session";
import { postLoginRequest } from "@/services/api.service";
import { FILTERLIST, REFDATA, VIEW } from "@/utils/apiMessage";
import { showErrorAlert } from "@/utils/alert";
import withAuth from "@/utils/withAuth";
import { ChevronDown, House } from "lucide-react";

function Balance() {
  const [loading, setLoading] = useState(true);

  const [privileges, setPrivileges] = useState({
    add: false,
    update: false,
    view: false,
    search: false,
    delete: false,
    useritemPrivilegeAssign: false,
  });

  const [locations, setLocations] = useState<
    {
      code: string;
      description: string;
      summary?: any;
      cashiers?: Record<string, any>;
    }[]
  >([]);

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [activeCashier, setActiveCashier] = useState<string>("all");
  const [selectedSubTab, setSelectedSubTab] = useState<{
    [key: string]: string;
  }>({});

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [inputFromDate, setInputFromDate] = useState("");
  const [inputToDate, setInputToDate] = useState("");

  const [grandSummary, setGrandSummary] = useState<any>(null);

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleDetails, setSaleDetails] = useState<any[]>([]);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnDetails, setReturnDetails] = useState<any[]>([]);

  const handlePrint = (tableId: string) => {
    const content = document.getElementById(tableId);
    const printWindow = window.open("", "", "height=700,width=900");

    if (printWindow && content) {
      const now = new Date();
      const dateTimeString = now.toLocaleString();

      printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            thead { background-color: #f5f5f5; }
            @media print {
              .no-print {
               display: none !important;
                  }
             }
            .header, .footer { width: 100%; }
            .header { border-bottom: 1px solid #ccc; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
            .footer { margin-top: 48px; font-size: 14px; color: #4b5563; }
            .footer .signature { margin-top: 48px; }
            .footer .signature .line { width: 192px; border-top: 1px solid #000; padding-top: 8px; }
            .notes { margin-top: 40px; font-size: 14px; color: #4b5563; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div style="margin-top: 8px; font-size: 20px; font-weight: bold;">DPD Chemical</div>
              <div style="font-size: 14px; color: #4b5563;">Pemaduwa, Anuradhapura</div>
              <div style="font-size: 14px; color: #4b5563;">078 6065410 / 025 3133969</div>
              <div style="font-size: 14px; color: #4b5563;">nimeshkalharapk@gmail.com</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px;">${dateTimeString}</div>
            </div>
          </div>

          <div id="billContent">
            ${content.innerHTML}
          </div>

          <div class="footer">
            <div class="signature">
              <div class="line">Authorized Signature</div>
              <div style="margin-top: 16px; font-size: 12px;">
                Date: ________________________
              </div>
            </div>

            <div class="notes">
              <p style="font-weight: 600;">NOTES:</p>
              <p>Please verify items upon receipt.</br>Report any missing/damaged items within 24hrs.</p>
            </div>
          </div>
        </body>
      </html>
    `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const formattedForInput = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
    const formattedForAPI = `${yyyy}/${mm}/${dd}`; // YYYY/MM/DD

    setFromDate(formattedForAPI);
    setToDate(formattedForAPI);
    setInputFromDate(formattedForInput);
    setInputToDate(formattedForInput);
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchBalance(fromDate, toDate);
    }
  }, [fromDate, toDate]);

  // Fetch reference data (including locations and privileges)
  const fetchReferenceData = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/cash-book/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setLocations(response.data.locations || []);
        setGrandSummary(response.data.grandSummary || null);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch balance data filtered by date
  const fetchBalance = async (fromDate?: string, toDate?: string) => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";

      const requestBody: Record<string, any> = {};
      if (fromDate) requestBody.fromDate = fromDate;
      if (toDate) requestBody.toDate = toDate;

      const response = await postLoginRequest(
        "api/v1/cash-book/cashier-balance",
        requestBody,
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        const locObj = response.data.locations || {};
        setLocations((prevLocs) =>
          prevLocs.map((loc) => ({
            ...loc,
            summary: locObj[loc.code]?.summary || null,
            cashiers: locObj[loc.code]?.cashiers || null,
          })),
        );
        setGrandSummary(response.data.grandSummary || null);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // View more balance details
  const handleViewBalance = async (
    invoiceNumber: string,
    type: "SALES" | "RETURNS",
  ) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/cash-book/cashier-balance-view",
        { invoiceNumber, type },
        VIEW,
        token,
        username,
      );

      if (response.success && response.data) {
        if (type === "SALES") {
          setSaleDetails(response.data);
          setShowSaleModal(true);
        } else if (type === "RETURNS") {
          setReturnDetails(response.data);
          setShowReturnModal(true);
        }
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("View error:", error);
    }
  };

  // Style active/inactive cashier buttons
  const getButtonClass = (key: string) => {
    return `rounded-xl px-4 py-2 text-sm font-semibold ${
      activeCashier === key
        ? "bg-primary text-white"
        : "bg-gray-200 text-gray-700 hover:bg-primary hover:text-white dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-primary dark:hover:text-white"
    }`;
  };

  // Style active/inactive sub-tab buttons
  const getSubTabClass = (tab: string, cashier: string) => {
    return `rounded-xl px-4 py-2 text-sm font-medium ${
      selectedSubTab[cashier] === tab
        ? "bg-hover text-white"
        : "bg-gray-200 text-gray-700 hover:bg-hover hover:text-white dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-primary dark:hover:text-white"
    }`;
  };

  const selectedLocObj = locations.find((loc) => loc.code === selectedLocation);

  // Render summary table
  const renderSummaryRow = (summary: any) => {
    if (!summary) return <p>No summary data</p>;

    return (
      <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
        <table className="w-full text-left text-sm  text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3 text-center">Description</th>
              <th className="px-6 py-3 text-center">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2">Total Cash In</td>
              <td className="px-6 py-2">
                Rs. {(summary.totalCashIn ?? 0).toFixed(2)}
              </td>
            </tr>
            <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2">Total Cash Out</td>
              <td className="px-6 py-2">
                Rs. {(summary.totalCashOut ?? 0).toFixed(2)}
              </td>
            </tr>
            <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2">Total Returns</td>
              <td className="px-6 py-2">
                Rs. {(summary.totalReturns ?? 0).toFixed(2)}
              </td>
            </tr>
            <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2">Total Sales</td>
              <td className="px-6 py-2">
                Rs. {(summary.totalSales ?? 0).toFixed(2)}
              </td>
            </tr>
            <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2">Total Balance</td>
              <td className="px-6 py-2">
                Rs. {(summary.balance ?? 0).toFixed(2)}
              </td>
            </tr>
            {activeCashier !== "all" && (
              <>
                <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
                  <td className="px-6 py-2 font-medium text-gray-700 dark:text-gray-300">
                    Cashier Closing Balance
                  </td>
                  <td className="px-6 py-2 text-gray-900 dark:text-white">
                    Rs.{" "}
                    {(
                      selectedLocObj?.cashiers?.[activeCashier]?.cashierBalance
                        ?.amount ?? 0
                    ).toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
                  <td className="px-6 py-2 font-medium text-gray-700 dark:text-gray-300">
                    Balance Amount
                  </td>
                  <td className="px-6 py-2 text-gray-900 dark:text-white">
                    Rs.{" "}
                    {(
                      selectedLocObj?.cashiers?.[activeCashier]
                        ?.balanceAmount ?? 0
                    ).toFixed(2)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Render sales table
  const renderSalesTable = (sales: any[]) => (
    <div>
      <div
        id="sales-table"
        className="overflow-x-auto rounded-xl border dark:border-gray-700"
      >
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-2 text-left">Invoice</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Payment</th>
              <th className="px-4 py-2 text-left">Sales Type</th>
              <th className="px-4 py-2 text-right">Paid</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s, idx) => (
              <tr
                key={idx}
                className="cursor-pointer border-t bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={() => handleViewBalance(s.invoiceNumber, "SALES")}
              >
                <td className="px-4 py-2">{s.invoiceNumber}</td>
                <td className="px-4 py-2">
                  {s.customer?.titleDescription} {s.customer?.firstName}{" "}
                  {s.customer?.lastName}
                </td>
                <td className="px-4 py-2">{s.paymentTypeDescription}</td>
                <td className="px-4 py-2">{s.salesTypeDescription}</td>
                <td className="px-4 py-2 text-right">
                  {s.payAmount?.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  {s.totalAmount?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-2 mt-2 flex justify-end">
        <button
          onClick={() => handlePrint("sales-table")}
          className="rounded-xl bg-primary px-4 py-2 text-xs text-white hover:bg-hover md:text-sm"
        >
          Print Sales
        </button>
      </div>
    </div>
  );

  // Render returns table
  const renderReturnsTable = (returns: any[]) => (
    <div>
      <div
        id="return-table"
        className="overflow-x-auto rounded-xl border dark:border-gray-700"
      >
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-2 text-left">Invoice</th>
              <th className="px-4 py-2 text-left">Remark</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-right">Debit Amount</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r, idx) => (
              <tr
                key={idx}
                className="cursor-pointer border-t bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={() => handleViewBalance(r.invoiceNumber, "RETURNS")}
              >
                <td className="px-4 py-2">{r.invoiceNumber}</td>
                <td className="px-4 py-2">{r.remark || "Unavailable"}</td>
                <td className="px-4 py-2">
                  {r.customer?.titleDescription} {r.customer?.firstName}{" "}
                  {r.customer?.lastName}
                </td>
                <td className="px-4 py-2 text-right">
                  {r.debitAmount?.toFixed(2) ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-2 mt-2 flex justify-end">
        <button
          onClick={() => handlePrint("return-table")}
          className="rounded-xl bg-primary px-4 py-2 text-xs text-white hover:bg-hover md:text-sm"
        >
          Print Returns
        </button>
      </div>
    </div>
  );

  // Render cash in/out table
  const renderCashInOutTable = (inOuts: any[]) => (
    <div>
      <div
        id="cashInOut-table"
        className="overflow-x-auto rounded-xl border dark:border-gray-700"
      >
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {/* <th className="px-4 py-2">ID</th> */}
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Remark</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inOuts
              .filter(
                (entry) =>
                  entry?.amount !== null && entry?.amount !== undefined,
              )
              .map((entry, idx) => (
                <tr
                  key={idx}
                  className="border-t bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                >
                  <td className="px-4 py-2">{entry?.cashInOut}</td>
                  <td className="px-4 py-2">{entry?.cashInOutDescription}</td>
                  <td className="px-4 py-2">{entry?.remark}</td>
                  <td className="px-4 py-2 text-right">
                    {entry?.amount?.toFixed(2)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="mb-2 mt-2 flex justify-end">
        <button
          onClick={() => handlePrint("cashInOut-table")}
          className="rounded-xl bg-primary px-4 py-2 text-xs text-white hover:bg-hover md:text-sm"
        >
          Print Cash In/Out
        </button>
      </div>
    </div>
  );

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Cashier Balance Management" />

      <div className="mt-3 items-center gap-2 space-y-3 md:flex md:space-y-0">
        <div className="relative w-full">
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setActiveCashier("all");
            }}
            className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.description}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
        </div>

        <input
          type="date"
          value={inputFromDate}
          onChange={(e) => {
            const value = e.target.value;
            setInputFromDate(value);
            const [year, month, day] = value.split("-");
            setFromDate(`${year}/${month}/${day}`);
          }}
          placeholder="From Date"
          className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
        />
        <input
          type="date"
          value={inputToDate}
          onChange={(e) => {
            const value = e.target.value;
            setInputToDate(value);
            const [year, month, day] = value.split("-");
            setToDate(`${year}/${month}/${day}`);
          }}
          placeholder="To Date"
          className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <p>Loading...</p>
        ) : !selectedLocation ? (
          <>
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              Grand Summary
            </h3>
            {grandSummary ? renderSummaryRow(grandSummary) : <p>No data</p>}
          </>
        ) : (
          <>
            <span className="me-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              <House className="h-5 w-5" />
              {selectedLocObj?.description || selectedLocation}
            </span>

            {/* Cashier Tabs */}
            <div className="mb-6 mt-6 flex flex-wrap gap-2">
              <button
                className={getButtonClass("all")}
                onClick={() => setActiveCashier("all")}
              >
                All Counters
              </button>
              {selectedLocObj?.cashiers &&
                Object.keys(selectedLocObj.cashiers).map((cashier) => (
                  <button
                    key={cashier}
                    className={getButtonClass(cashier)}
                    onClick={() => {
                      setActiveCashier(cashier);
                      setSelectedSubTab((prev) => ({
                        ...prev,
                        [cashier]: "Total Summary",
                      }));
                    }}
                  >
                    {cashier}
                  </button>
                ))}
            </div>

            {/* Summary or Sub-tabs Content */}
            <div className="mt-4">
              {activeCashier === "all" ? (
                selectedLocObj?.summary ? (
                  renderSummaryRow(selectedLocObj.summary)
                ) : (
                  "No summary available"
                )
              ) : selectedLocObj?.cashiers &&
                selectedLocObj.cashiers[activeCashier] ? (
                <>
                  {/* Sub-tabs */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {["Total Summary", "Sales", "Returns", "Cash In/Out"].map(
                      (tab) => (
                        <button
                          key={tab}
                          className={getSubTabClass(tab, activeCashier)}
                          onClick={() =>
                            setSelectedSubTab((prev) => ({
                              ...prev,
                              [activeCashier]: tab,
                            }))
                          }
                        >
                          {tab}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Sub-tab content */}
                  {selectedSubTab[activeCashier] === "Sales" ? (
                    selectedLocObj.cashiers[activeCashier].sales?.length > 0 ? (
                      renderSalesTable(
                        selectedLocObj.cashiers[activeCashier].sales,
                      )
                    ) : (
                      <p>No sales found</p>
                    )
                  ) : selectedSubTab[activeCashier] === "Returns" ? (
                    selectedLocObj.cashiers[activeCashier].returns?.length >
                    0 ? (
                      renderReturnsTable(
                        selectedLocObj.cashiers[activeCashier].returns,
                      )
                    ) : (
                      <p>No returns found</p>
                    )
                  ) : selectedSubTab[activeCashier] === "Cash In/Out" ? (
                    selectedLocObj.cashiers[activeCashier].inOuts?.length >
                    0 ? (
                      renderCashInOutTable(
                        selectedLocObj.cashiers[activeCashier].inOuts,
                      )
                    ) : (
                      <p>No cash in/out records</p>
                    )
                  ) : (
                    renderSummaryRow(selectedLocObj.cashiers[activeCashier])
                  )}
                </>
              ) : (
                "No data for this cashier"
              )}
            </div>
          </>
        )}
      </div>
      {showSaleModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative m-2 max-h-[90vh] w-full max-w-7xl overflow-y-auto rounded-2xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {/* Close Icon Top-Right */}
            <button
              onClick={() => setShowSaleModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
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

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Sale Details
              </h2>
            </div>
            <div
              id="sales-details-table"
              className="hide-scrollbar overflow-x-auto rounded-xl border dark:border-gray-700"
            >
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-2">Item Code</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="no-print px-4 py-2 text-right">Item Cost</th>
                    <th className="px-4 py-2 text-right">Label Price</th>
                    <th className="no-print px-4 py-2 text-right">
                      Retail Price
                    </th>
                    <th className="no-print px-4 py-2 text-right">
                      Wholesale Price
                    </th>
                    <th className="px-4 py-2 text-right">Sales Price</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {saleDetails.map((detail, idx) => (
                    <tr
                      key={idx}
                      className="border-t bg-white  dark:border-gray-600 dark:bg-gray-800"
                    >
                      <td className="px-4 py-2">{detail.item?.code}</td>
                      <td className="px-4 py-2">{detail.item?.description}</td>
                      <td className="no-print px-4 py-2 text-right">
                        {detail.itemCost?.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {detail.lablePrice?.toFixed(2)}
                      </td>
                      <td className="no-print px-4 py-2 text-right">
                        {detail.retailPrice?.toFixed(2)}
                      </td>
                      <td className="no-print px-4 py-2 text-right">
                        {detail.wholesalePrice?.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {detail.salesPrice?.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">{detail.qty}</td>
                      <td className="px-4 py-2 text-right">
                        {detail.totalPrice?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-100 font-semibold dark:bg-gray-700">
                    <td className="px-4 py-2 text-left">Total</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="no-print"></td>
                    <td className="no-print"></td>
                    <td className="no-print"></td>
                    <td className="px-4 py-2 text-right">
                      {saleDetails.reduce((sum, d) => sum + (d.qty || 0), 0)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {saleDetails
                        .reduce((sum, d) => sum + (d.totalPrice || 0), 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mb-2 mt-2 flex justify-end">
              <button
                onClick={() => handlePrint("sales-details-table")}
                className="rounded-xl bg-primary px-4 py-2 text-xs text-white hover:bg-hover md:text-sm"
              >
                Print Sale Details
              </button>
            </div>
          </div>
        </div>
      )}
      {showReturnModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative m-2 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {/* Close Button */}
            <button
              onClick={() => setShowReturnModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
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

            {/* Modal Title */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Return Item Details
              </h2>
            </div>

            {/* Table */}
            <div
              id="returns-details-table"
              className="overflow-x-auto rounded-xl border dark:border-gray-700"
            >
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {returnDetails.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-t bg-white dark:border-gray-600 dark:bg-gray-800"
                    >
                      <td className="px-4 py-2">{item.id}</td>
                      <td className="px-4 py-2 text-right">{item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mb-2 mt-2 flex justify-end">
              <button
                onClick={() => handlePrint("return-details-table")}
                className="rounded-xl bg-primary px-4 py-2 text-xs text-white hover:bg-hover md:text-sm"
              >
                Print Return Details
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}

export default withAuth(Balance);
