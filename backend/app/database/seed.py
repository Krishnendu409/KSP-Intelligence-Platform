import random
from datetime import datetime, timedelta
from app.database.database import SessionLocal, init_db
from app.database.models import (
    State, District, UnitType, Unit, Court, Rank, Designation, Employee,
    CrimeHead, CrimeSubHead, CaseCategory, GravityOffence, CaseStatusMaster,
    Act, Section, ReligionMaster, CasteMaster, OccupationMaster,
    CaseMaster, Accused, Victim, ArrestSurrender, ChargesheetDetails, ActSectionAssociation
)

def seed_data():
    init_db()
    db = SessionLocal()
    
    # Basic Lookups
    karnataka = State(StateID=1, StateName="Karnataka", Active=True)
    db.merge(karnataka)
    
    bengaluru_east = District(DistrictID=1, DistrictName="Bengaluru East", StateID=1, Active=True)
    mysuru = District(DistrictID=2, DistrictName="Mysuru", StateID=1, Active=True)
    db.merge(bengaluru_east)
    db.merge(mysuru)
    
    ps_type = UnitType(UnitTypeID=1, UnitTypeName="Police Station", CityDistState="City")
    db.merge(ps_type)
    
    ps_indiranagar = Unit(UnitID=1, UnitName="Indiranagar PS", TypeID=1, StateID=1, DistrictID=1, Active=True)
    ps_kr_puram = Unit(UnitID=2, UnitName="KR Puram PS", TypeID=1, StateID=1, DistrictID=1, Active=True)
    ps_kuvempunagar = Unit(UnitID=3, UnitName="Kuvempunagar PS", TypeID=1, StateID=1, DistrictID=2, Active=True)
    db.merge(ps_indiranagar)
    db.merge(ps_kr_puram)
    db.merge(ps_kuvempunagar)

    court_1 = Court(CourtID=1, CourtName="City Civil Court", DistrictID=1, StateID=1, Active=True)
    db.merge(court_1)

    rank_sho = Rank(RankID=1, RankName="Inspector", Hierarchy=2, Active=True)
    desig_sho = Designation(DesignationID=1, DesignationName="SHO", Active=True, SortOrder=1)
    db.merge(rank_sho)
    db.merge(desig_sho)
    
    emp_sho = Employee(EmployeeID=1, DistrictID=1, UnitID=1, RankID=1, DesignationID=1, FirstName="Rajesh", EmployeeDOB=datetime(1980,1,1), GenderID=1, PhysicallyChallenged=False)
    db.merge(emp_sho)

    ch_body = CrimeHead(CrimeHeadID=1, CrimeGroupName="Crimes Against Body", Active=True)
    ch_prop = CrimeHead(CrimeHeadID=2, CrimeGroupName="Crimes Against Property", Active=True)
    db.merge(ch_body)
    db.merge(ch_prop)

    csh_robbery = CrimeSubHead(CrimeSubHeadID=1, CrimeHeadID=2, CrimeHeadName="Robbery", SeqID=1)
    csh_burglary = CrimeSubHead(CrimeSubHeadID=2, CrimeHeadID=2, CrimeHeadName="Burglary", SeqID=2)
    csh_assault = CrimeSubHead(CrimeSubHeadID=3, CrimeHeadID=1, CrimeHeadName="Assault", SeqID=3)
    csh_women = CrimeSubHead(CrimeSubHeadID=4, CrimeHeadID=1, CrimeHeadName="Crime Against Women", SeqID=4)
    db.merge(csh_robbery)
    db.merge(csh_burglary)
    db.merge(csh_assault)
    db.merge(csh_women)

    cc_fir = CaseCategory(CaseCategoryID=1, LookupValue="FIR")
    db.merge(cc_fir)

    go_heinous = GravityOffence(GravityOffenceID=1, LookupValue="Heinous")
    go_non = GravityOffence(GravityOffenceID=2, LookupValue="Non-Heinous")
    db.merge(go_heinous)
    db.merge(go_non)

    cs_pending = CaseStatusMaster(CaseStatusID=1, CaseStatusName="Under Investigation")
    cs_charged = CaseStatusMaster(CaseStatusID=2, CaseStatusName="Charge Sheeted")
    db.merge(cs_pending)
    db.merge(cs_charged)

    act_ipc = Act(ActCode="IPC", ActDescription="Indian Penal Code", ShortName="IPC", Active=True)
    db.merge(act_ipc)

    sec_392 = Section(ActCode="IPC", SectionCode="392", SectionDescription="Robbery", Active=True)
    sec_454 = Section(ActCode="IPC", SectionCode="454", SectionDescription="Burglary", Active=True)
    db.merge(sec_392)
    db.merge(sec_454)

    db.commit()

    # Synthetic Cases for Use Cases
    # Robbery hotspot in Bengaluru East (Unit 1 & 2) in last 90 days
    base_date = datetime.now()
    
    for i in range(42): # "42 robbery cases in Bengaluru East"
        cm = CaseMaster(
            CaseMasterID=i+1,
            CrimeNo=f"10001202600{i:03d}",
            CaseNo=f"202600{i:03d}",
            CrimeRegisteredDate=(base_date - timedelta(days=random.randint(1, 80))).date(),
            PolicePersonID=1,
            PoliceStationID=random.choice([1, 2]), # Indiranagar or KR Puram (both in Bengaluru East)
            CaseCategoryID=1,
            GravityOffenceID=1,
            CrimeMajorHeadID=2,
            CrimeMinorHeadID=1, # Robbery
            CaseStatusID=1,
            CourtID=1,
            latitude=12.97 + random.uniform(-0.02, 0.02),
            longitude=77.64 + random.uniform(-0.02, 0.02)
        )
        db.merge(cm)

    # Repeat offender cross-district (Burglary)
    cm_burglary_1 = CaseMaster(CaseMasterID=101, PoliceStationID=1, CrimeMinorHeadID=2, CrimeRegisteredDate=base_date.date())
    cm_burglary_2 = CaseMaster(CaseMasterID=102, PoliceStationID=3, CrimeMinorHeadID=2, CrimeRegisteredDate=base_date.date()) # Mysuru
    db.merge(cm_burglary_1)
    db.merge(cm_burglary_2)
    
    # Same name + age + gender = repeat offender
    accused_1 = Accused(AccusedMasterID=1, CaseMasterID=101, AccusedName="Ramesh", AgeYear=32, GenderID=1, PersonID="A1")
    accused_2 = Accused(AccusedMasterID=2, CaseMasterID=102, AccusedName="Ramesh", AgeYear=32, GenderID=1, PersonID="A1")
    db.merge(accused_1)
    db.merge(accused_2)

    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_data()
