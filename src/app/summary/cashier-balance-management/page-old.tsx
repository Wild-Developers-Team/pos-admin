"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useEffect, useState } from "react";
import { getSessionData } from "@/utils/session";
import { postLoginRequest } from "@/services/api.service";
import { ISummary } from "@/types";
import { FILTERLIST, REFDATA } from "@/utils/apiMessage";
import { showErrorAlert, showSuccessAlert } from "@/utils/alert";
import withAuth from "@/utils/withAuth";
import { ChevronDown, House } from "lucide-react";

function Balance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balanceList, setBalanceList] = useState<ISummary[]>([]);

  const [privileges, setPrivileges] = useState({
    add: false,
    update: false,
    view: false,
    search: false,
    delete: false,
    useritemPrivilegeAssign: false,
  });

  // locations is an array of {code, description, summary?, cashiers?}
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

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [inputFromDate, setInputFromDate] = useState("");
  const [inputToDate, setInputToDate] = useState("");

  // Grand summary (when no location selected)
  const [grandSummary, setGrandSummary] = useState<any>(null);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const formattedForInput = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD for <input type="date" />
    const formattedForAPI = `${yyyy}/${mm}/${dd}`; // YYYY/MM/DD for API

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
        // response.data.locations now an array of location objects
        setLocations(response.data.locations || []);
        setGrandSummary(response.data.grandSummary || null);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch balance data filtered by date (and optionally location handled by UI)
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

  // Helper to style active/inactive buttons
  const getButtonClass = (key: string) => {
    return `rounded-xl px-4 py-2 text-sm font-semibold ${
      activeCashier === key
        ? "bg-primary text-white"
        : "bg-gray-200 text-gray-700 hover:bg-primary hover:text-white dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-primary dark:hover:text-white"
    }`;
  };

  // Find the currently selected location object from array by code
  const selectedLocObj = locations.find((loc) => loc.code === selectedLocation);

  // Render the summary row for either location summary or cashier summary
  const renderSummaryRow = (summary: any, cashiers?: Record<string, any>) => {
    if (!summary) return <p>No summary data</p>;

    return (
      <div className="overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3 text-center">Description</th>
              <th className="px-6 py-3 text-center">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2.5">Total Returns</td>
              <td className="px-6 py-2.5">{summary.totalReturns ?? 0}</td>
            </tr>
            <tr className="border-b bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2.5">Total Cash In</td>
              <td className="px-6 py-2.5">{summary.totalCashIn ?? 0}</td>
            </tr>
            <tr className="border-b bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2.5">Balance</td>
              <td className="px-6 py-2.5">{summary.balance ?? 0}</td>
            </tr>
            <tr className="border-b bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2.5">Total Sales</td>
              <td className="px-6 py-2.5">{summary.totalSales ?? 0}</td>
            </tr>
            <tr className=" bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2.5">Total Cash Out</td>
              <td className="px-6 py-2.5">{summary.totalCashOut ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

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
            const value = e.target.value; // YYYY-MM-DD
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

            {/* Tabs as buttons */}
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
                    onClick={() => setActiveCashier(cashier)}
                  >
                    {cashier}
                  </button>
                ))}
            </div>

            {/* Summary Table */}
            <div className="mt-4">
              {activeCashier === "all"
                ? selectedLocObj?.summary
                  ? renderSummaryRow(
                      selectedLocObj.summary,
                      selectedLocObj.cashiers,
                    )
                  : "No summary available"
                : selectedLocObj?.cashiers &&
                    selectedLocObj.cashiers[activeCashier]
                  ? renderSummaryRow(
                      selectedLocObj.cashiers[activeCashier],
                      selectedLocObj.cashiers,
                    )
                  : "No data for this cashier"}
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}

export default withAuth(Balance);
