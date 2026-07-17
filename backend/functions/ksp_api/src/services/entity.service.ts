import Database from 'better-sqlite3';

export function getEntityProfile(db: Database.Database, type: string, id: string | number) {
    const typeUpper = type.toUpperCase();
    let query = '';
    let entityData: any = null;
    let linkedCases: string[] = [];
    let network: any[] = [];
    let metadata: any = {};
    let name = '';
    
    // Fetch the primary entity
    if (typeUpper === 'VICTIM') {
        entityData = db.prepare('SELECT * FROM Victim WHERE VictimMasterID = ?').get(id);
        if (!entityData) return null;
        name = entityData.VictimName;
        metadata = {
            Age: entityData.AgeYear,
            Gender: entityData.GenderID === 1 ? 'Male' : entityData.GenderID === 2 ? 'Female' : 'Unknown',
            Role: 'Victim'
        };
        // Get all cases for this Victim (assuming multiple if same name/id, but for now just the direct link)
        // Wait, Victim table links to CaseMasterID directly.
        const cases = db.prepare('SELECT CaseMasterID FROM Victim WHERE VictimMasterID = ?').all(id) as any[];
        linkedCases = cases.map(c => `CASE-${c.CaseMasterID}`);
    } else if (typeUpper === 'ACCUSED') {
        entityData = db.prepare('SELECT * FROM Accused WHERE AccusedMasterID = ?').get(id);
        if (!entityData) return null;
        name = entityData.AccusedName;
        metadata = {
            Age: entityData.AgeYear,
            Gender: entityData.GenderID === 1 ? 'Male' : entityData.GenderID === 2 ? 'Female' : 'Unknown',
            Role: 'Accused'
        };
        const cases = db.prepare('SELECT CaseMasterID FROM Accused WHERE AccusedMasterID = ?').all(id) as any[];
        linkedCases = cases.map(c => `CASE-${c.CaseMasterID}`);
    } else if (typeUpper === 'COMPLAINANT') {
        entityData = db.prepare('SELECT * FROM ComplainantDetails WHERE ComplainantID = ?').get(id);
        if (!entityData) return null;
        name = entityData.ComplainantName;
        metadata = {
            Age: entityData.AgeYear,
            Gender: entityData.GenderID === 1 ? 'Male' : entityData.GenderID === 2 ? 'Female' : 'Unknown',
            Role: 'Complainant'
        };
        const cases = db.prepare('SELECT CaseMasterID FROM ComplainantDetails WHERE ComplainantID = ?').all(id) as any[];
        linkedCases = cases.map(c => `CASE-${c.CaseMasterID}`);
    } else {
        return null; // Unknown type
    }

    // Now fetch the network (other entities in the SAME cases)
    for (const caseId of linkedCases) {
        const rawCaseId = caseId.replace('CASE-', '');
        
        // Co-Victims
        const victims = db.prepare('SELECT VictimMasterID, VictimName FROM Victim WHERE CaseMasterID = ?').all(rawCaseId) as any[];
        for (const v of victims) {
            if (`VICTIM-${v.VictimMasterID}` !== `${typeUpper}-${id}`) {
                network.push({
                    id: `VICTIM-${v.VictimMasterID}`,
                    name: v.VictimName,
                    category: 'Victim',
                    relation: `Co-involved in ${caseId}`
                });
            }
        }

        // Co-Accused
        const accused = db.prepare('SELECT AccusedMasterID, AccusedName FROM Accused WHERE CaseMasterID = ?').all(rawCaseId) as any[];
        for (const a of accused) {
            if (`ACCUSED-${a.AccusedMasterID}` !== `${typeUpper}-${id}`) {
                network.push({
                    id: `ACCUSED-${a.AccusedMasterID}`,
                    name: a.AccusedName,
                    category: 'Accused',
                    relation: `Co-involved in ${caseId}`
                });
            }
        }
    }

    return {
        id: `${typeUpper}-${id}`,
        name,
        metadata,
        linkedCases,
        network
    };
}
