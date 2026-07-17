import { z } from 'zod';
import { randomUUID } from 'crypto';
import type { RawFIR, RawPerson, RawVehicle, RawIncident } from '@shared/domain/RawFIR';
import type { NormalizedFIR, EntityCandidate } from '@shared/domain/NormalizedFIR';
import { ValidationError } from './ValidationErrors';

// Define Zod schemas that mirror the RawFIR interface
export const RawPersonSchema = z.object({
  name: z.string().optional(),
  alias: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bankAccount: z.string().optional(),
  imei: z.string().optional(),
}).refine(data => 
  data.name || data.alias || data.phone || data.address || data.bankAccount || data.imei,
  { message: "Person must have at least one identifying field" }
);

export const RawIncidentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z)?$/, "Must be YYYY-MM-DD or ISO 8601 string"),
  time: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  description: z.string().min(1, "Description is required"),
});

export const RawVehicleSchema = z.object({
  registrationNumber: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  ownerName: z.string().optional(),
}).refine(data => data.registrationNumber || (data.make && data.color), {
  message: "Vehicle must have at least a registration number or make and color"
});

export const RawFIRSchema = z.object({
  firId: z.string().min(1, "firId is required"),
  registrationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z)?$/, "Must be YYYY-MM-DD or ISO 8601 string"),
  district: z.string().min(1, "district is required"),
  policeStation: z.string().min(1, "policeStation is required"),
  sections: z.array(z.string()).min(1, "At least one section is required"),
  complainant: RawPersonSchema.optional(),
  accused: z.array(RawPersonSchema),
  incident: RawIncidentSchema,
  vehicles: z.array(RawVehicleSchema).optional(),
});

export class FIRProcessor {
  /**
   * Processes a RawFIR by validating, canonicalizing, and normalizing it.
   */
  public static process(data: unknown): { normalized: NormalizedFIR, canonical: RawFIR } {
    const validated = this.#validate(data);
    const canonical = this.#canonicalize(validated);
    const normalized = this.#normalize(canonical);
    return { normalized, canonical };
  }

  static #validate(data: unknown): RawFIR {
    const result = RawFIRSchema.safeParse(data);
    
    if (!result.success) {
      const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new ValidationError(`Validation failed for FIR: ${messages}`, result.error.issues);
    }
    
    return result.data as RawFIR;
  }

  static #canonicalize(fir: RawFIR): RawFIR {
    return {
      ...fir,
      registrationDate: fir.registrationDate.length === 10 ? `${fir.registrationDate}T00:00:00Z` : fir.registrationDate,
      district: this.#cleanString(fir.district),
      policeStation: this.#cleanString(fir.policeStation),
      sections: fir.sections.map(s => this.#cleanString(s)),
      complainant: fir.complainant ? this.#cleanPerson(fir.complainant) : undefined,
      accused: fir.accused.map(a => this.#cleanPerson(a)),
      incident: this.#cleanIncident(fir.incident),
      vehicles: fir.vehicles?.map(v => this.#cleanVehicle(v))
    };
  }

  static #cleanString(str: string): string {
    return str.trim().toUpperCase().replace(/\s+/g, ' ');
  }

  static #cleanPhone(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.length === 10 && !cleaned.startsWith('+')) {
      return '+91' + cleaned;
    }
    return cleaned;
  }

  static #cleanVehicleReg(reg: string): string {
    const clean = reg.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const match = clean.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,2})(\d{1,4})$/);
    if (match) {
      return `${match[1]}-${match[2].padStart(2, '0')}-${match[3]}-${match[4].padStart(4, '0')}`;
    }
    return clean;
  }

  static #cleanPerson(person: RawPerson): RawPerson {
    return {
      ...person,
      name: person.name ? this.#cleanString(person.name) : undefined,
      alias: person.alias ? this.#cleanString(person.alias) : undefined,
      phone: person.phone ? this.#cleanPhone(person.phone) : undefined,
      address: person.address ? this.#cleanString(person.address) : undefined,
      bankAccount: person.bankAccount ? person.bankAccount.replace(/\s+/g, '') : undefined,
      imei: person.imei ? person.imei.replace(/[^\d]/g, '') : undefined,
    };
  }

  static #cleanVehicle(vehicle: RawVehicle): RawVehicle {
    return {
      ...vehicle,
      registrationNumber: vehicle.registrationNumber ? this.#cleanVehicleReg(vehicle.registrationNumber) : undefined,
      make: vehicle.make ? this.#cleanString(vehicle.make) : undefined,
      model: vehicle.model ? this.#cleanString(vehicle.model) : undefined,
      color: vehicle.color ? this.#cleanString(vehicle.color) : undefined,
      ownerName: vehicle.ownerName ? this.#cleanString(vehicle.ownerName) : undefined,
    };
  }

  static #cleanIncident(incident: RawIncident): RawIncident {
    return {
      ...incident,
      // Standardize date to ISO
      date: incident.date.length === 10 ? `${incident.date}T00:00:00Z` : incident.date,
      location: this.#cleanString(incident.location),
      description: incident.description.trim() // Keep case for description
    };
  }

  static #normalize(fir: RawFIR): NormalizedFIR {
    const caseId = fir.firId; // firId maps directly to Case ID
    const eventId = `${fir.firId}-EVT-1`;

    const entityCandidates: EntityCandidate[] = [];

    if (fir.complainant) {
      entityCandidates.push(...this.#extractPersonEntities(fir.complainant, 'COMPLAINANT'));
    }

    fir.accused.forEach(acc => {
      entityCandidates.push(...this.#extractPersonEntities(acc, 'ACCUSED'));
    });

    fir.vehicles?.forEach(veh => {
      entityCandidates.push(...this.#extractVehicleEntities(veh));
    });

    return {
      case: {
        id: caseId,
        title: `FIR ${fir.firId}`,
        description: fir.incident.description,
        status: 'OPEN'
      },
      event: {
        id: eventId,
        caseId: caseId,
        type: 'INCIDENT',
        description: fir.incident.description,
        timestamp: fir.incident.date,
        location: fir.incident.location,
        coordinates: fir.incident.coordinates
      },
      entityCandidates
    };
  }

  static #extractPersonEntities(person: RawPerson, role: string): EntityCandidate[] {
    const entities: EntityCandidate[] = [];
    
    const personId = `cand-per-${randomUUID()}`;
    entities.push({
      id: personId,
      type: 'PERSON',
      name: person.name || person.alias || 'UNKNOWN PERSON',
      metadata: {
        role,
        ...(person.alias && { alias: person.alias }),
      }
    });

    if (person.phone) {
      entities.push({
        id: `cand-ph-${randomUUID()}`,
        type: 'PHONE',
        name: person.phone,
        metadata: { linkedPersonId: personId }
      });
    }

    if (person.address) {
      entities.push({
        id: `cand-addr-${randomUUID()}`,
        type: 'ADDRESS',
        name: person.address,
        metadata: { linkedPersonId: personId }
      });
    }

    if (person.bankAccount) {
      entities.push({
        id: `cand-bank-${randomUUID()}`,
        type: 'BANK_ACCOUNT',
        name: person.bankAccount,
        metadata: { linkedPersonId: personId }
      });
    }

    if (person.imei) {
      entities.push({
        id: `cand-imei-${randomUUID()}`,
        type: 'IMEI',
        name: person.imei,
        metadata: { linkedPersonId: personId }
      });
    }

    return entities;
  }

  static #extractVehicleEntities(vehicle: RawVehicle): EntityCandidate[] {
    const entities: EntityCandidate[] = [];
    const vehicleId = `cand-veh-${randomUUID()}`;

    entities.push({
      id: vehicleId,
      type: 'VEHICLE',
      name: vehicle.registrationNumber || `${vehicle.make} ${vehicle.color}`.trim() || 'UNKNOWN VEHICLE',
      metadata: {
        ...(vehicle.make && { make: vehicle.make }),
        ...(vehicle.model && { model: vehicle.model }),
        ...(vehicle.color && { color: vehicle.color }),
        ...(vehicle.ownerName && { ownerName: vehicle.ownerName }),
      }
    });

    return entities;
  }
}
