import Database from 'better-sqlite3';
import { IRelationshipRepository, RelationshipRow } from '../shared/repositories/IRepositories';

export class SQLiteRelationshipRepository implements IRelationshipRepository {
    private db: Database.Database;

    constructor(db: Database.Database) {
        this.db = db;
    }

    findById(id: string): RelationshipRow | undefined {
        throw new Error('Not Implemented');
    }

    findBySourceId(sourceId: string): RelationshipRow[] {
        const rels: RelationshipRow[] = [];
        const now = new Date().toISOString();
        
        let normSource = sourceId.trim();
        if (/^\d+$/.test(normSource)) {
            normSource = `CASE-${normSource}`;
        }

        if (normSource.startsWith('CASE-')) {
            const caseId = normSource.replace('CASE-', '');

            // 1. Victims
            const victims = this.db.prepare('SELECT VictimMasterID FROM Victim WHERE CaseMasterID = ?').all(caseId) as any[];
            victims.forEach(v => {
                rels.push({
                    id: `rel-c${caseId}-v${v.VictimMasterID}`,
                    sourceId: normSource,
                    targetId: `VICTIM-${v.VictimMasterID}`,
                    type: 'VICTIM_OF',
                    createdAt: now,
                    updatedAt: now
                });
            });

            // 2. Accused
            const accused = this.db.prepare('SELECT AccusedMasterID FROM Accused WHERE CaseMasterID = ?').all(caseId) as any[];
            accused.forEach(a => {
                rels.push({
                    id: `rel-c${caseId}-a${a.AccusedMasterID}`,
                    sourceId: normSource,
                    targetId: `ACCUSED-${a.AccusedMasterID}`,
                    type: 'ACCUSED_IN',
                    createdAt: now,
                    updatedAt: now
                });
            });

            // 3. Complainant
            const comps = this.db.prepare('SELECT ComplainantID FROM ComplainantDetails WHERE CaseMasterID = ?').all(caseId) as any[];
            comps.forEach(c => {
                rels.push({
                    id: `rel-c${caseId}-comp${c.ComplainantID}`,
                    sourceId: normSource,
                    targetId: `COMP-${c.ComplainantID}`,
                    type: 'REPORTED_BY',
                    createdAt: now,
                    updatedAt: now
                });
            });

            // 4. Police Station & IO
            const caseFull = this.db.prepare('SELECT PoliceStationID, PolicePersonID FROM CaseMaster WHERE CaseMasterID = ?').get(caseId) as any;
            if (caseFull) {
                if (caseFull.PoliceStationID) {
                    rels.push({
                        id: `rel-c${caseId}-ps${caseFull.PoliceStationID}`,
                        sourceId: normSource,
                        targetId: `UNIT-${caseFull.PoliceStationID}`,
                        type: 'REGISTERED_AT',
                        createdAt: now,
                        updatedAt: now
                    });
                }
                if (caseFull.PolicePersonID) {
                    rels.push({
                        id: `rel-c${caseId}-io${caseFull.PolicePersonID}`,
                        sourceId: normSource,
                        targetId: `EMP-${caseFull.PolicePersonID}`,
                        type: 'INVESTIGATED_BY',
                        createdAt: now,
                        updatedAt: now
                    });
                }
            }
        } else if (normSource.startsWith('ACCUSED-')) {
            const accusedId = normSource.replace('ACCUSED-', '');
            const accusedData = this.db.prepare('SELECT AccusedName, CaseMasterID FROM Accused WHERE AccusedMasterID = ?').get(accusedId) as any;
            if (accusedData) {
                const cases = this.db.prepare(`
                    SELECT c.CaseMasterID 
                    FROM CaseMaster c
                    JOIN Accused a ON c.CaseMasterID = a.CaseMasterID
                    WHERE a.AccusedName = ? OR a.AccusedMasterID = ?
                    LIMIT 20
                `).all(accusedData.AccusedName, accusedId) as any[];

                cases.forEach(c => {
                    rels.push({
                        id: `rel-a${accusedId}-c${c.CaseMasterID}`,
                        sourceId: normSource,
                        targetId: `CASE-${c.CaseMasterID}`,
                        type: 'ACCUSED_IN',
                        createdAt: now,
                        updatedAt: now
                    });
                });
            }
        } else if (normSource.startsWith('VICTIM-')) {
            const victimId = normSource.replace('VICTIM-', '');
            const cases = this.db.prepare('SELECT CaseMasterID FROM Victim WHERE VictimMasterID = ? LIMIT 20').all(victimId) as any[];
            cases.forEach(c => {
                rels.push({
                    id: `rel-v${victimId}-c${c.CaseMasterID}`,
                    sourceId: normSource,
                    targetId: `CASE-${c.CaseMasterID}`,
                    type: 'VICTIM_IN',
                    createdAt: now,
                    updatedAt: now
                });
            });
        } else if (normSource.startsWith('UNIT-') || normSource.startsWith('POLICESTATION-')) {
            const unitId = normSource.replace(/^(UNIT|POLICESTATION)-/, '');
            const cases = this.db.prepare('SELECT CaseMasterID FROM CaseMaster WHERE PoliceStationID = ? LIMIT 20').all(unitId) as any[];
            cases.forEach(c => {
                rels.push({
                    id: `rel-u${unitId}-c${c.CaseMasterID}`,
                    sourceId: normSource,
                    targetId: `CASE-${c.CaseMasterID}`,
                    type: 'STATION_CASE',
                    createdAt: now,
                    updatedAt: now
                });
            });
        } else if (normSource.startsWith('EMP-') || normSource.startsWith('IO-') || normSource.startsWith('EMPLOYEE-')) {
            const empId = normSource.replace(/^(EMP|IO|EMPLOYEE)-/, '');
            const cases = this.db.prepare('SELECT CaseMasterID FROM CaseMaster WHERE PolicePersonID = ? LIMIT 20').all(empId) as any[];
            cases.forEach(c => {
                rels.push({
                    id: `rel-emp${empId}-c${c.CaseMasterID}`,
                    sourceId: normSource,
                    targetId: `CASE-${c.CaseMasterID}`,
                    type: 'INVESTIGATES',
                    createdAt: now,
                    updatedAt: now
                });
            });
        }

        return rels;
    }

    findByTargetId(targetId: string): RelationshipRow[] {
        return [];
    }

    create(rel: Omit<RelationshipRow, 'createdAt' | 'updatedAt'>): RelationshipRow {
        throw new Error('Not Implemented');
    }

    delete(id: string): boolean {
        throw new Error('Not Implemented');
    }
}
