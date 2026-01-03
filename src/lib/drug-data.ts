import Papa from 'papaparse';
import Fuse from 'fuse.js';

export interface Drug {
    id: string;
    name: string;
    classes: string;
    usage: string;
    side_effects: string;
    contraindications: string;
}

let drugs: Drug[] = [];
let fuse: Fuse<Drug>;

// This function fetches, parses, and initializes the search index.
// It's designed to run only once.
let isDataLoaded = false;
export const getDrugData = async (): Promise<void> => {
    if (isDataLoaded || typeof window === 'undefined') {
        return;
    }

    try {
        const response = await fetch('/Drug finder db w_o brands - deepseek_csv_20250915_dff2b8.csv');
        const csvText = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parsedData = results.data as any[];
                    drugs = parsedData.map((row, index) => ({
                        id: row.unii || `${row.name}-${index}`,
                        name: row.name || 'Unknown',
                        classes: row.classes || 'N/A',
                        usage: row.usage || 'N/A',
                        side_effects: row.side_effects || 'N/A',
                        contraindications: row.contraindications || 'N/A'
                    }));

                    // Initialize Fuse.js for fuzzy searching
                    fuse = new Fuse(drugs, {
                        keys: ['name'],
                        includeScore: true,
                        threshold: 0.4, // Adjust threshold for more/less strict matching
                        minMatchCharLength: 2,
                    });

                    isDataLoaded = true;
                    resolve();
                },
                error: (error) => {
                    console.error("CSV parsing error:", error);
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error("Failed to fetch or process drug data:", error);
        // Handle fetch error
        isDataLoaded = false;
    }
};

// This function performs the search on the initialized data.
export const searchDrugs = (query: string): Drug[] => {
    if (!isDataLoaded || !fuse) {
        console.warn("Drug data is not loaded yet.");
        return [];
    }
    const results = fuse.search(query);
    return results.map(result => result.item);
};

// Make sure to call getDrugData early in your app's lifecycle,
// for example in a top-level component's useEffect.
