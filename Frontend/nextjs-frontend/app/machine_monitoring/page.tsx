"use client";
import MachineTimeline from "@/components/MachineTimeline";
import { supabase } from "@/app/lib/supabase";
import { RawRow, transformData } from "@/app/utils/transformData";
import { ProductionPopup } from "../../components/moldPopUp";
import { useState } from "react";
import { ProductionData } from "../types/index";


export default function MachineMonitoringPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div className="p-6">
      <button
        onClick={() => setIsPopupOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Show Production Data
      </button>

      <ProductionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
}
