from pydantic import BaseModel
from typing import List, Optional

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str
    phone_number: str
    role: Optional[str] = "tenant"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# --- PG Schemas ---
class PGBase(BaseModel):
    name: str
    location: str
    city: str
    rent: float
    deposit: float
    description: Optional[str] = None
    image_url: Optional[str] = None

class PGCreate(PGBase):
    pass

class PG(PGBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
