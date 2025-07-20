"use client";
import React, { useEffect } from "react";
import Link from "next/link";

export default function AllClaim() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("apexcharts").then((ApexCharts) => {
        const chartElement = document.getElementById("radial-chart");

        // Ensure no duplicate charts
        if (chartElement && !chartElement.getAttribute("data-initialized")) {
          chartElement.setAttribute("data-initialized", "true");

          const chart = new ApexCharts.default(chartElement, {
            series: [90, 85, 70],
            colors: ["#1C64F2", "#16BDCA", "#FDBA8C"],
            chart: {
              height: 350,
              width: "100%",
              type: "radialBar",
              sparkline: {
                enabled: true,
              },
            },
            plotOptions: {
              radialBar: {
                track: {
                  background: "#E5E7EB",
                },
                dataLabels: {
                  show: false,
                },
                hollow: {
                  margin: 0,
                  size: "32%",
                },
              },
            },
            grid: {
              show: false,
              strokeDashArray: 4,
              padding: {
                left: 2,
                right: 2,
                top: -23,
                bottom: -20,
              },
            },
            labels: ["Done", "In progress", "Reject"],
            legend: {
              show: true,
              position: "bottom",
              fontFamily: "Inter, sans-serif",
            },
            tooltip: {
              enabled: true,
              x: {
                show: false,
              },
            },
            yaxis: {
              show: false,
              labels: {
                formatter: function (value: string) {
                  return value + "%";
                },
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
    <div className="w-full rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 md:p-6">
      <div className="mb-3 flex justify-between">
        <div className="flex items-center">
          <div className="flex items-center justify-center">
            <h5 className="pe-1 text-xl font-bold leading-none text-gray-900 dark:text-white">
              Your all claims progress
            </h5>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
        <div className="mb-2 grid grid-cols-3 gap-3">
          <dl className="flex h-[78px] flex-col items-center justify-center rounded-lg bg-teal-50 dark:bg-gray-600">
            <dt className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-600 dark:bg-gray-500 dark:text-teal-300">
              23
            </dt>
            <dd className="text-sm font-medium text-teal-600 dark:text-teal-300">
              In progress
            </dd>
          </dl>
          <dl className="flex h-[78px] flex-col items-center justify-center rounded-lg bg-blue-50 dark:bg-gray-600">
            <dt className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-gray-500 dark:text-blue-300">
              64
            </dt>
            <dd className="text-sm font-medium text-blue-600 dark:text-blue-300">
              Done
            </dd>
          </dl>
          <dl className="flex h-[78px] flex-col items-center justify-center rounded-lg bg-orange-50 dark:bg-gray-600">
            <dt className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600 dark:bg-gray-500 dark:text-orange-300">
              12
            </dt>
            <dd className="text-sm font-medium text-orange-600 dark:text-orange-300">
              Reject
            </dd>
          </dl>
        </div>
        <Link href="/claim/viewClaim">
          <button
            data-collapse-toggle="more-details"
            type="button"
            className="inline-flex items-center text-xs font-medium text-gray-500 hover:underline dark:text-gray-400"
          >
            Show more details{" "}
          </button>
        </Link>
      </div>

      <div className="py-6">
        <div id="radial-chart"></div>{" "}
        {/* Ensure only one chart container exists */}
      </div>
    </div>
  );
}
