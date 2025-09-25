import dayjs from "dayjs";

export interface RawRow {
    timestamp: string;
    shot_time: number;
    machine_monitoring_poorten: { name: string }[];
}

export interface Dataset {
    label: string;
    data: { x: string; y: number | null }[];
    borderColor: string;
    backgroundColor: string;
    showLine: boolean;
    spanGaps: boolean;
}

export function transformData(raw: RawRow[]): Dataset[] {
    const machines: Record<string, { x: string; y: number | null }[]> = {};

    raw.forEach((row) => {
        const name = row.machine_monitoring_poorten[0]?.name;
        if (!machines[name]) {
            machines[name] = [];
        }

        machines[name].push({
            x: dayjs(row.timestamp).format("HH:mm"),
            y: row.shot_time > 0 ? 1 : null, // working → 1, idle → null
        });
    });

    return Object.keys(machines).map((name, idx) => ({
        label: name,
        data: machines[name].map((d) => ({ x: d.x, y: idx + 1 })),
        borderColor: "blue",
        backgroundColor: "blue",
        showLine: true,
        spanGaps: true,
    }));
}