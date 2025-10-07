"use client";

import { useEffect, useState, useCallback } from "react";
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
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Line } from "react-chartjs-2";
import { createClient } from "@/lib/supabase/client";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

type MoldWeeklySummary = {
    mold_id: number;
    mold_name: string;
    operation_week: string; // start of the week
    total_products: number;
};

type Props = {
    moldName: string;
    startDate: string;
    endDate: string;
};

export default function WeeklyMoldChart({ moldName, startDate, endDate }: Props) {
    const [chartData, setChartData] = useState<ChartData<"line", number[], string>>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const toWeekStart = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay(); // 0=Sunday, 1=Monday,...
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    d.setDate(d.getDate() + diff);
     return d.toISOString().split("T")[0];
};

const start = toWeekStart(startDate);
const end = toWeekStart(endDate);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await createClient()
            .from("mold_weekly_summary")
            .select("*")
            .eq("mold_name", moldName)
            .gte("operation_week", start)
            .lte("operation_week", end)
            .order("operation_week", { ascending: true });

        if (error) {
            console.error(error);
            setError("Failed to load data");
            setLoading(false);
            return;
        }

        const typedData = data as MoldWeeklySummary[];
        if (!typedData || typedData.length === 0) {
            setError("No data found for this mold and date range");
            setLoading(false);
            return;
        }

        // 🗓️ Format week ranges (start → end)
        const labels = typedData.map((d) => {
            const start = new Date(d.operation_week);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            const format = (date: Date) =>
                date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                });

            return `${format(start)} – ${format(end)}`;
        });

        const dataset = {
            label: moldName,
            data: typedData.map((d) => d.total_products),
            borderColor: "hsl(200,70%,50%)",
            backgroundColor: "hsl(200,70%,70%)",
            tension: 0.3,
            fill: false,
        };

        setChartData({ labels, datasets: [dataset] });
        setLoading(false);
    }, [moldName, startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <p>Loading chart...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!chartData) return <p>No chart data available.</p>;

    return (
        <div className="w-full h-[500px]">
            <Line
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "bottom" },
                        title: {
                            display: true,
                            text: `Weekly Production for ${moldName}`,
                            font: { size: 18 },
                        },
                        datalabels: {
                            align: "end",
                            anchor: "end",
                            font: { size: 12, weight: "bold" },
                            formatter: (value) => value.toString(),
                            color: "hsl(200,70%,30%)",
                        },
                    },
                    scales: {
                        x: {
                            title: { display: true, text: "Week Range" },
                            ticks: { maxRotation: 0, minRotation: 0 },
                        },
                        y: {
                            title: { display: true, text: "Total Products" },
                        },
                    },
                }}
            />
        </div>
    );
}