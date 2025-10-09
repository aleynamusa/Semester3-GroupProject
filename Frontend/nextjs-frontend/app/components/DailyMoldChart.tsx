"use client";

//HOW TO USE IT
// <SingleMoldChart
//     moldName="10040" get the name of the mold from mold health
//     startDate="2020-09-24" time period of last week maybe
//     endDate="2020-09-30"
// />

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

type MoldDailySummary = {
    mold_id: number;
    mold_name: string;
    operation_date: string;
    total_products: number;
};

type Props = {
    moldName: string; // the selected mold
    startDate: string;
    endDate: string;
};

export default function DailyMoldChart({ moldName, startDate, endDate }: Props) {
    const [chartData, setChartData] = useState<ChartData<"line", number[], string>>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
            setLoading(true);
            setError(null);

        const { data, error } = await createClient()
            .from("mold_daily_summary")
            .select("*")
            .eq("mold_name", moldName)
            .gte("operation_date", startDate)
            .lte("operation_date", endDate)
            .order("operation_date", { ascending: true });

        const typedData = data as MoldDailySummary[];
        if (!typedData || typedData.length === 0) {
            setError("No data found for this mold and date range");
            setLoading(false);
            return;
        };

        const labels = typedData.map((d) => d.operation_date);
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
    }, [moldName, startDate, endDate]);

    if (loading) return <p>Loading chart...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return chartData && chartData.datasets[0].data.length > 0 ? (
        <div className="w-full h-[500px]" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
            <Line
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "bottom" },
                        title: { display: true, text: `Production for ${moldName}`, font: { size: 18 } },
                        datalabels: {
                            align: "end",
                            anchor: "start",
                            font: { size: 14, weight: "bold" },
                            formatter: (value, ctx) => (ctx.dataIndex === 0 ? ctx.dataset.label : ""),
                            color: (ctx) => (ctx.dataset.borderColor as string) || "black",
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
        <div className="w-full h-[500px] flex items-center justify-center text-gray-500 font-medium">
        No production data available for this week.
        </div>
    );
}
