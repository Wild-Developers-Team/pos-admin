"use client"; // Ensure it runs only on the client side
import React, { useEffect } from "react";

export default function DeathBalance() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("apexcharts").then((ApexCharts) => {
        const chartElement = document.getElementById("death-chart");

        // Ensure no duplicate charts are created
        if (chartElement && !chartElement.getAttribute("data-initialized")) {
          chartElement.setAttribute("data-initialized", "true");

          const chart = new ApexCharts.default(chartElement, {
            series: [35.1, 23.5],
            colors: ["#1C64F2", "#16BDCA"],
            chart: {
              height: 320,
              width: "100%",
              type: "donut",
            },
            stroke: {
              colors: ["transparent"],
              lineCap: "round",
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    name: {
                      show: true,
                      fontFamily: "Inter, sans-serif",
                      offsetY: 20,
                    },
                    total: {
                      showAlways: true,
                      show: true,
                      label: "Death Donation Balance",
                      fontFamily: "Inter, sans-serif",
                      formatter: function (w: {
                        globals: { seriesTotals: number[] };
                      }) {
                        return `23.5%`;
                      },
                    },
                    value: {
                      show: true,
                      fontFamily: "Inter, sans-serif",
                      offsetY: -20,
                      formatter: function (value: number) {
                        return `${value}%`;
                      },
                    },
                  },
                  size: "80%",
                },
              },
            },
            grid: {
              padding: {
                top: -2,
              },
            },
            labels: ["Utilized", "Claim Balance"],
            dataLabels: {
              enabled: false,
            },
            legend: {
              position: "bottom",
              fontFamily: "Inter, sans-serif",
            },
            yaxis: {
              labels: {
                formatter: function (value: number) {
                  return `${value}%`;
                },
              },
            },
            xaxis: {
              labels: {
                formatter: function (value: number) {
                  return `${value}%`;
                },
              },
              axisTicks: {
                show: false,
              },
              axisBorder: {
                show: false,
              },
            },
          });

          chart.render();

          return () => {
            chart.destroy(); // Cleanup on unmount
            chartElement.removeAttribute("data-initialized"); // Reset attribute
          };
        }
      });
    }
  }, []);

  return (
    <div className="h-full w-full rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 md:p-6">
      <div className="mb-3 flex justify-between">
        <div className="flex items-center justify-center">
          <h5 className="pe-1 text-xl font-bold leading-none text-gray-900 dark:text-white">
            Death Donation Balance Utilization
          </h5>
        </div>
      </div>
      <div className="mb-2 grid grid-cols-2 gap-3">
        <dl className="flex h-[78px] flex-col items-center justify-center rounded-lg bg-teal-50 dark:bg-gray-600">
          <dt className="mb-1 flex items-center justify-center text-sm font-medium text-teal-600 dark:text-teal-300">
            LKR 10,000.00
          </dt>
          <dd className="text-sm font-medium text-teal-600 dark:text-teal-300">
            Claim Balance
          </dd>
        </dl>
        <dl className="flex h-[78px] flex-col items-center justify-center rounded-lg bg-blue-50 dark:bg-gray-600">
          <dt className="mb-1 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-300">
            LKR 5,000.00
          </dt>
          <dd className="text-sm font-medium text-blue-600 dark:text-blue-300">
            Utilized Balance
          </dd>
        </dl>
      </div>

      <div className="py-6">
        <div id="death-chart"></div>{" "}
        {/* Ensure only one chart container exists */}
      </div>
      <div className="text-center font-semibold">
        All death donation balance and utilization
      </div>
    </div>
  );
}
