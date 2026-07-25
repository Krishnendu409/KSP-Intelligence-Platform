import Database from 'better-sqlite3';

export function getEntityProfile(db: Database.Database, type: string, id: string | number) {
    const typeUpper = type.toUpperCase();
    const cleanId = String(id).replace(/^[A-Z_]+-/i, '');
    let entityData: any = null;
    let linkedCases: string[] = [];
    let network: any[] = [];
    let metadata: any = {};
    let name = '';
    
    // Fetch the primary entity
    if (typeUpper === 'VICTIM') {
        entityData = db.prepare('SELECT * FROM Victim WHERE VictimMasterID = ?').get(cleanId);
        if (!entityData) return null;
        name = entityData.VictimName || `Victim #${cleanId}`;
        metadata = {
            Age: entityData.AgeYear,
            Gender: entityData.GenderID === 1 ? 'Male' : entityData.GenderID === 2 ? 'Female' : 'Unknown',
            Role: 'Victim'
        };
        const cases = db.prepare('SELECT CaseMasterID FROM Victim WHERE VictimMasterID = ?').all(cleanId) as any[];
        linkedCases = cases.map(c => `CASE-${c.CaseMasterID}`);
    } else if (typeUpper === 'ACCUSED') {
        entityData = db.prepare('SELECT * FROM Accused WHERE AccusedMasterID = ?').get(cleanId);
        if (!entityData) return null;
        name = entityData.AccusedName || `Accused #${cleanId}`;
        metadata = {
            Age: entityData.AgeYear,
            Gender: entityData.GenderID === 1 ? 'Male' : entityData.GenderID === 2 ? 'Female' : 'Unknown',
            Role: 'Accused'
        };
        const cases = db.prepare('SELECT CaseMasterID FROM Accused WHERE AccusedMasterID = ?').all(cleanId) as any[];
        linkedCases = cases.map(c => `CASE-${c.CaseMasterID}`);
    } else if (typeUpper === 'COMPLAINANT' || typeUpper === 'COMP') {
        entityData = db.prepare('SELECT * FROM ComplainantDetails WHERE ComplainantID = ?').get(cleanId);
        if (!entityData) return null;
        name = entityData.ComplainantName || `Complainant #${cleanId}`;
        metadata = {
            Age: entityData.AgeYear,
            Gender: entityData.GenderID === 1 ? 'Male' : entityData.GenderID === 2 ? 'Female' : 'Unknown',
            Role: 'Complainant'
        };
        const cases = db.prepare('SELECT CaseMasterID FROM ComplainantDetails WHERE ComplainantID = ?').all(cleanId) as any[];
        linkedCases = cases.map(c => `CASE-${c.CaseMasterID}`);
    } else if (typeUpper === 'CASE') {
        entityData = db.prepare('SELECT * FROM CaseMaster WHERE CaseMasterID = ? OR CrimeNo = ?').get(cleanId, cleanId);
        if (!entityData) return null;
        const actualCaseId = entityData.CaseMasterID;
        name = `Case #${entityData.CrimeNo || actualCaseId}`;
        metadata = {
            CrimeNo: entityData.CrimeNo,
            RegisteredDate: entityData.CrimeRegisteredDate,
            BriefFacts: entityData.BriefFacts,
            Role: 'Case'
        };
        linkedCases = [`CASE-${actualCaseId}`];
    } else if (typeUpper === 'POLICESTATION' || typeUpper === 'UNIT') {
        entityData = db.prepare('SELECT * FROM Unit WHERE UnitID = ? OR UnitName = ?').get(cleanId, cleanId);
        if (!entityData) return null;
        name = entityData.UnitName || `Police Station #${cleanId}`;
        metadata = {
            UnitID: entityData.UnitID,
            DistrictID: entityData.DistrictID,
            City: entityData.City,
            Role: 'Police Station'
        };
        const cases = db.prepare('SELECT CaseMasterID FROM CaseMaster WHERE PoliceStationID = ? LIMIT 50').all(entityData.UnitID) as any[];
        linkedCases = cases.map(c => `CASE-${c.CaseMasterID}`);
    } else if (typeUpper === 'EMPLOYEE' || typeUpper === 'EMP' || typeUpper === 'IO' || typeUpper === 'OFFICER') {
        entityData = db.prepare('SELECT * FROM Employee WHERE EmployeeID = ?').get(cleanId);
        if (!entityData) return null;
        name = entityData.EmployeeName || entityData.Name || `Officer #${cleanId}`;
        metadata = {
            EmployeeID: entityData.EmployeeID,
            Rank: entityData.Rank || entityData.Designation || 'Officer',
            Role: 'Investigating Officer'
        };
        const cases = db.prepare('SELECT CaseMasterID FROM CaseMaster WHERE PolicePersonID = ? LIMIT 50').all(entityData.EmployeeID) as any[];
        linkedCases = cases.map(c => `CASE-${c.CaseMasterID}`);
    } else if (typeUpper === 'COURT') {
        entityData = db.prepare('SELECT * FROM Court WHERE CourtID = ? OR CourtName = ?').get(cleanId, cleanId) || { CourtID: cleanId, CourtName: `District Court #${cleanId}` };
        name = entityData.CourtName || `Court #${cleanId}`;
        metadata = {
            CourtID: entityData.CourtID,
            Role: 'Court'
        };
        linkedCases = [];
    } else {
        return null; // Unknown type
    }

    // Now fetch the network (other entities in the SAME cases)
    for (const caseId of linkedCases) {
        const rawCaseId = caseId.replace('CASE-', '');
        
        // Co-Victims / Victims
        const victims = db.prepare('SELECT VictimMasterID, VictimName FROM Victim WHERE CaseMasterID = ?').all(rawCaseId) as any[];
        for (const v of victims) {
            if (`VICTIM-${v.VictimMasterID}` !== `${typeUpper}-${cleanId}`) {
                network.push({
                    id: `VICTIM-${v.VictimMasterID}`,
                    name: v.VictimName || `Victim #${v.VictimMasterID}`,
                    category: 'Victim',
                    relation: `Involved in ${caseId}`
                });
            }
        }

        // Co-Accused / Accused
        const accused = db.prepare('SELECT AccusedMasterID, AccusedName FROM Accused WHERE CaseMasterID = ?').all(rawCaseId) as any[];
        for (const a of accused) {
            if (`ACCUSED-${a.AccusedMasterID}` !== `${typeUpper}-${cleanId}`) {
                network.push({
                    id: `ACCUSED-${a.AccusedMasterID}`,
                    name: a.AccusedName || `Accused #${a.AccusedMasterID}`,
                    category: 'Accused',
                    relation: `Involved in ${caseId}`
                });
            }
        }
    }

    return {
        id: `${typeUpper}-${cleanId}`,
        name,
        metadata,
        linkedCases,
        network
    };
}
