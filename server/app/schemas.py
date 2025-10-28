from pydantic import BaseModel, EmailStr, Field, constr

class UserCreate(BaseModel):
    full_name: str
    date_of_birth: str
    gender: str
    email_id: EmailStr
    mobile_number: str
    address: str
    aadhar_number: str
    pan_number: str
    passcode: str = Field(..., pattern=r'^[A-Za-z0-9]{6}$', min_length=6, max_length=6)
