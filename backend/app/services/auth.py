from pydantic import BaseModel
from typing import Optional

class UserRole(BaseModel):
    userId: int
    role: str # SHO, IO, Analyst, SCRB, SP
    unitId: Optional[int] = None
    districtId: Optional[int] = None
    stateId: Optional[int] = None

def get_current_user(token: str) -> UserRole:
    # In a real scenario, decode JWT. For hackathon MVP, mock it.
    if token == "mock_scrb_token":
        return UserRole(userId=999, role="SCRB", stateId=1)
    elif token == "mock_sho_token":
        return UserRole(userId=1, role="SHO", unitId=1, districtId=1, stateId=1)
    else:
        # Default to a restricted SHO for safety
        return UserRole(userId=1, role="SHO", unitId=1, districtId=1, stateId=1)
