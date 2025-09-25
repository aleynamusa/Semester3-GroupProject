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
    const [startDate, setStartDate] = useState("2020-09-24");
    const [endDate, setEndDate] = useState("2020-09-30");
    const [error, setError] = useState("");
    const [availableMolds, setAvailableMolds] = useState<string[]>([]);
    const [selectedMolds, setSelectedMolds] = useState<string[]>([]);
    const [topN, setTopN] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");

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

        // Get all unique molds in the date range
        const allMolds = Array.from(new Set(typedData.map((d) => d.mold_name)));
        setAvailableMolds(allMolds);


        let moldsToShow = selectedMolds;

        if (moldsToShow.length === 0) {
            // If none selected → show top N performers
            const totalsByMold: Record<string, number> = {};
            typedData.forEach((d) => {
                totalsByMold[d.mold_name] = (totalsByMold[d.mold_name] || 0) + d.total_products;
            });

            moldsToShow = Object.entries(totalsByMold)
                .sort((a, b) => b[1] - a[1])
                .slice(0, topN) // top N
                .map(([mold]) => mold);
        }

        const labels = [...new Set(typedData.map((d) => d.operation_date))];

        const datasets = moldsToShow.map((mold, idx) => ({
            label: mold,
            data: labels.map((date) => {
                const record = typedData.find(
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
    }, [startDate, endDate, selectedMolds, topN]);

    const toggleMold = (name: string) => {
        setSelectedMolds((prev) =>
            prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
        );
    };

    return (
        <div>
            <Sidebar />
            <div style={{ marginLeft: "16.666%" }} className="p-4">
                <h2 className="text-xl font-semibold mb-4">Mold Production Chart</h2>

                {/*filtering by date - per week only/exactly*/}
                <h4 className="text-xl font-semibold mb-4">Filters</h4>
                <div className="flex flex-col md:flex-row gap-4 mb-4 items-start">
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

                {/* top n input - max 15 */}
                {selectedMolds.length === 0 && (
                    <div className="mb-4">
                        <label className="block text-sm mb-1">Show top N molds</label>
                        <input
                            type="number"
                            min={1}
                            max={15}
                            value={topN}
                            onChange={(e) => setTopN(Number(e.target.value))}
                            className="border rounded px-3 py-1 w-24"
                        />
                    </div>
                )}

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {/*chart*/}
                {chartData ? (
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: "bottom" },
                                title: { display: true, text: "Products per Mold per Week" },
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
                    <p className="text-gray-500">Loading chart...</p>
                )}

                {/* search mold names */}
                <div className="relative w-64 mb-4">
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

                {/* mold selection */}
                <div className="mb-4">
                    <h4 className="font-semibold mb-2">
                        Select molds (leave empty to show top performers):
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {availableMolds
                            .filter((m) => m.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((mold) => (
                                <label key={mold} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedMolds.includes(mold)}
                                        onChange={() => toggleMold(mold)}
                                    />
                                    {mold}
                                </label>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
