"use client";
import { useState, useEffect } from "react";
// import { searchProductionByMachine } from '../lib/production'
import { supabase } from "@/app/lib/supabase";
import { ProductionData } from "../app/types/index";

//=====================================================================================
// import { ProductionPopup } from './ProductionPopup' - that's how you call the PopUp
//=====================================================================================

interface ProductionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductionPopup({ isOpen, onClose }: ProductionPopupProps) {
  const [data, setData] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Uncomment and use this when you want to fetch real data
  /*
  useEffect(() => {
    if (!isOpen) return;

    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("production_data")
        .select(
          `
          id,
          start_date,
          end_date,
          amount,
          board,
          port,
          treeview_id ( id, name, description ),
          treeview2_id ( id, name, description ),
          machine_monitoring_poorten ( id, name, visible )
        `
        )
        .limit(20);

      if (error) {
        console.error("Supabase error:", error.message);
        setLoading(false);
        return;
      }

      setData(data as ProductionData[]);
      setLoading(false);
    }

    fetchData();
  }, [isOpen]);
  */

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-11/12 max-w-2xl mx-auto overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Production Data</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* {loading ? (
          <p className="text-gray-500 text-center py-8">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No production data found.</p>
        ) : ( */}
          <ul className="space-y-4">
            {/* {data.map((item) => ( */}
              <li
                // key={item.id}
                className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">
                    {/* {item.start_date} - {item.end_date} */}
                    10.09.2020 - 20.09.2020
                  </span>
                  <span className="text-sm text-gray-500">"Unknown Board"</span>
                </div>
                <p className="text-gray-600 mb-1">
                  <strong>Machine:</strong>"N/A"
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Treeview 1:</strong> "N/A"
                </p>
                <p className="text-gray-600">
                  <strong>Treeview 2:</strong> "N/A"
                </p>
              </li>
            {/* ))} */}
          </ul>
        {/* )} */}
      </div>
    </div>
  );
}
