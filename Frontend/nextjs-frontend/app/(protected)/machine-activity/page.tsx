import Sidebar from "@/app/components/sidebar";
import ActivityComponent from "@/app/components/ActivityComponent";

export default function Home() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-60">
        {/* Header */}
        <div className="top-0 left-0 md:left-10 w-full bg-[#00A527] text-white p-2.5 z-50">
        
        </div>

        {/* Page Content */}
        <div className="p-4 pt-6">
          <h2 className="text-[1.5rem] ml-5 font-semibold mb-4">
            Machine Activity 
          </h2>

          {/* Main Table */}
          <div className="bg-black">
            <ActivityComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
