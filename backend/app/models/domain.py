from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(255))
    phone_number = Column(String(50))
    role = Column(String(50), default="tenant") # tenant or owner

    pgs = relationship("PG", back_populates="owner")

class PG(Base):
    __tablename__ = "pgs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    location = Column(String(255))
    city = Column(String(100))
    rent = Column(Float)
    deposit = Column(Float)
    description = Column(Text)
    image_url = Column(String(500), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="pgs")

class JoinRequest(Base):
    __tablename__ = "join_requests"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"))
    pg_id = Column(Integer, ForeignKey("pgs.id"))
    status = Column(String(50), default="Pending") # Pending, Approved, Rejected

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"))
    pg_id = Column(Integer, ForeignKey("pgs.id"))
    title = Column(String(255))
    description = Column(Text)
    status = Column(String(50), default="Open") # Open, In Progress, Resolved

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"))
    pg_id = Column(Integer, ForeignKey("pgs.id"))
    rating = Column(Integer)
    comment = Column(Text)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"))
    pg_id = Column(Integer, ForeignKey("pgs.id"))
    amount = Column(Float)
    description = Column(String(255))
    method = Column(String(50))
    status = Column(String(50), default="Paid")
    date = Column(String(50)) # Using string for simplicity, ideally DateTime

class SavedProperty(Base):
    __tablename__ = "saved_properties"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"))
    pg_id = Column(Integer, ForeignKey("pgs.id"))

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String(255))
    is_read = Column(Boolean, default=False)
    created_at = Column(String(50))
