const { create, insert, search } = require('@orama/orama');
const { pipeline, env } = require('@huggingface/transformers');

// Configure Transformers.js for serverless
env.allowLocalModels = false;
env.useBrowserCache = false;
// Note: Depending on Catalyst's permissions, it might need to download to memory or /tmp

let extractor = null;
let db = null;
let initialized = false;

// Mock database of FIRs to index for the Copilot RAG
const mockFIRs = [
    { id: 'FIR-2026-001', description: 'Armed robbery at the downtown jewelry store. Suspect wore a red mask and escaped in a black sedan.', date: '2026-06-15' },
    { id: 'FIR-2026-002', description: 'Vehicle theft reported in Koramangala. A white Honda Civic was stolen from the parking lot.', date: '2026-06-18' },
    { id: 'FIR-2026-003', description: 'Assault incident near MG Road pub. Two individuals involved in a physical altercation.', date: '2026-06-20' },
    { id: 'FIR-2026-004', description: 'Cyber fraud reported. Victim lost 50k to a phishing scam involving a fake bank app.', date: '2026-07-01' },
    { id: 'FIR-2026-005', description: 'Mugging reported in Indiranagar. Two suspects on a bike snatched a gold chain.', date: '2026-07-03' }
];

async function initCopilot() {
    if (initialized) return;

    try {
        // 1. Initialize Orama Vector DB
        db = await create({
            schema: {
                id: 'string',
                description: 'string',
                date: 'string',
                embedding: 'vector[384]' // all-MiniLM-L6-v2 outputs 384 dimensions
            }
        });

        // 2. Load the embedding model
        console.log("Loading embedding model (all-MiniLM-L6-v2)...");
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

        // 3. Index the mock FIRs
        console.log("Indexing FIRs...");
        for (const fir of mockFIRs) {
            const output = await extractor(fir.description, { pooling: 'mean', normalize: true });
            const embedding = Array.from(output.data);
            
            await insert(db, {
                id: fir.id,
                description: fir.description,
                date: fir.date,
                embedding: embedding
            });
        }

        initialized = true;
        console.log("Copilot initialized successfully.");
    } catch (error) {
        console.error("Error initializing Copilot:", error);
        throw error;
    }
}

async function queryCopilot(prompt) {
    if (!initialized) {
        await initCopilot();
    }

    // Embed the user's prompt
    const output = await extractor(prompt, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(output.data);

    // Search Orama
    const results = await search(db, {
        mode: 'vector',
        vector: {
            value: queryEmbedding,
            property: 'embedding'
        },
        similarity: 0.3, // threshold
        limit: 3
    });

    // Synthesize response based on retrieved cases
    if (results.hits.length === 0) {
        return "I could not find any FIRs in the system that closely match your description.";
    }

    const matches = results.hits.map(hit => `- ${hit.document.id} (${hit.document.date}): ${hit.document.description}`).join('\n');
    
    // In a full RAG, we'd pass this to a text-generation model. 
    // Since we are running strictly local and avoiding heavy GenAI, we return the synthesized search summary.
    return `Based on my analysis of the local FIR database, I found the following related cases that match your query parameters:\n\n${matches}\n\nRecommendation: Cross-reference these cases for potential suspect patterns.`;
}

module.exports = {
    initCopilot,
    queryCopilot
};
