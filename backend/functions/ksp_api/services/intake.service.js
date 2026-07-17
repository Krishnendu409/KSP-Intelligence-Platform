const Tesseract = require('tesseract.js');
const { Index } = require('flexsearch');
const levenshtein = require('fast-levenshtein');
const fs = require('fs');

// Mock database of existing FIR records for duplication detection
const existingRecords = [
    { id: 'FIR-2026-001', suspect: 'John Doe', location: '123 Main St, Bangalore' },
    { id: 'FIR-2026-002', suspect: 'Rahul Kumar', location: 'MG Road, near Metro' },
    { id: 'FIR-2026-003', suspect: 'Unknown', location: 'Indiranagar 100ft road' }
];

// Initialize FlexSearch index for fast keyword filtering
const searchIndex = new Index({ preset: 'match', tokenize: 'forward' });
existingRecords.forEach((record, idx) => {
    searchIndex.add(idx, `${record.suspect} ${record.location}`);
});

/**
 * Extracts text from an uploaded image buffer or path using Tesseract.js
 */
async function extractTextFromImage(imagePathOrBuffer) {
    console.log("Starting OCR with Tesseract...");
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePathOrBuffer,
            'eng', // we assume english for this hackathon MVP
            { logger: m => console.log(m) }
        );
        return text;
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("Failed to extract text from document.");
    }
}

/**
 * Checks if the given suspect name or location matches existing records too closely
 */
function detectDuplicates(suspectName, locationStr) {
    const query = `${suspectName} ${locationStr}`;
    
    // 1. Broad lexical search using FlexSearch to find candidates
    const candidateIndices = searchIndex.search(query, 5);
    
    let duplicates = [];

    // 2. Exact similarity check using Levenshtein distance on candidates
    for (const idx of candidateIndices) {
        const record = existingRecords[idx];
        
        // Calculate Levenshtein distance on suspect name and location
        const nameDistance = levenshtein.get(suspectName.toLowerCase(), record.suspect.toLowerCase());
        const locDistance = levenshtein.get(locationStr.toLowerCase(), record.location.toLowerCase());

        // Simple threshold heuristic (e.g. if name is <= 2 edits away, it's highly suspicious)
        // If suspect name matches very closely OR location matches very closely
        if (nameDistance <= 2 || locDistance <= 3) {
            duplicates.push({
                recordId: record.id,
                existingSuspect: record.suspect,
                existingLocation: record.location,
                confidence: nameDistance === 0 ? 'High' : 'Medium'
            });
        }
    }

    return duplicates;
}

async function processIntake({ text, image_base64, force }) {
    let extractedText = text || '';
    
    if (image_base64) {
        const buffer = Buffer.from(image_base64, 'base64');
        extractedText = await module.exports.extractTextFromImage(buffer);
    }

    const suspectMatch = extractedText.match(/Suspect:\s*([A-Za-z ]+)/i);
    const locationMatch = extractedText.match(/Location:\s*([A-Za-z0-9 ,]+)/i);
    const suspect = suspectMatch ? suspectMatch[1].trim() : 'Unknown';
    const location = locationMatch ? locationMatch[1].trim() : 'Unknown';
    
    const duplicates = module.exports.detectDuplicates(suspect, location);
    if (duplicates.length > 0 && !force) {
        return { 
            success: false, 
            isDuplicate: true, 
            warning: 'Potential duplicate cases found.', 
            duplicates,
            text: extractedText
        };
    }

    const isHighRisk = extractedText.toLowerCase().includes('weapon') || extractedText.toLowerCase().includes('syndicate');
    
    return {
        success: true,
        isDuplicate: false,
        text: extractedText,
        recordData: {
            description: extractedText,
            latitude: 12.9716 + (Math.random() * 0.05),
            longitude: 77.5946 + (Math.random() * 0.05),
            risk_score: isHighRisk ? 85 : 35,
            timestamp: new Date().toISOString()
        }
    };
}

module.exports = {
    extractTextFromImage,
    detectDuplicates,
    processIntake
};
