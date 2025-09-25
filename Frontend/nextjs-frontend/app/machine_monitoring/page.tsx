

import MachineTimeline from "@/components/MachineTimeline";
import {supabase} from "@/app/lib/supabase";
import {RawRow, transformData} from "@/app/utils/transformData";


export default async function MachineMonitoring() {
    const { data, error } = await supabase
        .from("monitoring_data_202009")
        .select("timestamp, shot_time, machine_monitoring_poorten ( name )")
        .eq("machine_monitoring_poorten.visible", true)
        .order("timestamp", { ascending: true });

    if (error) {
        console.error(error);
        return <div>Error loading data</div>;
    }

    const datasets = transformData(data as RawRow[]);

    return (
        <main>
            <h1 className="text-xl font-bold mb-4">Machine Monitoring</h1>
            <MachineTimeline datasets={datasets} />
            <button></button>
        </main>
    );
}

