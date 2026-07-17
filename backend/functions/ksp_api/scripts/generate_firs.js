const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

const NUM_FIRS = 5000;

const crimeTypes = [
    "Theft", "Assault", "Cyber Fraud", "Murder", "Robbery",
    "Extortion", "Kidnapping", "Drug Trafficking", "Burglary",
    "Arson", "Human Trafficking", "Domestic Violence", "Embezzlement",
    "Forgery", "Identity Theft", "Vandalism", "Hit and Run",
    "Riot", "Smuggling", "Bribery"
];

const locations = [
    "Koramangala", "Indiranagar", "Whitefield", "Jayanagar", "MG Road",
    "Electronic City", "HSR Layout", "Malleshwaram", "Rajajinagar", "Basavanagudi"
];

const templates = [
    "A {crime} was reported on {date} at {location}. The complainant stated that {suspects} suspects were involved.",
    "Incident of {crime} occurred near {location}. Victim sustained injuries.",
    "Suspects broke into a property at {location} committing {crime}.",
    "Online {crime} reported. Victim lost significant funds.",
    "Report of {crime} in {location}. Immediate investigation requested."
];

function generateFIR(id) {
    const crime = faker.helpers.arrayElement(crimeTypes);
    const location = faker.helpers.arrayElement(locations);
    const date = faker.date.recent({ days: 30 }).toISOString().split('T')[0];
    const suspects = faker.number.int({ min: 1, max: 5 });
    
    let briefFacts = faker.helpers.arrayElement(templates)
        .replace('{crime}', crime)
        .replace('{location}', location)
        .replace('{date}', date)
        .replace('{suspects}', suspects);
        
    briefFacts += ` Additional context: ${faker.lorem.sentences(2)}`;

    // Karnataka bounding box roughly: Lat 11.5 - 18.5, Lon 74.0 - 78.5
    const lat = faker.location.latitude({ min: 11.5, max: 18.5 });
    const lon = faker.location.longitude({ min: 74.0, max: 78.5 });
    
    // CaseMaster
    const caseMaster = {
        CaseMasterID: id,
        CrimeNo: `1${faker.string.numeric(4)}${faker.string.numeric(4)}2026${faker.string.numeric(5)}`,
        CaseNo: `2026${faker.string.numeric(5)}`,
        CrimeRegisteredDate: date,
        latitude: lat,
        longitude: lon,
        BriefFacts: briefFacts,
        CrimeCategory: crime
    };

    // ComplainantDetails
    const complainant = {
        ComplainantID: id,
        CaseMasterID: id,
        ComplainantName: faker.person.fullName(),
        AgeYear: faker.number.int({ min: 18, max: 80 }),
        GenderID: faker.helpers.arrayElement([1, 2])
    };

    // Victim
    const victim = {
        VictimMasterID: id,
        CaseMasterID: id,
        VictimName: faker.person.fullName(),
        AgeYear: faker.number.int({ min: 5, max: 90 }),
        GenderID: faker.helpers.arrayElement([1, 2])
    };

    // Accused
    const accusedList = [];
    for (let i = 0; i < suspects; i++) {
        accusedList.push({
            AccusedMasterID: parseInt(`${id}${i}`),
            CaseMasterID: id,
            AccusedName: faker.person.fullName(),
            AgeYear: faker.number.int({ min: 18, max: 65 }),
            GenderID: faker.helpers.arrayElement([1, 2])
        });
    }

    return { caseMaster, complainant, victim, accusedList };
}

const data = {
    CaseMaster: [],
    ComplainantDetails: [],
    Victim: [],
    Accused: []
};

for (let i = 1; i <= NUM_FIRS; i++) {
    const fir = generateFIR(i);
    data.CaseMaster.push(fir.caseMaster);
    data.ComplainantDetails.push(fir.complainant);
    data.Victim.push(fir.victim);
    data.Accused.push(...fir.accusedList);
}

const outPath = path.join(__dirname, '..', 'data');
if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath);
}
fs.writeFileSync(path.join(outPath, 'seed_firs.json'), JSON.stringify(data, null, 2));

console.log(`Successfully generated ${NUM_FIRS} FIRs!`);
