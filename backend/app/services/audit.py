import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, Text
from app.database.database import Base, SessionLocal

class AuditLog(Base):
    __tablename__ = 'AuditLog'
    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer)
    role = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    question = Column(Text)
    generated_sql = Column(Text)
    tables_touched = Column(String)
    confidence = Column(Float)

def log_query(userId: int, role: str, question: str, sql: str, tables: list, confidence: float):
    db = SessionLocal()
    try:
        log = AuditLog(
            userId=userId,
            role=role,
            question=question,
            generated_sql=sql,
            tables_touched=",".join(tables),
            confidence=confidence
        )
        db.add(log)
        db.commit()
    finally:
        db.close()
