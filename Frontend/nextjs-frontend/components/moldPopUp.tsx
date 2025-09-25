import { useState, useEffect } from "react";
//import { searchProductionByMachine } from '../lib/production'
import { supabase } from "@/app/lib/supabase";
import { ProductionData } from "../app/types/index";

const fetchProductionData = async (
  searchName: string = ""
): Promise<ProductionData[]> => {
  const { data, error } = await supabase
    .from("production_data")
    .select(
      `
      id,
      start_date,
      end_date,
      amount,
      port,
      board,
      treeview_id (
        id,
        name,
        description
      ),
      treeview2_id (
        id,
        name,
        description
      )
    `
    )
    .ilike("treeview_id.name", `%${searchName}%`); // search by machine name

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    start_date: row.start_date,
    end_date: row.end_date,
    amount: row.amount,
    port: row.port,
    board: row.board,
    treeview_id: row.treeview_id?.[0] ?? null,
    treeview2_id: row.treeview2_id?.[0] ?? null,
  }));
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductionPopup: React.FC<Props> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<ProductionData[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProductionData(search).then(setData).catch(console.error);
    }
  }, [isOpen, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] max-h-[80vh] overflow-auto">
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Search by machine name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full mr-2"
          />
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>

        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Machine</th>
              <th className="border px-2 py-1">Secondary Machine</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Port</th>
              <th className="border px-2 py-1">Board</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td className="border px-2 py-1">{row.id}</td>
                <td className="border px-2 py-1">
                  {row.treeview_id?.name || "-"}
                </td>
                <td className="border px-2 py-1">
                  {row.treeview2_id?.name || "-"}
                </td>
                <td className="border px-2 py-1">{row.amount}</td>
                <td className="border px-2 py-1">{row.port}</td>
                <td className="border px-2 py-1">{row.board}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
