from sqlalchemy import Column, Integer, String, Date, DateTime, Float, ForeignKey, Boolean, CHAR, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class CaseCategory(Base):
    __tablename__ = 'CaseCategory'
    CaseCategoryID = Column(Integer, primary_key=True)
    LookupValue = Column(String)

class GravityOffence(Base):
    __tablename__ = 'GravityOffence'
    GravityOffenceID = Column(Integer, primary_key=True)
    LookupValue = Column(String)

class CrimeHead(Base):
    __tablename__ = 'CrimeHead'
    CrimeHeadID = Column(Integer, primary_key=True)
    CrimeGroupName = Column(String)
    Active = Column(Boolean)

class CrimeSubHead(Base):
    __tablename__ = 'CrimeSubHead'
    CrimeSubHeadID = Column(Integer, primary_key=True)
    CrimeHeadID = Column(Integer, ForeignKey('CrimeHead.CrimeHeadID'))
    CrimeHeadName = Column(String)
    SeqID = Column(Integer)

class CaseStatusMaster(Base):
    __tablename__ = 'CaseStatusMaster'
    CaseStatusID = Column(Integer, primary_key=True)
    CaseStatusName = Column(String)

class UnitType(Base):
    __tablename__ = 'UnitType'
    UnitTypeID = Column(Integer, primary_key=True)
    UnitTypeName = Column(String)
    CityDistState = Column(String)

class State(Base):
    __tablename__ = 'State'
    StateID = Column(Integer, primary_key=True)
    StateName = Column(String)
    NationalityID = Column(Integer)
    Active = Column(Boolean)

class District(Base):
    __tablename__ = 'District'
    DistrictID = Column(Integer, primary_key=True)
    DistrictName = Column(String)
    StateID = Column(Integer, ForeignKey('State.StateID'))
    Active = Column(Boolean)

class Unit(Base):
    __tablename__ = 'Unit'
    UnitID = Column(Integer, primary_key=True)
    UnitName = Column(String)
    TypeID = Column(Integer, ForeignKey('UnitType.UnitTypeID'))
    ParentUnit = Column(Integer) # self-referencing
    NationalityID = Column(Integer)
    StateID = Column(Integer, ForeignKey('State.StateID'))
    DistrictID = Column(Integer, ForeignKey('District.DistrictID'))
    Active = Column(Boolean)

class Court(Base):
    __tablename__ = 'Court'
    CourtID = Column(Integer, primary_key=True)
    CourtName = Column(String)
    DistrictID = Column(Integer, ForeignKey('District.DistrictID'))
    StateID = Column(Integer, ForeignKey('State.StateID'))
    Active = Column(Boolean)

class Rank(Base):
    __tablename__ = 'Rank'
    RankID = Column(Integer, primary_key=True)
    RankName = Column(String)
    Hierarchy = Column(Integer)
    Active = Column(Boolean)

class Designation(Base):
    __tablename__ = 'Designation'
    DesignationID = Column(Integer, primary_key=True)
    DesignationName = Column(String)
    Active = Column(Boolean)
    SortOrder = Column(Integer)

class Employee(Base):
    __tablename__ = 'Employee'
    EmployeeID = Column(Integer, primary_key=True)
    DistrictID = Column(Integer, ForeignKey('District.DistrictID'))
    UnitID = Column(Integer, ForeignKey('Unit.UnitID'))
    RankID = Column(Integer, ForeignKey('Rank.RankID'))
    DesignationID = Column(Integer, ForeignKey('Designation.DesignationID'))
    KGID = Column(String)
    FirstName = Column(String)
    EmployeeDOB = Column(Date)
    GenderID = Column(Integer)
    BloodGroupID = Column(Integer)
    PhysicallyChallenged = Column(Boolean)
    AppointmentDate = Column(Date)

class CaseMaster(Base):
    __tablename__ = 'CaseMaster'
    CaseMasterID = Column(Integer, primary_key=True)
    CrimeNo = Column(String)
    CaseNo = Column(String)
    CrimeRegisteredDate = Column(Date)
    PolicePersonID = Column(Integer, ForeignKey('Employee.EmployeeID'))
    PoliceStationID = Column(Integer, ForeignKey('Unit.UnitID'))
    CaseCategoryID = Column(Integer, ForeignKey('CaseCategory.CaseCategoryID'))
    GravityOffenceID = Column(Integer, ForeignKey('GravityOffence.GravityOffenceID'))
    CrimeMajorHeadID = Column(Integer, ForeignKey('CrimeHead.CrimeHeadID'))
    CrimeMinorHeadID = Column(Integer, ForeignKey('CrimeSubHead.CrimeSubHeadID'))
    CaseStatusID = Column(Integer, ForeignKey('CaseStatusMaster.CaseStatusID'))
    CourtID = Column(Integer, ForeignKey('Court.CourtID'))
    IncidentFromDate = Column(DateTime)
    IncidentToDate = Column(DateTime)
    InfoReceivedPSDate = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)
    BriefFacts = Column(Text)

class Accused(Base):
    __tablename__ = 'Accused'
    AccusedMasterID = Column(Integer, primary_key=True)
    CaseMasterID = Column(Integer, ForeignKey('CaseMaster.CaseMasterID'))
    AccusedName = Column(String)
    AgeYear = Column(Integer)
    GenderID = Column(Integer)
    PersonID = Column(String)

class ArrestSurrender(Base):
    __tablename__ = 'ArrestSurrender'
    ArrestSurrenderID = Column(Integer, primary_key=True)
    CaseMasterID = Column(Integer, ForeignKey('CaseMaster.CaseMasterID'))
    ArrestSurrenderTypeID = Column(Integer)
    ArrestSurrenderDate = Column(Date)
    ArrestSurrenderStateId = Column(Integer, ForeignKey('State.StateID'))
    ArrestSurrenderDistrictId = Column(Integer, ForeignKey('District.DistrictID'))
    PoliceStationID = Column(Integer, ForeignKey('Unit.UnitID'))
    IOID = Column(Integer, ForeignKey('Employee.EmployeeID'))
    CourtID = Column(Integer, ForeignKey('Court.CourtID'))
    AccusedMasterID = Column(Integer, ForeignKey('Accused.AccusedMasterID'))
    IsAccused = Column(Boolean)
    IsComplainantAccused = Column(Boolean)

class ChargesheetDetails(Base):
    __tablename__ = 'ChargesheetDetails'
    CSID = Column(Integer, primary_key=True)
    CaseMasterID = Column(Integer, ForeignKey('CaseMaster.CaseMasterID'))
    csdate = Column(DateTime)
    cstype = Column(CHAR(1))
    PolicePersonID = Column(Integer, ForeignKey('Employee.EmployeeID'))

class Act(Base):
    __tablename__ = 'Act'
    ActCode = Column(String, primary_key=True)
    ActDescription = Column(String)
    ShortName = Column(String)
    Active = Column(Boolean)

class Section(Base):
    __tablename__ = 'Section'
    ActCode = Column(String, ForeignKey('Act.ActCode'))
    SectionCode = Column(String, primary_key=True)
    SectionDescription = Column(String)
    Active = Column(Boolean)

class ActSectionAssociation(Base):
    __tablename__ = 'ActSectionAssociation'
    CaseMasterID = Column(Integer, ForeignKey('CaseMaster.CaseMasterID'), primary_key=True)
    ActID = Column(String, ForeignKey('Act.ActCode'), primary_key=True)
    SectionID = Column(String, ForeignKey('Section.SectionCode'), primary_key=True)
    ActOrderID = Column(Integer)
    SectionOrderID = Column(Integer)

class Victim(Base):
    __tablename__ = 'Victim'
    VictimMasterID = Column(Integer, primary_key=True)
    CaseMasterID = Column(Integer, ForeignKey('CaseMaster.CaseMasterID'))
    VictimName = Column(String)
    AgeYear = Column(Integer)
    GenderID = Column(Integer)
    VictimPolice = Column(String)

class CasteMaster(Base):
    __tablename__ = 'CasteMaster'
    caste_master_id = Column(Integer, primary_key=True)
    caste_master_name = Column(String)

class ReligionMaster(Base):
    __tablename__ = 'ReligionMaster'
    ReligionID = Column(Integer, primary_key=True)
    ReligionName = Column(String)

class OccupationMaster(Base):
    __tablename__ = 'OccupationMaster'
    OccupationID = Column(Integer, primary_key=True)
    OccupationName = Column(String)

class ComplainantDetails(Base):
    __tablename__ = 'ComplainantDetails'
    ComplainantID = Column(Integer, primary_key=True)
    CaseMasterID = Column(Integer, ForeignKey('CaseMaster.CaseMasterID'))
    ComplainantName = Column(String)
    AgeYear = Column(Integer)
    OccupationID = Column(Integer, ForeignKey('OccupationMaster.OccupationID'))
    ReligionID = Column(Integer, ForeignKey('ReligionMaster.ReligionID'))
    CasteID = Column(Integer, ForeignKey('CasteMaster.caste_master_id'))
    GenderID = Column(Integer)
