"use client";
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
    </DefaultLayout>
  );
}

export default withAuth(Home);
