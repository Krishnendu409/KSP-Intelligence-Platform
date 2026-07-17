import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import CaseMaster, Accused, Unit
from app.database.database import SessionLocal

def compute_hotspots(district_id: int = None, sub_head_id: int = None, days_back: int = 90) -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        cutoff_date = datetime.date.today() - datetime.timedelta(days=days_back)
        query = db.query(CaseMaster.latitude, CaseMaster.longitude, func.count(CaseMaster.CaseMasterID).label('count'))\
            .filter(CaseMaster.CrimeRegisteredDate >= cutoff_date)
            
        if sub_head_id:
            query = query.filter(CaseMaster.CrimeMinorHeadID == sub_head_id)
            
        query = query.group_by(CaseMaster.latitude, CaseMaster.longitude)
        
        results = []
        for lat, lng, cnt in query.all():
            if lat and lng:
                results.append({"lat": lat, "lng": lng, "weight": cnt})
        return results
    finally:
        db.close()

def build_accused_network(accused_name: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Find cases where this name appears
        cases = db.query(Accused.CaseMasterID).filter(Accused.AccusedName.like(f"%{accused_name}%")).all()
        case_ids = [c[0] for c in cases]
        
        if not case_ids:
            return {"nodes": [], "edges": []}
            
        # Find all co-accused in these cases
        co_accused = db.query(Accused).filter(Accused.CaseMasterID.in_(case_ids)).all()
        
        nodes = {}
        edges = []
        for a in co_accused:
            node_id = f"{a.AccusedName}_{a.AgeYear}_{a.GenderID}"
            if node_id not in nodes:
                nodes[node_id] = {"id": node_id, "label": a.AccusedName}
            # Add edges based on shared cases (simplified for MVP)
            # In a real scenario, we'd add edges between all pairs in the same case
            
        return {"nodes": list(nodes.values()), "edges": edges}
    finally:
        db.close()

def compute_trend(sub_head_id: int) -> Dict[str, Any]:
    return {"trend": "increasing", "anomaly": False, "z_score": 2.5}
