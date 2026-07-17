export interface RawPerson {
  name?: string;
  alias?: string;
  phone?: string;
  address?: string;
  bankAccount?: string;
  imei?: string;
}

export interface RawIncident {
  date: string;
  time?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  description: string;
}

export interface RawVehicle {
  registrationNumber?: string;
  make?: string;
  model?: string;
  color?: string;
  ownerName?: string;
}

export interface RawFIR {
  firId: string;
  registrationDate: string;
  district: string;
  policeStation: string;
  sections: string[];
  complainant?: RawPerson;
  accused: RawPerson[];
  incident: RawIncident;
  vehicles?: RawVehicle[];
}
