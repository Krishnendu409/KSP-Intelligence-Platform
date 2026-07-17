export interface CaseMasterRecord {
  CaseMasterID: number;
  CrimeNo: string; // 18-digit official ER format: Cat(1) + Dist(4) + PS(4) + Year(4) + Serial(5)
  CaseNo: string; // YYYY+Serial e.g. 202600001
  CrimeRegisteredDate: string;
  PoliceStationID: string;
  PoliceStationName: string;
  GravityOffenceID: 1 | 2; // 1 = Heinous, 2 = Non-Heinous
  CrimeMajorHead: string;
  CrimeMinorHead: string;
  latitude: number;
  longitude: number;
  BriefFacts: string;
  Status: 'UNDER INVESTIGATION' | 'CHARGE SHEET FILED' | 'ACCUSED IN CUSTODY' | 'INTERPOL ALERT FILED';
}

export interface ActSectionRecord {
  AssociationID: number;
  CaseMasterID: number;
  ActCode: 'IPC' | 'BNS' | 'NDPS' | 'IT_ACT' | 'ARMS_ACT' | 'POCSO' | 'SC_ST_ACT';
  SectionCode: string;
  Description: string;
}

export interface AccusedRecord {
  AccusedMasterID: number;
  CaseMasterID: number;
  AccusedName: string;
  PersonID: string; // e.g. A1, A2
  Age: number;
  CustodyStatus: 'ARRESTED' | 'WANTED' | 'INTERPOL RED NOTICE' | 'JUDICIAL CUSTODY';
  Role: string;
}

export interface VictimRecord {
  VictimMasterID: number;
  CaseMasterID: number;
  VictimName: string;
  InjuryType: string;
}

const CASE_MASTERS: CaseMasterRecord[] = [
  {
    CaseMasterID: 1,
    CrimeNo: '104430006202600001',
    CaseNo: '202600001',
    CrimeRegisteredDate: '2026-06-28',
    PoliceStationID: 'PS-INDIRANAGAR',
    PoliceStationName: 'Indiranagar Police Station',
    GravityOffenceID: 1,
    CrimeMajorHead: 'NARCOTICS & MONEY LAUNDERING',
    CrimeMinorHead: 'INTERSTATE HAWALA SYNDICATE',
    latitude: 12.9784,
    longitude: 77.6408,
    BriefFacts: 'Suspect Arjun Sharma and Vikram Desai intercepted at Indiranagar 100ft Road drop house with 1.5kg MDMA contraband, Hawala ledgers indicating Rs 4.2 Crore transfers via Dubai shell accounts.',
    Status: 'UNDER INVESTIGATION'
  },
  {
    CaseMasterID: 2,
    CrimeNo: '104430012202600002',
    CaseNo: '202600002',
    CrimeRegisteredDate: '2026-06-30',
    PoliceStationID: 'PS-KORAMANGALA',
    PoliceStationName: 'Koramangala Police Station',
    GravityOffenceID: 1,
    CrimeMajorHead: 'CRIMES AGAINST BODY',
    CrimeMinorHead: 'ATTEMPTED MURDER & EXTORTION',
    latitude: 12.9352,
    longitude: 77.6245,
    BriefFacts: 'Armed assault on real estate contractor at Koramangala 4th Block by syndicate operatives demanding extortion protection money. Weapon recovered at scene.',
    Status: 'ACCUSED IN CUSTODY'
  },
  {
    CaseMasterID: 3,
    CrimeNo: '104430018202600003',
    CaseNo: '202600003',
    CrimeRegisteredDate: '2026-07-02',
    PoliceStationID: 'PS-MGROAD',
    PoliceStationName: 'MG Road Cyber Crime Police Station',
    GravityOffenceID: 2,
    CrimeMajorHead: 'CYBER & FINANCIAL FRAUD',
    CrimeMinorHead: 'CRYPTO PHISHING SYNDICATE',
    latitude: 12.9756,
    longitude: 77.6066,
    BriefFacts: 'Phishing operation from MG Road commercial complex siphoning cryptocurrency into mule bank accounts linked to interstate syndicate. Rs 2.1 crore defrauded from 148 victims.',
    Status: 'CHARGE SHEET FILED'
  },
  {
    CaseMasterID: 4,
    CrimeNo: '104430024202600004',
    CaseNo: '202600004',
    CrimeRegisteredDate: '2026-07-05',
    PoliceStationID: 'PS-WHITEFIELD',
    PoliceStationName: 'Whitefield Division Police Station',
    GravityOffenceID: 1,
    CrimeMajorHead: 'ARMS TRAFFICKING',
    CrimeMinorHead: 'UNLICENSED WEAPON CACHE',
    latitude: 12.9698,
    longitude: 77.7499,
    BriefFacts: 'Intelligence raid uncovered 12 unlicensed 9mm pistols and ammunition stored in godown at EPIP Zone Whitefield intended for syndicate enforcement operatives.',
    Status: 'INTERPOL ALERT FILED'
  },
  {
    CaseMasterID: 5,
    CrimeNo: '104430030202600005',
    CaseNo: '202600005',
    CrimeRegisteredDate: '2026-07-08',
    PoliceStationID: 'PS-MALLESHWARAM',
    PoliceStationName: 'Malleshwaram Police Station',
    GravityOffenceID: 2,
    CrimeMajorHead: 'VEHICLE THEFT SYNDICATE',
    CrimeMinorHead: 'LUXURY VEHICLE CLONING',
    latitude: 13.0035,
    longitude: 77.5701,
    BriefFacts: 'Syndicate cell stealing luxury SUVs across North-West Bengaluru, forging chassis numbers and registration plates for cross-state transport. 7 vehicles recovered.',
    Status: 'UNDER INVESTIGATION'
  },
  {
    CaseMasterID: 6,
    CrimeNo: '104430036202600006',
    CaseNo: '202600006',
    CrimeRegisteredDate: '2026-07-10',
    PoliceStationID: 'PS-HSRLAYOUT',
    PoliceStationName: 'HSR Layout Police Station',
    GravityOffenceID: 1,
    CrimeMajorHead: 'MURDER',
    CrimeMinorHead: 'CONTRACT KILLING',
    latitude: 12.9116,
    longitude: 77.6370,
    BriefFacts: 'Body of real estate businessman found in HSR Layout Sector 7 park. Forensic analysis indicates targeted contract killing linked to Indiranagar syndicate land-grab operations. Victim had received 3 prior threats.',
    Status: 'UNDER INVESTIGATION'
  },
  {
    CaseMasterID: 7,
    CrimeNo: '104430042202600007',
    CaseNo: '202600007',
    CrimeRegisteredDate: '2026-07-11',
    PoliceStationID: 'PS-YELAHANKA',
    PoliceStationName: 'Yelahanka New Town Police Station',
    GravityOffenceID: 1,
    CrimeMajorHead: 'KIDNAPPING & ABDUCTION',
    CrimeMinorHead: 'CHILD ABDUCTION FOR RANSOM',
    latitude: 13.1004,
    longitude: 77.5963,
    BriefFacts: 'Minor child (8 yrs) of tech industry CEO abducted from school bus route near Yelahanka. Ransom demand of Rs 5 Crore via encrypted messaging app. Negotiation ongoing.',
    Status: 'UNDER INVESTIGATION'
  },
  {
    CaseMasterID: 8,
    CrimeNo: '104430048202600008',
    CaseNo: '202600008',
    CrimeRegisteredDate: '2026-07-09',
    PoliceStationID: 'PS-SHIVAJINAGAR',
    PoliceStationName: 'Shivajinagar Police Station',
    GravityOffenceID: 2,
    CrimeMajorHead: 'PROPERTY OFFENCES',
    CrimeMinorHead: 'BANK ROBBERY',
    latitude: 12.9833,
    longitude: 77.5971,
    BriefFacts: 'Armed robbery at Shivajinagar branch of State Bank. 3 masked suspects with improvised weapons took Rs 18 lakh cash and tied up bank employees. Getaway vehicle: Black Innova, partial plate KA05.',
    Status: 'ACCUSED IN CUSTODY'
  },
  {
    CaseMasterID: 9,
    CrimeNo: '104430054202600009',
    CaseNo: '202600009',
    CrimeRegisteredDate: '2026-07-06',
    PoliceStationID: 'PS-ELECTRONIC-CITY',
    PoliceStationName: 'Electronic City Police Station',
    GravityOffenceID: 1,
    CrimeMajorHead: 'HUMAN TRAFFICKING',
    CrimeMinorHead: 'LABOUR TRAFFICKING FOR FORCED WORK',
    latitude: 12.8422,
    longitude: 77.6602,
    BriefFacts: 'Rescue operation at Electronic City industrial unit. 23 migrant workers from Odisha and West Bengal found in illegal bondage conditions. Traffickers operated through fake recruitment agencies in Bihar.',
    Status: 'CHARGE SHEET FILED'
  },
  {
    CaseMasterID: 10,
    CrimeNo: '104430060202600010',
    CaseNo: '202600010',
    CrimeRegisteredDate: '2026-07-03',
    PoliceStationID: 'PS-BANNERGHATTA',
    PoliceStationName: 'Bannerghatta Road Police Station',
    GravityOffenceID: 2,
    CrimeMajorHead: 'NARCOTICS',
    CrimeMinorHead: 'CANNABIS SUPPLY CHAIN',
    latitude: 12.8640,
    longitude: 77.5970,
    BriefFacts: 'Ganja supply chain linked to Andhra Pradesh plantation estates. Intercepted 120kg consignment in produce truck near Bannerghatta checkpoint. Distributor Ravi Naik and 2 associates arrested.',
    Status: 'ACCUSED IN CUSTODY'
  },
  {
    CaseMasterID: 11,
    CrimeNo: '104430066202600011',
    CaseNo: '202600011',
    CrimeRegisteredDate: '2026-06-25',
    PoliceStationID: 'PS-JAYANAGAR',
    PoliceStationName: 'Jayanagar Police Station',
    GravityOffenceID: 1,
    CrimeMajorHead: 'CRIMES AGAINST WOMEN',
    CrimeMinorHead: 'SEXUAL ASSAULT & STALKING',
    latitude: 12.9302,
    longitude: 77.5835,
    BriefFacts: 'Serial predator targeting women at metro stations in Jayanagar and BTM Layout. 6 complainants identified. Accused Pavan Krishnamurthy found to have prior history in Tamil Nadu under different alias.',
    Status: 'ACCUSED IN CUSTODY'
  },
  {
    CaseMasterID: 12,
    CrimeNo: '104430072202600012',
    CaseNo: '202600012',
    CrimeRegisteredDate: '2026-06-22',
    PoliceStationID: 'PS-RAJAJINAGAR',
    PoliceStationName: 'Rajajinagar Police Station',
    GravityOffenceID: 2,
    CrimeMajorHead: 'ECONOMIC OFFENCES',
    CrimeMinorHead: 'FAKE INVESTMENT SCHEME',
    latitude: 12.9994,
    longitude: 77.5555,
    BriefFacts: 'Ponzi investment scheme defrauding 2,300 retail investors of Rs 42 crore. Accused Kumar Enterprises falsely claimed Sebi-registered status. Promoters fled to Dubai.',
    Status: 'INTERPOL ALERT FILED'
  },
  {
    CaseMasterID: 13,
    CrimeNo: '104430078202600013',
    CaseNo: '202600013',
    CrimeRegisteredDate: '2026-07-07',
    PoliceStationID: 'PS-KR-PURAM',
    PoliceStationName: 'KR Puram Police Station',
    GravityOffenceID: 1,
    CrimeMajorHead: 'RIOTING & PUBLIC DISORDER',
    CrimeMinorHead: 'ORGANIZED MOB ATTACK',
    latitude: 12.9856,
    longitude: 77.7006,
    BriefFacts: 'Organized gang attack on rival faction members at KR Puram market. 30-person mob armed with choppers and iron rods. 4 persons critically injured. CCTV footage identified 12 accused.',
    Status: 'ACCUSED IN CUSTODY'
  },
  {
    CaseMasterID: 14,
    CrimeNo: '104430084202600014',
    CaseNo: '202600014',
    CrimeRegisteredDate: '2026-07-01',
    PoliceStationID: 'PS-HEBBAL',
    PoliceStationName: 'Hebbal Police Station',
    GravityOffenceID: 2,
    CrimeMajorHead: 'IMMIGRATION & DOCUMENT FRAUD',
    CrimeMinorHead: 'FORGED PASSPORT NETWORK',
    latitude: 13.0358,
    longitude: 77.5970,
    BriefFacts: 'Racket manufacturing high-quality forged Indian passports and UAE visas discovered in Hebbal. Syndicate charged premium rates for trafficking routes via Bangladesh-Myanmar border.',
    Status: 'CHARGE SHEET FILED'
  },
  {
    CaseMasterID: 15,
    CrimeNo: '104430090202600015',
    CaseNo: '202600015',
    CrimeRegisteredDate: '2026-07-12',
    PoliceStationID: 'PS-BTMAYOUT',
    PoliceStationName: 'BTM Layout Police Station',
    GravityOffenceID: 1,
    CrimeMajorHead: 'POCSO & CHILD EXPLOITATION',
    CrimeMinorHead: 'ONLINE CSAM DISTRIBUTION',
    latitude: 12.9168,
    longitude: 77.6101,
    BriefFacts: 'Darknet investigation traced CSAM distribution ring to BTM Layout suspect using VPN infrastructure hosted via Zodiac FinTech shell servers. Rohan Varma identified as system administrator.',
    Status: 'UNDER INVESTIGATION'
  }
];

const ACT_SECTIONS: ActSectionRecord[] = [
  { AssociationID: 101, CaseMasterID: 1, ActCode: 'IPC', SectionCode: '120B', Description: 'Criminal Conspiracy' },
  { AssociationID: 102, CaseMasterID: 1, ActCode: 'NDPS', SectionCode: '21c', Description: 'Commercial Quantity Narcotic Drugs' },
  { AssociationID: 103, CaseMasterID: 1, ActCode: 'IPC', SectionCode: '420', Description: 'Cheating and Dishonestly Inducing Delivery of Property' },
  { AssociationID: 104, CaseMasterID: 2, ActCode: 'IPC', SectionCode: '307', Description: 'Attempt to Murder' },
  { AssociationID: 105, CaseMasterID: 2, ActCode: 'ARMS_ACT', SectionCode: '25(1)', Description: 'Possession of Unlicensed Firearm' },
  { AssociationID: 106, CaseMasterID: 2, ActCode: 'IPC', SectionCode: '384', Description: 'Extortion' },
  { AssociationID: 107, CaseMasterID: 3, ActCode: 'IT_ACT', SectionCode: '66D', Description: 'Cheating by Personation using Computer Resource' },
  { AssociationID: 108, CaseMasterID: 3, ActCode: 'IPC', SectionCode: '419', Description: 'Cheating by Personation' },
  { AssociationID: 109, CaseMasterID: 4, ActCode: 'ARMS_ACT', SectionCode: '25(1A)', Description: 'Prohibited Arms Possession' },
  { AssociationID: 110, CaseMasterID: 4, ActCode: 'IPC', SectionCode: '120B', Description: 'Criminal Conspiracy' },
  { AssociationID: 111, CaseMasterID: 5, ActCode: 'IPC', SectionCode: '379', Description: 'Theft of Motor Vehicle' },
  { AssociationID: 112, CaseMasterID: 5, ActCode: 'IPC', SectionCode: '467', Description: 'Forgery of Valuable Security' },
  { AssociationID: 113, CaseMasterID: 6, ActCode: 'IPC', SectionCode: '302', Description: 'Murder' },
  { AssociationID: 114, CaseMasterID: 6, ActCode: 'IPC', SectionCode: '120B', Description: 'Criminal Conspiracy to Murder' },
  { AssociationID: 115, CaseMasterID: 7, ActCode: 'IPC', SectionCode: '364A', Description: 'Kidnapping for Ransom' },
  { AssociationID: 116, CaseMasterID: 7, ActCode: 'IPC', SectionCode: '120B', Description: 'Criminal Conspiracy' },
  { AssociationID: 117, CaseMasterID: 8, ActCode: 'IPC', SectionCode: '392', Description: 'Robbery' },
  { AssociationID: 118, CaseMasterID: 8, ActCode: 'ARMS_ACT', SectionCode: '27', Description: 'Use of Arms in Offence' },
  { AssociationID: 119, CaseMasterID: 9, ActCode: 'IPC', SectionCode: '370', Description: 'Trafficking of Persons' },
  { AssociationID: 120, CaseMasterID: 9, ActCode: 'IPC', SectionCode: '374', Description: 'Unlawful Compulsory Labour' },
  { AssociationID: 121, CaseMasterID: 10, ActCode: 'NDPS', SectionCode: '20B', Description: 'Production / Manufacturing Cannabis' },
  { AssociationID: 122, CaseMasterID: 11, ActCode: 'IPC', SectionCode: '354D', Description: 'Stalking' },
  { AssociationID: 123, CaseMasterID: 11, ActCode: 'IPC', SectionCode: '376', Description: 'Rape' },
  { AssociationID: 124, CaseMasterID: 12, ActCode: 'IPC', SectionCode: '406', Description: 'Criminal Breach of Trust' },
  { AssociationID: 125, CaseMasterID: 12, ActCode: 'IPC', SectionCode: '420', Description: 'Cheating - Ponzi Scheme' },
  { AssociationID: 126, CaseMasterID: 13, ActCode: 'IPC', SectionCode: '147', Description: 'Rioting' },
  { AssociationID: 127, CaseMasterID: 13, ActCode: 'IPC', SectionCode: '148', Description: 'Rioting Armed with Deadly Weapon' },
  { AssociationID: 128, CaseMasterID: 13, ActCode: 'IPC', SectionCode: '324', Description: 'Voluntarily Causing Grievous Hurt' },
  { AssociationID: 129, CaseMasterID: 14, ActCode: 'IPC', SectionCode: '468', Description: 'Forgery for Purpose of Cheating' },
  { AssociationID: 130, CaseMasterID: 14, ActCode: 'IT_ACT', SectionCode: '66C', Description: 'Identity Theft' },
  { AssociationID: 131, CaseMasterID: 15, ActCode: 'POCSO', SectionCode: '14', Description: 'Using Child for Pornographic Purposes' },
  { AssociationID: 132, CaseMasterID: 15, ActCode: 'IT_ACT', SectionCode: '67B', Description: 'Publishing CSAM in Electronic Form' }
];

const ACCUSED_RECORDS: AccusedRecord[] = [
  { AccusedMasterID: 501, CaseMasterID: 1, AccusedName: 'Arjun Sharma', PersonID: 'A1', Age: 38, CustodyStatus: 'ARRESTED', Role: 'Hawala Syndicate Coordinator' },
  { AccusedMasterID: 502, CaseMasterID: 1, AccusedName: 'Vikram Desai', PersonID: 'A2', Age: 42, CustodyStatus: 'ARRESTED', Role: 'Contraband Courier Lead' },
  { AccusedMasterID: 503, CaseMasterID: 2, AccusedName: 'Ravi Kumar', PersonID: 'A1', Age: 34, CustodyStatus: 'JUDICIAL CUSTODY', Role: 'Enforcement Enforcer' },
  { AccusedMasterID: 504, CaseMasterID: 2, AccusedName: 'Santhosh B.', PersonID: 'A2', Age: 27, CustodyStatus: 'ARRESTED', Role: 'Assault Operative' },
  { AccusedMasterID: 505, CaseMasterID: 3, AccusedName: 'Karan Mehta', PersonID: 'A1', Age: 29, CustodyStatus: 'WANTED', Role: 'Cyber Phishing Specialist' },
  { AccusedMasterID: 506, CaseMasterID: 4, AccusedName: 'Daud Ibrahim Cell Liaison', PersonID: 'A1', Age: 45, CustodyStatus: 'INTERPOL RED NOTICE', Role: 'Arms Supplier' },
  { AccusedMasterID: 507, CaseMasterID: 5, AccusedName: 'Nawaz Khan', PersonID: 'A1', Age: 31, CustodyStatus: 'WANTED', Role: 'Vehicle Theft Leader' },
  { AccusedMasterID: 508, CaseMasterID: 6, AccusedName: 'Arjun Sharma', PersonID: 'A1', Age: 38, CustodyStatus: 'WANTED', Role: 'Contract Killing Instigator' },
  { AccusedMasterID: 509, CaseMasterID: 6, AccusedName: 'Shooter Unknown (Alias: Cobra)', PersonID: 'A2', Age: 0, CustodyStatus: 'WANTED', Role: 'Hired Contract Killer' },
  { AccusedMasterID: 510, CaseMasterID: 7, AccusedName: 'Murugan S.', PersonID: 'A1', Age: 44, CustodyStatus: 'WANTED', Role: 'Kidnap Ring Organizer' },
  { AccusedMasterID: 511, CaseMasterID: 8, AccusedName: 'Anwar Hussain', PersonID: 'A1', Age: 26, CustodyStatus: 'ARRESTED', Role: 'Bank Robbery Lead' },
  { AccusedMasterID: 512, CaseMasterID: 9, AccusedName: 'Trafficking Ring (Bihar)', PersonID: 'A1', Age: 50, CustodyStatus: 'ARRESTED', Role: 'Labour Trafficker' },
  { AccusedMasterID: 513, CaseMasterID: 10, AccusedName: 'Ravi Naik', PersonID: 'A1', Age: 35, CustodyStatus: 'ARRESTED', Role: 'Cannabis Distributor' },
  { AccusedMasterID: 514, CaseMasterID: 11, AccusedName: 'Pavan Krishnamurthy', PersonID: 'A1', Age: 33, CustodyStatus: 'JUDICIAL CUSTODY', Role: 'Serial Predator' },
  { AccusedMasterID: 515, CaseMasterID: 12, AccusedName: 'Kumar Enterprises Directors', PersonID: 'A1', Age: 55, CustodyStatus: 'INTERPOL RED NOTICE', Role: 'Ponzi Scheme Operator' },
  { AccusedMasterID: 516, CaseMasterID: 13, AccusedName: 'Gangwar Leader (Alias: Tiger)', PersonID: 'A1', Age: 40, CustodyStatus: 'ARRESTED', Role: 'Mob Leader' },
  { AccusedMasterID: 517, CaseMasterID: 14, AccusedName: 'Passport Forgery Network', PersonID: 'A1', Age: 38, CustodyStatus: 'ARRESTED', Role: 'Document Forger' },
  { AccusedMasterID: 518, CaseMasterID: 15, AccusedName: 'Rohan Varma', PersonID: 'A1', Age: 29, CustodyStatus: 'WANTED', Role: 'Darknet CSAM System Admin' }
];

const VICTIM_RECORDS: VictimRecord[] = [
  { VictimMasterID: 901, CaseMasterID: 2, VictimName: 'Suresh Gowda (Contractor)', InjuryType: 'Severe Gunshot Wound to Shoulder' },
  { VictimMasterID: 902, CaseMasterID: 3, VictimName: 'State Bank & Tech Park Employees (148 victims)', InjuryType: 'Financial Fraud - Rs 2.1 Crore Lost' },
  { VictimMasterID: 903, CaseMasterID: 6, VictimName: 'Ramesh Patil (Real Estate Businessman)', InjuryType: 'Deceased - Gunshot Wounds (3)' },
  { VictimMasterID: 904, CaseMasterID: 7, VictimName: 'Minor Child (M/8), Son of CEO', InjuryType: 'Abducted - Unharmed (In Captivity)' },
  { VictimMasterID: 905, CaseMasterID: 8, VictimName: 'SBI Shivajinagar Branch Staff (5 persons)', InjuryType: 'Minor Physical Trauma - Bound & Threatened' },
  { VictimMasterID: 906, CaseMasterID: 9, VictimName: '23 Migrant Workers (Odisha / WB)', InjuryType: 'Physical Abuse + Labour Bondage' },
  { VictimMasterID: 907, CaseMasterID: 11, VictimName: '6 Women Complainants (Metro Station)', InjuryType: 'Sexual Assault / Stalking Trauma' },
  { VictimMasterID: 908, CaseMasterID: 12, VictimName: '2,300 Retail Investors', InjuryType: 'Financial Loss - Rs 42 Crore' },
  { VictimMasterID: 909, CaseMasterID: 13, VictimName: '4 Market Persons (Rival Faction)', InjuryType: 'Critical Injuries - ICU' }
];

export function getAllCaseMasters(): CaseMasterRecord[] {
  return CASE_MASTERS;
}

export function getCaseByCrimeNo(crimeNo: string): CaseMasterRecord | undefined {
  return CASE_MASTERS.find(c => c.CrimeNo === crimeNo);
}

export function getCaseById(caseMasterId: number): CaseMasterRecord | undefined {
  return CASE_MASTERS.find(c => c.CaseMasterID === caseMasterId);
}

export function getActSectionsForCase(caseMasterId: number): ActSectionRecord[] {
  return ACT_SECTIONS.filter(a => a.CaseMasterID === caseMasterId);
}

export function getAccusedForCase(caseMasterId: number): AccusedRecord[] {
  return ACCUSED_RECORDS.filter(a => a.CaseMasterID === caseMasterId);
}

export function getVictimsForCase(caseMasterId: number): VictimRecord[] {
  return VICTIM_RECORDS.filter(v => v.CaseMasterID === caseMasterId);
}

export function searchCases(query: string): CaseMasterRecord[] {
  const q = query.toLowerCase();
  return CASE_MASTERS.filter(c =>
    c.CrimeNo.includes(query) ||
    c.PoliceStationName.toLowerCase().includes(q) ||
    c.BriefFacts.toLowerCase().includes(q) ||
    c.CrimeMajorHead.toLowerCase().includes(q) ||
    c.CrimeMinorHead.toLowerCase().includes(q) ||
    c.Status.toLowerCase().includes(q)
  );
}
