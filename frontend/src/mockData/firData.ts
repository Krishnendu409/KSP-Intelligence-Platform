export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Suspect {
  id: string;
  name: string;
  alias?: string;
  age: number;
  riskScore: number;
}

export interface FIR {
  id: string;
  firNumber: string;
  dateReported: string;
  crimeType: string;
  status: 'Open' | 'Under Investigation' | 'Closed';
  location: Location;
  suspects: Suspect[];
  description: string;
}

// Mock Data for Bangalore
export const MOCK_FIRS: FIR[] = [
  {
    id: "fir-001",
    firNumber: "KRM-2023-0105",
    dateReported: "2023-10-15T08:30:00Z",
    crimeType: "Robbery",
    status: "Under Investigation",
    location: {
      lat: 12.9352,
      lng: 77.6245,
      address: "80 Feet Road, Koramangala 4th Block, Bangalore"
    },
    suspects: [
      { id: "sus-101", name: "Ramesh Kumar", alias: "Ramu", age: 34, riskScore: 85 }
    ],
    description: "Chain snatching incident near the signal. Two men on a black motorcycle."
  },
  {
    id: "fir-002",
    firNumber: "IND-2023-0422",
    dateReported: "2023-10-18T19:45:00Z",
    crimeType: "Vehicle Theft",
    status: "Open",
    location: {
      lat: 12.9784,
      lng: 77.6408,
      address: "100 Feet Road, Indiranagar, Bangalore"
    },
    suspects: [],
    description: "Royal Enfield Classic 350 stolen from outside the cafe."
  },
  {
    id: "fir-003",
    firNumber: "MSR-2023-0089",
    dateReported: "2023-10-20T23:15:00Z",
    crimeType: "Assault",
    status: "Closed",
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: "MG Road, Bangalore"
    },
    suspects: [
      { id: "sus-102", name: "Suresh P", age: 28, riskScore: 60 }
    ],
    description: "Brawl outside a pub. One person injured with minor cuts."
  },
  {
    id: "fir-004",
    firNumber: "WFD-2023-1102",
    dateReported: "2023-11-02T14:00:00Z",
    crimeType: "Cyber Crime",
    status: "Open",
    location: {
      lat: 12.9698,
      lng: 77.7499,
      address: "ITPB, Whitefield, Bangalore"
    },
    suspects: [],
    description: "Phishing scam reported by a tech employee. Lost Rs. 50,000."
  },
  {
    id: "fir-005",
    firNumber: "KRM-2023-0112",
    dateReported: "2023-11-05T21:30:00Z",
    crimeType: "Robbery",
    status: "Under Investigation",
    location: {
      lat: 12.9345,
      lng: 77.6260,
      address: "Sony World Signal, Koramangala, Bangalore"
    },
    suspects: [
      { id: "sus-101", name: "Ramesh Kumar", alias: "Ramu", age: 34, riskScore: 85 },
      { id: "sus-103", name: "Vinod", age: 25, riskScore: 75 }
    ],
    description: "Another chain snatching incident matching the MO of FIR KRM-2023-0105."
  }
];
