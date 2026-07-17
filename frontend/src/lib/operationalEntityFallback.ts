import type { EntityDossier, RelationshipWithEvidence } from "@shared/client";

export function getFallbackEntityDossier(entityId: string, fallbackName?: string): EntityDossier {
  const normalizedId = entityId.toLowerCase();

  if (normalizedId.includes("arjun") || normalizedId === "ent-person-arjun") {
    return {
      entityId: "ent-person-arjun",
      type: "Person",
      profile: {
        name: "Arjun Sharma",
        aliases: ["Vicky", "A.S.", "Hawala-Kingpin"],
        nationalId: "NID-9988-7766-IND",
        threatLevel: "CRITICAL",
        natoGrade: "A1",
        status: "ACTIVE_SURVEILLANCE",
        address: "No. 42, 4th Block, Koramangala, Bengaluru - 560034",
        phone: "+91 98765 43210",
        notes: "Primary suspect in syndicate hawala laundering operations under FIR-2026-0889."
      },
      aliases: ["Vicky", "A.S.", "Hawala-Kingpin"],
      riskIndicators: [
        "Hawala international bridge node ($450,000 unverified inflow)",
        "Flight risk across Nepal/UAE corridor",
        "Encrypted satellite communication device detected at safehouse"
      ],
      activityTimeline: [
        {
          id: "ev-01",
          timestamp: "2026-07-12T01:15:00Z",
          title: "Safehouse Rendezvous Intercepted",
          description: "Arjun observed meeting associate Vikram Desai near Koramangala 100ft Road.",
          location: "Koramangala Safehouse Alpha",
          type: "SURVEILLANCE_LOG",
          severity: "HIGH"
        },
        {
          id: "ev-02",
          timestamp: "2026-07-11T21:40:00Z",
          title: "ANPR Vehicle Match",
          description: "Toyota Fortuner KA-01-AB-1234 registered to Arjun flagged at Electronic City toll gate.",
          location: "Electronic City Toll Booth #4",
          type: "ANPR_MATCH",
          severity: "MEDIUM"
        },
        {
          id: "ev-03",
          timestamp: "2026-07-10T14:30:00Z",
          title: "High-Value Hawala Wire Transfer",
          description: "Syndicate transfer executed through Zodiac FinTech Shell account.",
          location: "MG Road Cyber Division",
          type: "FINANCIAL_ALERT",
          severity: "CRITICAL"
        }
      ],
      networkSummary: {
        directConnections: 7,
        degreesOfSeparation: 1
      }
    };
  }

  if (normalizedId.includes("vikram") || normalizedId === "ent-person-vikram") {
    return {
      entityId: "ent-person-vikram",
      type: "Person",
      profile: {
        name: "Vikram 'Vicky' Desai",
        aliases: ["Vicky-D", "Courier-East"],
        nationalId: "NID-4433-2211-IND",
        threatLevel: "HIGH",
        natoGrade: "B2",
        status: "ACTIVE_SURVEILLANCE",
        address: "Flat 204, Indiranagar 1st Stage, Bengaluru - 560038",
        phone: "+91 91234 56789",
        notes: "Logistics and transit operator for regional distribution network."
      },
      aliases: ["Vicky-D", "Courier-East"],
      riskIndicators: [
        "Multiple burner SIM registrations identified",
        "Previous conviction under NDPS Act (2023)"
      ],
      activityTimeline: [
        {
          id: "ev-v1",
          timestamp: "2026-07-12T01:15:00Z",
          title: "Safehouse Rendezvous Intercepted",
          description: "Observed with Arjun Sharma in Koramangala.",
          location: "Koramangala Safehouse Alpha",
          type: "SURVEILLANCE_LOG",
          severity: "HIGH"
        }
      ],
      networkSummary: {
        directConnections: 5,
        degreesOfSeparation: 1
      }
    };
  }

  if (normalizedId.includes("fortuner") || normalizedId.includes("ka-01") || normalizedId === "ent-vehicle-fortuner") {
    return {
      entityId: "ent-vehicle-fortuner",
      type: "Vehicle",
      profile: {
        name: "KA-01-AB-1234 (Toyota Fortuner)",
        plateNumber: "KA-01-AB-1234",
        threatLevel: "CRITICAL",
        natoGrade: "A1",
        status: "FLAGGED_INTERCEPT",
        notes: "Primary transit vehicle used by syndicate leadership."
      },
      aliases: ["KA-01-AB-1234", "Black Fortuner"],
      riskIndicators: [
        "ANPR flag across multiple jurisdiction border checkpoints",
        "Vehicle linked to FIR-2026-0889 crime scene transport"
      ],
      activityTimeline: [
        {
          id: "ev-veh1",
          timestamp: "2026-07-11T21:40:00Z",
          title: "ANPR Detection",
          description: "Flagged travelling North on Hosur Road towards Electronic City.",
          location: "Hosur Road ANPR Gantry",
          type: "ANPR_MATCH",
          severity: "CRITICAL"
        }
      ],
      networkSummary: {
        directConnections: 3,
        degreesOfSeparation: 1
      }
    };
  }

  // Dynamic deterministic fallback for any other entity ID
  const displayTitle = fallbackName || entityId
    .replace(/^ent-[a-z]+-/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());

  return {
    entityId: entityId,
    type: entityId.includes("vehicle") ? "Vehicle" : entityId.includes("phone") ? "Phone" : "Person",
    profile: {
      name: displayTitle || entityId,
      threatLevel: "MODERATE",
      natoGrade: "B2",
      status: "ACTIVE_SURVEILLANCE",
      notes: `Operational intelligence dossier for ${displayTitle || entityId} in Sector Command.`
    },
    aliases: [displayTitle || entityId],
    riskIndicators: [
      "Intelligence cross-match in sector sweep database",
      "Associated with active operational surveillance radius"
    ],
    activityTimeline: [
      {
        id: `ev-${entityId}-1`,
        timestamp: new Date().toISOString(),
        title: "Intelligence Record Retrieved",
        description: `Dossier compiled from Bengaluru Police Operational Registry for ${displayTitle || entityId}.`,
        location: "Bengaluru Central Sector",
        type: "SURVEILLANCE_LOG",
        severity: "MEDIUM"
      }
    ],
    networkSummary: {
      directConnections: 2,
      degreesOfSeparation: 2
    }
  };
}

export function getFallbackEntityRelationships(entityId: string): RelationshipWithEvidence[] {
  return [
    {
      relationshipId: `rel-${entityId}-arjun`,
      sourceEntity: { id: entityId, type: "Person", name: entityId },
      targetEntity: { id: "ent-person-arjun", type: "Person", name: "Arjun Sharma" },
      type: "ASSOCIATE_OF",
      evidence: [
        { type: "CDR_INTERCEPT", sourceId: "ev-rel-1", description: "18 encrypted calls over 14 days" }
      ]
    },
    {
      relationshipId: `rel-${entityId}-phone`,
      sourceEntity: { id: entityId, type: "Person", name: entityId },
      targetEntity: { id: "ent-phone-arjun-1", type: "Phone", name: "+91 98765 43210" },
      type: "USES_COMMUNICATION",
      evidence: [
        { type: "TOWER_TRIANGULATION", sourceId: "ev-rel-2", description: "IMEI matched to Koramangala cell tower." }
      ]
    },
    {
      relationshipId: `rel-${entityId}-vehicle`,
      sourceEntity: { id: entityId, type: "Person", name: entityId },
      targetEntity: { id: "ent-vehicle-fortuner", type: "Vehicle", name: "KA-01-AB-1234 (Toyota Fortuner)" },
      type: "REGISTERED_OWNER",
      evidence: [
        { type: "RTO_REGISTRATION", sourceId: "ev-rel-3", description: "Karnataka RTO vehicle registry." }
      ]
    }
  ];
}
