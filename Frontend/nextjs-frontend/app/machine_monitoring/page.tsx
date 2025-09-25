import Sidebar from '../sidebar';
import { supabase } from '../lib/supabase'

export default async function MachineMonitoring() {
    console.log('Starting data fetch...')

    const { data, error } = await supabase
        .from('monitoring_data_202009')
        .select('*')

    console.log('Supabase response:', { data, error })

    if (error) {
        console.error('Error details:', error)
        return (
            <div>
                <Sidebar />
                <div>
                    <h1>Error occurred</h1>
                    <p>Error: {error.message}</p>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/*<Sidebar />*/}
            <div>
                <h1>Machine Monitoring</h1>
                <p>Records found: {data?.length || 0}</p>

                {!data || data.length === 0 ? (
                    <p>No data available in the table</p>
                ) : (
                    data.map((item, index) => (
                        <div key={item.id || index} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>

                            <p><strong>ID:</strong> {item.id || 'N/A'}</p>
                            <p><strong>Board:</strong> {item.board || 'N/A'}</p>
                            <p><strong>Port:</strong> {item.port || 'N/A'}</p>
                            {/* Show all fields for debugging */}
                            <details>
                                <summary>Raw data</summary>
                                <pre>{JSON.stringify(item, null, 2)}</pre>
                            </details>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

