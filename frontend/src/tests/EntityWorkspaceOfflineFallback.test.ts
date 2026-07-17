import { describe, it, expect } from "vitest";
import { 
  getFallbackEntityDossier, 
  getFallbackEntityRelationships 
} from "../lib/operationalEntityFallback";

describe("Operational Entity Dossier Offline Fallback Engine", () => {
  it("generates a rich, structured EntityDossier for known entities like ent-person-arjun", () => {
    const dossier = getFallbackEntityDossier("ent-person-arjun");
    expect(dossier).toBeDefined();
    expect(dossier.entityId).toBe("ent-person-arjun");
    expect(dossier.type).toBe("Person");
    expect(dossier.profile?.name).toBe("Arjun Sharma");
    expect(dossier.profile?.threatLevel).toBe("CRITICAL");
    expect(dossier.aliases?.length).toBeGreaterThan(0);
    expect(dossier.riskIndicators?.length).toBeGreaterThan(0);
    expect(dossier.activityTimeline?.length).toBeGreaterThan(0);
  });

  it("generates a valid fallback dossier for any arbitrary entityId offline", () => {
    const dossier = getFallbackEntityDossier("ent-unknown-999");
    expect(dossier).toBeDefined();
    expect(dossier.entityId).toBe("ent-unknown-999");
    expect(dossier.profile?.name).toBeDefined();
    expect(dossier.activityTimeline).toBeDefined();
  });

  it("returns rich relationships for an entity offline", () => {
    const rels = getFallbackEntityRelationships("ent-person-arjun");
    expect(Array.isArray(rels)).toBe(true);
    expect(rels.length).toBeGreaterThan(0);
    const hasPhoneOrVehicle = rels.some(
      r => r.targetEntity?.type === "Phone" || r.targetEntity?.type === "Vehicle" || r.type === "ASSOCIATE_OF"
    );
    expect(hasPhoneOrVehicle).toBe(true);
  });
});
