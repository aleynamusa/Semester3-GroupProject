"use client";

import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { supabase } from "@/app/lib/supabase";
import Sidebar from "@/app/sidebar";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type MoldDailySummary = {
    mold_id: number;
    mold_name: string;
    operation_date: string;
    total_products: number;
};

export default function MoldProductionChart() {
    const [chartData, setChartData] = useState<ChartData<"line", number[], string>>();
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("2020-09-24");
    const [endDate, setEndDate] = useState("2020-09-30");
    const [error, setError] = useState("");

    const fetchChartData = async () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;

        if (diff !== 7) {
            setError("Date range must be exactly 7 days.");
            return;
        } else {
            setError("");
        }

        const { data, error } = await supabase
            .from("mold_daily_summary")
            .select("*")
            .gte("operation_date", startDate)
            .lte("operation_date", endDate)
            .order("operation_date", { ascending: true });

        if (error) {
            console.error(error);
            return;
        }

        const typedData = data as MoldDailySummary[];
        if (!typedData) return;

        const filteredData = typedData.filter((d) =>
            d.mold_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Take first 6 molds if too many
        const molds = Array.from(new Set(filteredData.map((d) => d.mold_name))).slice(0, 6);

        const labels = [...new Set(filteredData.map((d) => d.operation_date))];

        const datasets = molds.map((mold, idx) => ({
            label: mold,
            data: labels.map((date) => {
                const record = filteredData.find(
                    (d) => d.mold_name === mold && d.operation_date === date
                );
                return record ? record.total_products : 0;
            }),
            borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
            backgroundColor: `hsl(${(idx * 60) % 360}, 70%, 70%)`,
            tension: 0.3,
        }));

        setChartData({ labels, datasets });
    };

    useEffect(() => {
        fetchChartData();
    }, [searchTerm, startDate, endDate]);

    return (
        <div>
            <Sidebar />
            <div style={{ marginLeft: "16.666%" }} className="p-4">

                <h2  className="text-xl font-semibold mb-4">Mold Production Chart</h2>

                <h4 className="text-xl font-semibold mb-4">Filters</h4>
                <div className="flex flex-col md:flex-row gap-4 mb-4 items-start">

                    <div className="relative w-64 mt-4">
                        <input
                            type="text"
                            placeholder="Search mold by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <i className="fa fa-search" />
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <div>
                            <label className="block text-sm">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border rounded px-3 py-1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border rounded px-3 py-1"
                            />
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {chartData ? (
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: "bottom" },
                                title: { display: true, text: "Products per Mold per Day" },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            return `${context.dataset.label}: ${context.formattedValue}`;
                                        },
                                    },
                                },
                            },
                            scales: {
                                x: { title: { display: true, text: "Date" } },
                                y: { title: { display: true, text: "Total Products" } },
                            },
                        }}
                    />
                ) : (
                    <p>Loading chart...</p>
                )}
            </div>
        </div>

    );
}
