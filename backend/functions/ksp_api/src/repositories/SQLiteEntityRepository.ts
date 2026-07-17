import Database from 'better-sqlite3';
import { IEntityRepository, EntityRow } from '../shared/repositories/IRepositories';

export class SQLiteEntityRepository implements IEntityRepository {
    private db: Database.Database;

    constructor(db: Database.Database) {
        this.db = db;
    }

    findById(id: string): EntityRow | undefined {
        if (id.startsWith('CASE-')) {
            const caseId = id.replace('CASE-', '');
            const row = this.db.prepare('SELECT CaseMasterID, CrimeNo, CrimeRegisteredDate FROM CaseMaster WHERE CaseMasterID = ?').get(caseId) as any;
            if (row) {
                return {
                    id: `CASE-${row.CaseMasterID}`,
                    type: 'Case',
                    name: row.CrimeNo,
                    createdAt: row.CrimeRegisteredDate || new Date().toISOString(),
                    updatedAt: row.CrimeRegisteredDate || new Date().toISOString()
                };
            }
        } else if (id.startsWith('ACCUSED-')) {
            const accusedId = id.replace('ACCUSED-', '');
            const row = this.db.prepare('SELECT AccusedMasterID, AccusedName FROM Accused WHERE AccusedMasterID = ?').get(accusedId) as any;
            if (row) {
                return {
                    id: `ACCUSED-${row.AccusedMasterID}`,
                    type: 'Accused',
                    name: row.AccusedName || 'Unknown',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
        } else if (id.startsWith('VICTIM-')) {
            const victimId = id.replace('VICTIM-', '');
            const row = this.db.prepare('SELECT VictimMasterID, VictimName FROM Victim WHERE VictimMasterID = ?').get(victimId) as any;
            if (row) {
                return {
                    id: `VICTIM-${row.VictimMasterID}`,
                    type: 'Victim',
                    name: row.VictimName || 'Unknown',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
        } else if (id.startsWith('COMP-')) {
            const compId = id.replace('COMP-', '');
            const row = this.db.prepare('SELECT ComplainantID, ComplainantName FROM ComplainantDetails WHERE ComplainantID = ?').get(compId) as any;
            if (row) {
                return {
                    id: `COMP-${row.ComplainantID}`,
                    type: 'Complainant',
                    name: row.ComplainantName || 'Unknown',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
        } else if (id.startsWith('UNIT-')) {
            const unitId = id.replace('UNIT-', '');
            const row = this.db.prepare('SELECT UnitID, UnitName FROM Unit WHERE UnitID = ?').get(unitId) as any;
            if (row) {
                return {
                    id: `UNIT-${row.UnitID}`,
                    type: 'Location',
                    name: row.UnitName || 'Unknown Station',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
        } else if (id.startsWith('EMP-')) {
            const empId = id.replace('EMP-', '');
            const row = this.db.prepare('SELECT EmployeeID, FirstName FROM Employee WHERE EmployeeID = ?').get(empId) as any;
            if (row) {
                return {
                    id: `EMP-${row.EmployeeID}`,
                    type: 'Employee',
                    name: row.FirstName || 'Unknown IO',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
        }
        return undefined;
    }

    findAll(): EntityRow[] {
        throw new Error('Not Implemented for huge database');
    }

    findByName(nameQuery: string): EntityRow[] {
        throw new Error('Not Implemented');
    }

    create(entity: Omit<EntityRow, 'createdAt' | 'updatedAt'>): EntityRow {
        throw new Error('Not Implemented');
    }

    update(id: string, entity: Partial<Omit<EntityRow, 'id' | 'createdAt' | 'updatedAt'>>): EntityRow | undefined {
        throw new Error('Not Implemented');
    }

    delete(id: string): boolean {
        throw new Error('Not Implemented');
    }
}
