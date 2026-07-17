import Database from 'better-sqlite3';
import { fakerEN_IN as faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
const db = new Database(dbPath);

console.log('Creating database schema...');

// Create Tables matching the ER Diagram exactly
db.exec(`
    CREATE TABLE State (
        StateID INTEGER PRIMARY KEY,
        StateName VARCHAR,
        NationalityID INTEGER,
        Active BIT
    );

    CREATE TABLE District (
        DistrictID INTEGER PRIMARY KEY,
        DistrictName VARCHAR,
        StateID INTEGER,
        Active BIT,
        FOREIGN KEY(StateID) REFERENCES State(StateID)
    );

    CREATE TABLE UnitType (
        UnitTypeID INTEGER PRIMARY KEY,
        UnitTypeName VARCHAR,
        CityDistState VARCHAR
    );

    CREATE TABLE Unit (
        UnitID INTEGER PRIMARY KEY,
        UnitName VARCHAR,
        TypeID INTEGER,
        ParentUnit INTEGER,
        NationalityID INTEGER,
        StateID INTEGER,
        DistrictID INTEGER,
        Active BIT,
        FOREIGN KEY(DistrictID) REFERENCES District(DistrictID),
        FOREIGN KEY(StateID) REFERENCES State(StateID),
        FOREIGN KEY(TypeID) REFERENCES UnitType(UnitTypeID)
    );

    CREATE TABLE Rank (
        RankID INTEGER PRIMARY KEY,
        RankName VARCHAR,
        Hierarchy INTEGER,
        Active BIT
    );

    CREATE TABLE Designation (
        DesignationID INTEGER PRIMARY KEY,
        DesignationName VARCHAR,
        Active BIT,
        SortOrder INTEGER
    );

    CREATE TABLE Employee (
        EmployeeID INTEGER PRIMARY KEY,
        DistrictID INTEGER,
        UnitID INTEGER,
        RankID INTEGER,
        DesignationID INTEGER,
        KGID VARCHAR,
        FirstName VARCHAR,
        EmployeeDOB DATE,
        GenderID INTEGER,
        BloodGroupID INTEGER,
        PhysicallyChallenged BIT,
        AppointmentDate DATE,
        FOREIGN KEY(DistrictID) REFERENCES District(DistrictID),
        FOREIGN KEY(UnitID) REFERENCES Unit(UnitID),
        FOREIGN KEY(RankID) REFERENCES Rank(RankID),
        FOREIGN KEY(DesignationID) REFERENCES Designation(DesignationID)
    );

    CREATE TABLE CaseCategory (
        CaseCategoryID INTEGER PRIMARY KEY,
        LookupValue VARCHAR
    );

    CREATE TABLE GravityOffence (
        GravityOffenceID INTEGER PRIMARY KEY,
        LookupValue VARCHAR
    );

    CREATE TABLE CaseStatusMaster (
        CaseStatusID INTEGER PRIMARY KEY,
        CaseStatusName VARCHAR
    );

    CREATE TABLE Court (
        CourtID INTEGER PRIMARY KEY,
        CourtName VARCHAR,
        DistrictID INTEGER,
        StateID INTEGER,
        Active BIT,
        FOREIGN KEY(DistrictID) REFERENCES District(DistrictID),
        FOREIGN KEY(StateID) REFERENCES State(StateID)
    );

    CREATE TABLE CrimeHead (
        CrimeHeadID INTEGER PRIMARY KEY,
        CrimeGroupName VARCHAR,
        Active BIT
    );

    CREATE TABLE CrimeSubHead (
        CrimeSubHeadID INTEGER PRIMARY KEY,
        CrimeHeadID INTEGER,
        CrimeHeadName VARCHAR,
        SeqID INTEGER,
        FOREIGN KEY(CrimeHeadID) REFERENCES CrimeHead(CrimeHeadID)
    );

    CREATE TABLE Act (
        ActCode VARCHAR PRIMARY KEY,
        ActDescription VARCHAR,
        ShortName VARCHAR,
        Active BIT
    );

    CREATE TABLE Section (
        SectionID INTEGER PRIMARY KEY AUTOINCREMENT,
        ActCode VARCHAR,
        SectionCode VARCHAR,
        SectionDescription VARCHAR,
        Active BIT,
        FOREIGN KEY(ActCode) REFERENCES Act(ActCode)
    );

    CREATE TABLE CasteMaster (
        caste_master_id INTEGER PRIMARY KEY,
        caste_master_name VARCHAR
    );

    CREATE TABLE ReligionMaster (
        ReligionID INTEGER PRIMARY KEY,
        ReligionName VARCHAR
    );

    CREATE TABLE OccupationMaster (
        OccupationID INTEGER PRIMARY KEY,
        OccupationName VARCHAR
    );

    CREATE TABLE CaseMaster (
        CaseMasterID INTEGER PRIMARY KEY AUTOINCREMENT,
        CrimeNo VARCHAR,
        CaseNo VARCHAR,
        CrimeRegisteredDate DATE,
        IncidentFromDate DATETIME,
        IncidentToDate DATETIME,
        InfoReceivedPSDate DATETIME,
        latitude DECIMAL,
        longitude DECIMAL,
        BriefFacts TEXT,
        PolicePersonID INTEGER,
        PoliceStationID INTEGER,
        CaseCategoryID INTEGER,
        GravityOffenceID INTEGER,
        CrimeMajorHeadID INTEGER,
        CrimeMinorHeadID INTEGER,
        CaseStatusID INTEGER,
        CourtID INTEGER,
        FOREIGN KEY(PolicePersonID) REFERENCES Employee(EmployeeID),
        FOREIGN KEY(PoliceStationID) REFERENCES Unit(UnitID),
        FOREIGN KEY(CaseCategoryID) REFERENCES CaseCategory(CaseCategoryID),
        FOREIGN KEY(GravityOffenceID) REFERENCES GravityOffence(GravityOffenceID),
        FOREIGN KEY(CrimeMajorHeadID) REFERENCES CrimeHead(CrimeHeadID),
        FOREIGN KEY(CrimeMinorHeadID) REFERENCES CrimeSubHead(CrimeSubHeadID),
        FOREIGN KEY(CaseStatusID) REFERENCES CaseStatusMaster(CaseStatusID),
        FOREIGN KEY(CourtID) REFERENCES Court(CourtID)
    );

    CREATE TABLE ComplainantDetails (
        ComplainantID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER,
        ComplainantName VARCHAR,
        AgeYear INTEGER,
        OccupationID INTEGER,
        ReligionID INTEGER,
        CasteID INTEGER,
        GenderID INTEGER,
        FOREIGN KEY(CaseMasterID) REFERENCES CaseMaster(CaseMasterID),
        FOREIGN KEY(OccupationID) REFERENCES OccupationMaster(OccupationID),
        FOREIGN KEY(ReligionID) REFERENCES ReligionMaster(ReligionID),
        FOREIGN KEY(CasteID) REFERENCES CasteMaster(caste_master_id)
    );

    CREATE TABLE ActSectionAssociation (
        AssocID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER,
        ActID VARCHAR,
        SectionID INTEGER,
        ActOrderID INTEGER,
        SectionOrderID INTEGER,
        FOREIGN KEY(CaseMasterID) REFERENCES CaseMaster(CaseMasterID),
        FOREIGN KEY(ActID) REFERENCES Act(ActCode),
        FOREIGN KEY(SectionID) REFERENCES Section(SectionID)
    );

    CREATE TABLE Victim (
        VictimMasterID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER,
        VictimName VARCHAR,
        AgeYear INTEGER,
        GenderID INTEGER,
        VictimPolice VARCHAR,
        FOREIGN KEY(CaseMasterID) REFERENCES CaseMaster(CaseMasterID)
    );

    CREATE TABLE Accused (
        AccusedMasterID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER,
        AccusedName VARCHAR,
        AgeYear INTEGER,
        GenderID INTEGER,
        PersonID VARCHAR,
        FOREIGN KEY(CaseMasterID) REFERENCES CaseMaster(CaseMasterID)
    );

    CREATE TABLE ArrestSurrender (
        ArrestSurrenderID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER,
        ArrestSurrenderTypeID INTEGER,
        ArrestSurrenderDate DATE,
        ArrestSurrenderStateId INTEGER,
        ArrestSurrenderDistrictId INTEGER,
        PoliceStationID INTEGER,
        IOID INTEGER,
        CourtID INTEGER,
        AccusedMasterID INTEGER,
        IsAccused BIT,
        IsComplainantAccused BIT,
        FOREIGN KEY(CaseMasterID) REFERENCES CaseMaster(CaseMasterID),
        FOREIGN KEY(ArrestSurrenderStateId) REFERENCES State(StateID),
        FOREIGN KEY(ArrestSurrenderDistrictId) REFERENCES District(DistrictID),
        FOREIGN KEY(PoliceStationID) REFERENCES Unit(UnitID),
        FOREIGN KEY(IOID) REFERENCES Employee(EmployeeID),
        FOREIGN KEY(CourtID) REFERENCES Court(CourtID),
        FOREIGN KEY(AccusedMasterID) REFERENCES Accused(AccusedMasterID)
    );

    CREATE TABLE CrimeHeadActSection (
        CrimeHeadActSectionID INTEGER PRIMARY KEY AUTOINCREMENT,
        CrimeHeadID INTEGER,
        CrimeSubHeadID INTEGER,
        ActCode VARCHAR,
        SectionID INTEGER,
        FOREIGN KEY(CrimeHeadID) REFERENCES CrimeHead(CrimeHeadID),
        FOREIGN KEY(CrimeSubHeadID) REFERENCES CrimeSubHead(CrimeSubHeadID),
        FOREIGN KEY(ActCode) REFERENCES Act(ActCode),
        FOREIGN KEY(SectionID) REFERENCES Section(SectionID)
    );

    CREATE TABLE ChargesheetDetails (
        ChargesheetID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER,
        ChargesheetNo VARCHAR,
        ChargesheetDate DATE,
        CourtID INTEGER,
        IOID INTEGER,
        FOREIGN KEY(CaseMasterID) REFERENCES CaseMaster(CaseMasterID),
        FOREIGN KEY(CourtID) REFERENCES Court(CourtID),
        FOREIGN KEY(IOID) REFERENCES Employee(EmployeeID)
    );
`);

console.log('Seeding Lookups...');

// Seeding States
const insertState = db.prepare('INSERT INTO State (StateID, StateName, NationalityID, Active) VALUES (?, ?, ?, ?)');
insertState.run(1, 'Karnataka', 1, 1);

// Seeding Districts
const districts = [
    'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
    'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
    'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
    'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
    'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura', 'Yadgir'
];

const insertDistrict = db.prepare('INSERT INTO District (DistrictID, DistrictName, StateID, Active) VALUES (?, ?, ?, ?)');
districts.forEach((d, i) => insertDistrict.run(i + 1, d, 1, 1));

// Seeding UnitType
db.prepare("INSERT INTO UnitType (UnitTypeID, UnitTypeName, CityDistState) VALUES (1, 'Police Station', 'City')").run();

// Seeding Ranks and Designations
db.prepare("INSERT INTO Rank (RankID, RankName, Hierarchy, Active) VALUES (1, 'Inspector', 1, 1), (2, 'Sub-Inspector', 2, 1)").run();
db.prepare("INSERT INTO Designation (DesignationID, DesignationName, Active, SortOrder) VALUES (1, 'IO', 1, 1), (2, 'SHO', 1, 2)").run();

// Seeding Units (Police Stations) - Generating ~10 per district
const insertUnit = db.prepare('INSERT INTO Unit (UnitID, UnitName, TypeID, StateID, DistrictID, Active) VALUES (?, ?, ?, ?, ?, ?)');
let unitId = 1;
const unitsMap = new Map<number, number[]>(); // DistrictID -> UnitIDs
districts.forEach((d, dIdx) => {
    const districtId = dIdx + 1;
    unitsMap.set(districtId, []);
    for (let i = 0; i < 10; i++) {
        const psName = `${faker.location.city()} Police Station`;
        insertUnit.run(unitId, psName, 1, 1, districtId, 1);
        unitsMap.get(districtId)!.push(unitId);
        unitId++;
    }
});

// Seeding Employees (Police Officers)
const insertEmployee = db.prepare('INSERT INTO Employee (EmployeeID, DistrictID, UnitID, RankID, DesignationID, KGID, FirstName, GenderID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
// Random 2000 IOs
for (let i = 1; i <= 2000; i++) {
    const districtId = faker.number.int({ min: 1, max: districts.length });
    const uIds = unitsMap.get(districtId)!;
    const unit = uIds[faker.number.int({ min: 0, max: uIds.length - 1 })];
    insertEmployee.run(i, districtId, unit, 1, 1, faker.string.alphanumeric(8).toUpperCase(), faker.person.fullName(), faker.number.int({ min: 1, max: 2 }));
}

// Seeding Lookups for Case
db.prepare("INSERT INTO CaseCategory (CaseCategoryID, LookupValue) VALUES (1, 'FIR'), (2, 'UDR'), (3, 'Zero FIR')").run();
db.prepare("INSERT INTO GravityOffence (GravityOffenceID, LookupValue) VALUES (1, 'Heinous'), (2, 'Non-Heinous')").run();
db.prepare("INSERT INTO CaseStatusMaster (CaseStatusID, CaseStatusName) VALUES (1, 'Under Investigation'), (2, 'Charge Sheeted'), (3, 'Closed')").run();
db.prepare("INSERT INTO CrimeHead (CrimeHeadID, CrimeGroupName, Active) VALUES (1, 'Crimes Against Body', 1), (2, 'Property Crimes', 1), (3, 'Cyber Crimes', 1)").run();
db.prepare("INSERT INTO CrimeSubHead (CrimeSubHeadID, CrimeHeadID, CrimeHeadName, SeqID) VALUES (1, 1, 'Murder', 1), (2, 1, 'Assault', 2), (3, 2, 'Theft', 1), (4, 2, 'Robbery', 2), (5, 3, 'Phishing', 1)").run();
db.prepare("INSERT INTO Court (CourtID, CourtName, DistrictID, StateID, Active) VALUES (1, 'District Court 1', 5, 1, 1), (2, 'High Court', 5, 1, 1)").run();

// Seeding Acts & Sections
db.prepare("INSERT INTO Act (ActCode, ActDescription, ShortName, Active) VALUES ('IPC', 'Indian Penal Code', 'IPC', 1), ('NDPS', 'Narcotic Drugs and Psychotropic Substances Act', 'NDPS', 1)").run();
const insertSection = db.prepare('INSERT INTO Section (ActCode, SectionCode, SectionDescription, Active) VALUES (?, ?, ?, ?)');
insertSection.run("IPC", "302", "Punishment for murder", 1);
insertSection.run("IPC", "307", "Attempt to murder", 1);
insertSection.run("IPC", "379", "Punishment for theft", 1);
insertSection.run("IPC", "420", "Cheating and dishonestly inducing delivery of property", 1);
insertSection.run("NDPS", "20", "Punishment for contravention in relation to cannabis plant and cannabis", 1);

// Seeding CrimeHeadActSection
const insertCrimeHeadActSection = db.prepare('INSERT INTO CrimeHeadActSection (CrimeHeadID, CrimeSubHeadID, ActCode, SectionID) VALUES (?, ?, ?, ?)');
insertCrimeHeadActSection.run(1, 1, "IPC", 1);
insertCrimeHeadActSection.run(1, 2, "IPC", 2);
insertCrimeHeadActSection.run(2, 3, "IPC", 3);
insertCrimeHeadActSection.run(2, 4, "IPC", 4);
insertCrimeHeadActSection.run(3, 5, "NDPS", 5);

// Seeding Demographics Lookups
db.prepare("INSERT INTO CasteMaster (caste_master_id, caste_master_name) VALUES (1, 'General'), (2, 'OBC'), (3, 'SC/ST')").run();
db.prepare("INSERT INTO ReligionMaster (ReligionID, ReligionName) VALUES (1, 'Hindu'), (2, 'Muslim'), (3, 'Christian')").run();
db.prepare("INSERT INTO OccupationMaster (OccupationID, OccupationName) VALUES (1, 'Private Service'), (2, 'Business'), (3, 'Agriculture')").run();

// Generate 5000 Cases
console.log('Generating 5000 FIR Cases... This might take a few seconds.');
db.exec('BEGIN TRANSACTION');

const insertCase = db.prepare(`
    INSERT INTO CaseMaster (
        CrimeNo, CaseNo, CrimeRegisteredDate, IncidentFromDate, IncidentToDate, InfoReceivedPSDate, 
        latitude, longitude, BriefFacts, PolicePersonID, PoliceStationID, CaseCategoryID, GravityOffenceID, 
        CrimeMajorHeadID, CrimeMinorHeadID, CaseStatusID, CourtID
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertVictim = db.prepare('INSERT INTO Victim (CaseMasterID, VictimName, AgeYear, GenderID, VictimPolice) VALUES (?, ?, ?, ?, ?)');
const insertAccused = db.prepare('INSERT INTO Accused (CaseMasterID, AccusedName, AgeYear, GenderID, PersonID) VALUES (?, ?, ?, ?, ?)');
const insertComplainant = db.prepare('INSERT INTO ComplainantDetails (CaseMasterID, ComplainantName, AgeYear, OccupationID, ReligionID, CasteID, GenderID) VALUES (?, ?, ?, ?, ?, ?, ?)');
const insertAssoc = db.prepare('INSERT INTO ActSectionAssociation (CaseMasterID, ActID, SectionID, ActOrderID, SectionOrderID) VALUES (?, ?, ?, ?, ?)');
const insertArrest = db.prepare('INSERT INTO ArrestSurrender (CaseMasterID, ArrestSurrenderDate, PoliceStationID, IOID, AccusedMasterID) VALUES (?, ?, ?, ?, ?)');
const insertChargesheet = db.prepare('INSERT INTO ChargesheetDetails (CaseMasterID, ChargesheetNo, ChargesheetDate, CourtID, IOID) VALUES (?, ?, ?, ?, ?)');

for (let i = 1; i <= 5000; i++) {
    const year = faker.number.int({ min: 2020, max: 2026 });
    const crimeNo = `1044${faker.string.numeric(4)}${year}${faker.string.numeric(5)}`;
    const caseNo = `${year}${faker.string.numeric(5)}`;
    const date = faker.date.recent({ days: 365 }).toISOString();
    
    // Choose random district and station
    const districtId = faker.number.int({ min: 1, max: 31 });
    const uIds = unitsMap.get(districtId)!;
    const psId = uIds[faker.number.int({ min: 0, max: uIds.length - 1 })];
    const ioId = faker.number.int({ min: 1, max: 2000 });

    const majorHead = faker.number.int({ min: 1, max: 3 });
    const minorHead = majorHead === 1 ? faker.number.int({ min: 1, max: 2 }) : majorHead === 2 ? faker.number.int({ min: 3, max: 4 }) : 5;

    const info = insertCase.run(
        crimeNo, caseNo, date, date, date, date, 
        faker.location.latitude({ min: 11.5, max: 18.5 }), // Karnataka bounds approx
        faker.location.longitude({ min: 74.0, max: 78.5 }),
        faker.lorem.paragraph(),
        ioId, psId, 
        faker.number.int({ min: 1, max: 3 }), // Category
        faker.number.int({ min: 1, max: 2 }), // Gravity
        majorHead, minorHead,
        faker.number.int({ min: 1, max: 3 }), // Status
        faker.number.int({ min: 1, max: 2 }) // Court
    );

    const caseMasterId = info.lastInsertRowid;

    // Victims
    const vCount = faker.number.int({ min: 0, max: 3 });
    for (let v = 0; v < vCount; v++) {
        insertVictim.run(caseMasterId, faker.person.fullName(), faker.number.int({ min: 18, max: 80 }), faker.number.int({ min: 1, max: 2 }), '0');
    }

    // Accused
    const aCount = faker.number.int({ min: 1, max: 5 });
    for (let a = 0; a < aCount; a++) {
        const accusedInfo = insertAccused.run(caseMasterId, faker.person.fullName(), faker.number.int({ min: 18, max: 60 }), faker.number.int({ min: 1, max: 2 }), `A${a+1}`);
        
        // Random Arrest
        if (faker.datatype.boolean()) {
            insertArrest.run(caseMasterId, date, psId, ioId, accusedInfo.lastInsertRowid);
        }
    }

    // Complainant
    insertComplainant.run(caseMasterId, faker.person.fullName(), faker.number.int({ min: 20, max: 70 }), faker.number.int({ min: 1, max: 3 }), faker.number.int({ min: 1, max: 3 }), faker.number.int({ min: 1, max: 3 }), faker.number.int({ min: 1, max: 2 }));

    // Acts
    const sectionId = faker.number.int({ min: 1, max: 5 });
    const actId = sectionId === 5 ? "NDPS" : "IPC";
    insertAssoc.run(caseMasterId, actId, sectionId, 1, 1);

    // Chargesheet
    insertChargesheet.run(caseMasterId, `CS-${faker.string.numeric(6)}`, date, faker.number.int({ min: 1, max: 2 }), ioId);
}

db.exec('COMMIT');
console.log('Seeding complete. 5000 FIRs generated successfully in fir_system.sqlite!');
