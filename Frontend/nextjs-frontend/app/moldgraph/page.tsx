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
    const [moldsToShowCount, setMoldsToShowCount] = useState(30);


    const handleStartDateChange = (date: string) => {
        setStartDate(date);

        // Automatically set endDate 6 days after startDate
        const start = new Date(date);
        const newEnd = new Date(start);
        newEnd.setDate(start.getDate() + 6);
        setEndDate(newEnd.toISOString().split("T")[0]);
    };

    const handleEndDateChange = (date: string) => {
        setEndDate(date);

        // Automatically set startDate 6 days before endDate
        const end = new Date(date);
        const newStart = new Date(end);
        newStart.setDate(end.getDate() - 6);
        setStartDate(newStart.toISOString().split("T")[0]);
    };


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
        <div className="flex">
            <Sidebar />
            
            <div className="flex-1 ml-0 md:ml-60">

            <div className="top-0 left-0 md:left-10 w-full bg-[#00A527] text-white p-2.5 z-50">
                    <p className="text-center font-medium"></p>
            </div>

            <div className="p-4 pt-6">
                <h2 className="text-[1.5rem] ml-5 font-semibold mb-4">Mold Production Chart</h2>

                {/*filtering by date - per week only/exactly*/}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h4 className="text-[1rem] ml-5">Select desired week: </h4>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2">
                        <div>
                            <label className="text-sm mr-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                className="border rounded px-2 py-1 w-32"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm mr-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => handleEndDateChange(e.target.value)}
                                className="border rounded px-2 py-1 w-32"
                            />
                        </div>
                    </div>
                    </div>
                </div>

                {/* top n input - max 15 */}
                {selectedMolds.length === 0 && (
                    <div className="mb-4 flex items-center gap-4">
                        <label className="text-sm ml-5">Show top </label>
                            <input
                            type="number"
                            min={1}
                            max={15}
                            value={topN}
                            onChange={(e) => setTopN(Number(e.target.value))}
                            className="border rounded px-2 py-1 w-16 text-center"
                        />
                           <span className="text-sm">molds</span>
                        
                    </div>
                )}

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {/*chart*/}
                {chartData ? (
                    <div className="w-full mx-auto" style={{ height: '500px' }}>
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
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
                    </div>
                ) : (
                    <p className="text-gray-500">Loading chart...</p>
                )}

                {/* search mold names */}
                <div className="flex flex-col gap-4">
                <div className="relative w-full sm:w-64">
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {availableMolds
                            .filter((m) => m.toLowerCase().includes(searchTerm.toLowerCase()))
                            .sort((a, b) => a.localeCompare(b))
                            .slice(0, moldsToShowCount) // Limit number of displayed molds
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

                     {/* View More button */}
                            {moldsToShowCount < availableMolds.length && (
                                <div className="mt-4 flex justify-center">
                                    <button
                                        className="bg-[#00A527] hover:bg-green-700 text-gray-200 hover:text-white
                                        focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center"
                                        onClick={() => setMoldsToShowCount((prev) => prev + 30)}
                                    >
                                        View More
                                    </button>
                                </div>
                            )}
                </div>
                </div>
            </div>
            </div>
        </div>
    );
}
