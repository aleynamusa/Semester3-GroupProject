"use client";

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Tooltip,
    Legend,
} from "chart.js";
import {Dataset} from "@/app/utils/transformData";


ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend
);

interface Props {
    datasets: Dataset[];
}

export default function MachineTimeline({ datasets }: Props) {
    const data = { datasets };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "bottom" as const },
        },
        scales: {
            x: { title: { display: true, text: "Time (HH:mm)" } },
            y: {
                ticks: {
                    callback: function (value: number | string) {
                        return datasets[Number(value) - 1]?.label || "";
                    },
                },
                title: { display: true, text: "Machines" },
            },
        },
    };

    return <Line data={data} options={options} />;
}
