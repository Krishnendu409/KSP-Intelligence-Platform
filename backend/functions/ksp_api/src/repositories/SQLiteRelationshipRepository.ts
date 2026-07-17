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

        if (sourceId.startsWith('CASE-')) {
            const caseId = sourceId.replace('CASE-', '');

            // 1. Victims
            const victims = this.db.prepare('SELECT VictimMasterID FROM Victim WHERE CaseMasterID = ?').all(caseId) as any[];
            victims.forEach(v => {
                rels.push({
                    id: `rel-c${caseId}-v${v.VictimMasterID}`,
                    sourceId: sourceId,
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
                    sourceId: sourceId,
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
                    sourceId: sourceId,
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
                        sourceId: sourceId,
                        targetId: `UNIT-${caseFull.PoliceStationID}`,
                        type: 'REGISTERED_AT',
                        createdAt: now,
                        updatedAt: now
                    });
                }
                if (caseFull.PolicePersonID) {
                    rels.push({
                        id: `rel-c${caseId}-io${caseFull.PolicePersonID}`,
                        sourceId: sourceId,
                        targetId: `EMP-${caseFull.PolicePersonID}`,
                        type: 'INVESTIGATED_BY',
                        createdAt: now,
                        updatedAt: now
                    });
                }
            }
        } else if (sourceId.startsWith('ACCUSED-')) {
            const accusedId = sourceId.replace('ACCUSED-', '');
            // Find all cases for this accused by name
            const accusedData = this.db.prepare('SELECT AccusedName FROM Accused WHERE AccusedMasterID = ?').get(accusedId) as any;
            if (accusedData) {
                const cases = this.db.prepare(`
                    SELECT c.CaseMasterID 
                    FROM CaseMaster c
                    JOIN Accused a ON c.CaseMasterID = a.CaseMasterID
                    WHERE a.AccusedName = ?
                    LIMIT 20
                `).all(accusedData.AccusedName) as any[];

                cases.forEach(c => {
                    rels.push({
                        id: `rel-a${accusedId}-c${c.CaseMasterID}`,
                        sourceId: sourceId,
                        targetId: `CASE-${c.CaseMasterID}`,
                        type: 'ACCUSED_IN',
                        createdAt: now,
                        updatedAt: now
                    });
                });
            }
        }

        return rels;
    }

    findByTargetId(targetId: string): RelationshipRow[] {
        // Return inverse relationships if necessary.
        // For simplicity, findBySourceId handles all outgoing.
        return [];
    }

    create(rel: Omit<RelationshipRow, 'createdAt' | 'updatedAt'>): RelationshipRow {
        throw new Error('Not Implemented');
    }

    delete(id: string): boolean {
        throw new Error('Not Implemented');
    }
}
