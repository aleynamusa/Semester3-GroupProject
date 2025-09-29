import MachineMonitoringTable from "../components/MachineMonitoringTable";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
      <header className="w-full border-b border-gray-200 dark:border-neutral-700 px-6 py-4 bg-white/70 dark:bg-neutral-800/70 backdrop-blur">
        <h1 className="text-xl font-semibold tracking-tight">
          Machine Monitoring Dashboard
        </h1>
      </header>
      <main className="flex-1 px-6 py-6 max-w-screen-xl w-full self-center">
        <MachineMonitoringTable />
      </main>
      <footer className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-neutral-700">
        © {new Date().getFullYear()} Machine Monitoring
      </footer>
    </div>
  );
}
