"use client";

//HOW TO USE IT
// <SingleMoldChart
//     moldName="10040" get the name of the mold from mold health
//     startDate="2020-09-24" time period of last week maybe
//     endDate="2020-09-30"
// />

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

export default function SingleMoldChart({ moldName, startDate, endDate }: Props) {
    const [chartData, setChartData] = useState<ChartData<"line", number[], string>>();

    const fetchData = async () => {
        const { data, error } = await createClient()
            .from("mold_daily_summary")
            .select("*")
            .eq("mold_name", moldName)
            .gte("operation_date", startDate)
            .lte("operation_date", endDate)
            .order("operation_date", { ascending: true });

        if (error) {
            console.error(error);
            return;
        }

        const typedData = data as MoldDailySummary[];
        if (!typedData || typedData.length === 0) return;

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
    };

    useEffect(() => {
        fetchData();
    }, [moldName, startDate, endDate]);

    return chartData ? (
        <div className="w-full h-[500px]">
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
        <p>Loading chart...</p>
    );
}
