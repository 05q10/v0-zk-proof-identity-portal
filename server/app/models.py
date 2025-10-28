# app/models.py
from sqlalchemy import Column, Integer, String, Date, LargeBinary
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "encrypted_data"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(LargeBinary, nullable=False)
    date_of_birth = Column(LargeBinary, nullable=False)
    gender = Column(LargeBinary, nullable=False)
    email_id = Column(String, unique=True, nullable=False)
    mobile_number = Column(LargeBinary, nullable=False)
    address = Column(LargeBinary, nullable=False)
    aadhar_number = Column(LargeBinary, nullable=False)
    pan_number = Column(LargeBinary, nullable=False)
