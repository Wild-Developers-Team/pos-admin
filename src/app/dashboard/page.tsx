"use client";
import Chart from "@/components/Chart/chart";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import withAuth from "@/utils/withAuth";
import {
  ShoppingCart,
  PackageCheck,
  Users,
  DollarSign,
  Warehouse,
  FileText,
  Activity,
  CalendarClock,
  Eye,
  Trash2,
  MapPin,
} from "lucide-react";

function Home() {
  const cards = [
    {
      title: "Total Sales",
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      value: "$12,345",
    },
    {
      title: "Orders",
      icon: <ShoppingCart className="h-6 w-6 text-primary" />,
      value: "320",
    },
    {
      title: "Products",
      icon: <PackageCheck className="h-6 w-6 text-primary" />,
      value: "150",
    },
    {
      title: "Customers",
      icon: <Users className="h-6 w-6 text-primary" />,
      value: "450",
    },
    {
      title: "Inventory Value",
      icon: <Warehouse className="h-6 w-6 text-primary" />,
      value: "$23,500",
    },
    {
      title: "Invoices Generated",
      icon: <FileText className="h-6 w-6 text-primary" />,
      value: "87",
    },
    {
      title: "System Activity",
      icon: <Activity className="h-6 w-6 text-primary" />,
      value: "Normal",
    },
    {
      title: "Last Sync",
      icon: <CalendarClock className="h-6 w-6 text-primary" />,
      value: "5 min ago",
    },
  ];

  const data = [
    {
      id: "TRX001",
      date: "2025-07-18",
      from: "Warehouse A",
      to: "Shop B",
      items: 12,
      total: "Rs. 35,000",
    },
    {
      id: "TRX002",
      date: "2025-07-17",
      from: "Main Store",
      to: "Outlet 3",
      items: 8,
      total: "Rs. 21,400",
    },
    {
      id: "TRX003",
      date: "2025-07-17",
      from: "Main Store",
      to: "Outlet 3",
      items: 8,
      total: "Rs. 21,400",
    },
    {
      id: "TRX004",
      date: "2025-07-17",
      from: "Main Store",
      to: "Outlet 3",
      items: 8,
      total: "Rs. 21,400",
    },
    {
      id: "TRX005",
      date: "2025-07-17",
      from: "Main Store",
      to: "Outlet 3",
      items: 8,
      total: "Rs. 21,400",
    },
  ];

  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 gap-6  md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-800">
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        {/* Left: Latest Customers */}
        <div className="flex w-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8 md:w-1/2">
          <div className="mb-4 flex items-center justify-between">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
              Latest Customers
            </h5>
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              View all
            </a>
          </div>
          <div className="flow-root flex-grow">
            <ul
              role="list"
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              <li className="py-3 sm:py-4">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Neil Sims
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $320
                  </div>
                </div>
              </li>
              <li className="py-3 sm:py-4">
                <div className="flex items-center ">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Bonnie Green
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $3467
                  </div>
                </div>
              </li>
              <li className="py-3 sm:py-4">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Michael Gough
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $67
                  </div>
                </div>
              </li>
              <li className="py-3 sm:py-4">
                <div className="flex items-center ">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Lana Byrd
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $367
                  </div>
                </div>
              </li>
              <li className="py-3 sm:py-4">
                <div className="flex items-center ">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Jhone Break
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $367
                  </div>
                </div>
              </li>
              <li className="pb-0 pt-3 sm:pt-4">
                <div className="flex items-center ">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Thomes Lean
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $2367
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        {/* Right Side */}
        <Chart />
      </div>
    </DefaultLayout>
  );
}

export default withAuth(Home);
