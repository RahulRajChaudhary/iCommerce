"use client";
import React from "react";
import Chart, { Props } from "react-apexcharts";
import Box from "../box";

export const SalesChart = ({
  ordersData,
}: {
  ordersData?: {
    month: string;
    count: number;
  }[];
}) => {
  const chartSeries: Props["series"] = [
    {
      name: "Sales",
      data: ordersData?.map((data) => data.count) || [
        31, 40, 28, 51, 42, 109, 100,
      ],
    },
  ];

  const chartOptions: Props["options"] = {
    chart: {
      type: "area",
      animations: {
        // @ts-ignore
        easing: "linear",
        speed: 300,
      },
      fontFamily: "Inter, sans-serif",
      foreColor: "#ECEDEE",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    xaxis: {
      categories: ordersData?.map((data) =>
        new Date(data.month).toLocaleDateString("default", {
          month: "short",
        })
      ) || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      labels: {
        show: true,
        style: {
          colors: "#9ba1a6",
          fontFamily: "Inter, sans-serif",
        },
      },
      axisBorder: {
        show: true,
        color: "#ffffff26",
      },
      axisTicks: {
        show: false,
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: {
      show: false,
    },
    tooltip: {
      enabled: true,
      x: { show: false },
      y: {
        formatter: (value: number) => `${value}`,
        title: {
          formatter: () => "",
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 0,
    },
    dataLabels: {
      enabled: false,
    },
  };

  return (
    <div className="">
      <Box
        css={{
          width: "100%",
          zIndex: 5,
        }}
        className="text-black rounded-xl"
      >
        <div id="chart">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={425}
          />
        </div>
      </Box>
    </div>
  );
};