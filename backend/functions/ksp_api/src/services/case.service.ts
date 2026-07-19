function getCaseDetails(db: any, caseMasterId: any) {
    const caseDetails = db.prepare(`
        SELECT
            c.*,
            u.UnitName,
            u.UnitID as ResolvedUnitID,
            u.DistrictID as ResolvedDistrictID
        FROM CaseMaster c
        LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
        WHERE c.CaseMasterID = ?
    `).get(caseMasterId);

    if (!caseDetails) return null;

    const victims = db.prepare(`
        SELECT * FROM Victim WHERE CaseMasterID = ?
    `).all(caseMasterId);

    const accused = db.prepare(`
        SELECT * FROM Accused WHERE CaseMasterID = ?
    `).all(caseMasterId);

    const acts = db.prepare(`
        SELECT * FROM ActSectionAssociation WHERE CaseMasterID = ?
    `).all(caseMasterId);

    return {
        ...caseDetails,
        victims,
        accused,
        acts
    };
}

function getCaseTimeline(db: any, caseMasterId: any) {
    const caseDetails = db.prepare(`SELECT CrimeRegisteredDate as FIR_Date, IncidentFromDate as Incident_Date, CaseStatusID FROM CaseMaster WHERE CaseMasterID = ?`).get(caseMasterId);
    if (!caseDetails) return [];

    const victims = db.prepare(`SELECT VictimName as Name FROM Victim WHERE CaseMasterID = ?`).all(caseMasterId);
    const accused = db.prepare(`SELECT AccusedName as Name, AccusedMasterID FROM Accused WHERE CaseMasterID = ?`).all(caseMasterId);

    const relatedEntities: any[] = [];
    victims.forEach((v: any) => relatedEntities.push({ name: v.Name, type: 'Victim' }));
    accused.forEach((a: any) => relatedEntities.push({ id: `ent-person-${a.AccusedMasterID}`, name: a.Name, type: 'Accused' }));

    const events = [];
    
    if (caseDetails.Incident_Date) {
        events.push({
            id: `evt-inc-${caseMasterId}`,
            timestamp: caseDetails.Incident_Date,
            actionType: 'VEHICLE_SEEN', // Fallback type for UI color
            type: 'INCIDENT_OCCURRED',
            title: 'Incident Occurred',
            details: 'The incident described in the FIR took place.',
            confidenceGrade: 'A1',
            evidenceRef: `CASE-${caseMasterId}`,
            actionLabel: 'View Incident Details',
            actionHandlerType: 'MAP_ZOOM',
            entityIds: [`CASE-${caseMasterId}`, 'ALL'],
            relatedEntities
        });
    }

    if (caseDetails.FIR_Date) {
        events.push({
            id: `evt-fir-${caseMasterId}`,
            timestamp: caseDetails.FIR_Date,
            actionType: 'MEETING_RECORDED', // Fallback type for UI color
            type: 'FIR_REGISTERED',
            title: 'FIR Registered',
            details: `FIR was officially registered. Status: ${caseDetails.CaseStatusID}`,
            confidenceGrade: 'A1',
            evidenceRef: `CASE-${caseMasterId}`,
            actionLabel: 'Open FIR Record',
            actionHandlerType: 'OPEN_EVIDENCE',
            entityIds: [`CASE-${caseMasterId}`, 'ALL'],
            relatedEntities
        });
    }

    const arrests = db.prepare(`
        SELECT ar.ArrestSurrenderDate, ac.AccusedName 
        FROM ArrestSurrender ar 
        JOIN Accused ac ON ar.AccusedMasterID = ac.AccusedMasterID 
        WHERE ar.CaseMasterID = ? AND ar.ArrestSurrenderDate IS NOT NULL
    `).all(caseMasterId);

    arrests.forEach((arrest: any, idx: number) => {
        events.push({
            id: `evt-arr-${caseMasterId}-${idx}`,
            timestamp: arrest.ArrestSurrenderDate,
            actionType: 'ARREST_SURRENDER',
            type: 'ARREST',
            title: 'Accused Arrested / Surrendered',
            details: `Accused ${arrest.AccusedName} was arrested or surrendered in connection with the case.`,
            confidenceGrade: 'A1',
            evidenceRef: `CASE-${caseMasterId}`,
            actionLabel: 'View Accused Details',
            actionHandlerType: 'OPEN_ENTITY',
            entityIds: [`CASE-${caseMasterId}`, 'ALL']
        });
    });

    // Sort events by timestamp
    events.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return events;
}

module.exports = {
    getCaseDetails,
    getCaseTimeline
};
