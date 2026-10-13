from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import domain as models
from app.routes.auth import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/tenant", tags=["Tenant Dashboard"])

class JoinRequestCreate(BaseModel):
    pg_id: int

class ComplaintCreate(BaseModel):
    pg_id: int
    title: str
    description: str

@router.post("/join")
def create_join_request(req: JoinRequestCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role == "owner":
        raise HTTPException(status_code=403, detail="Owners cannot send join requests.")

    pg = db.query(models.PG).filter(models.PG.id == req.pg_id).first()
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found.")

    existing = db.query(models.JoinRequest).filter_by(tenant_id=user.id, pg_id=req.pg_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already sent a join request to this PG.")
    
    new_req = models.JoinRequest(tenant_id=user.id, pg_id=req.pg_id, status="Pending")
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return {"message": "Request sent successfully", "request_id": new_req.id, "status": "Pending"}

@router.get("/join/{pg_id}/status")
def get_join_status(pg_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    req = db.query(models.JoinRequest).filter_by(tenant_id=user.id, pg_id=pg_id).first()
    if req:
        return {"has_requested": True, "status": req.status, "request_id": req.id}
    return {"has_requested": False, "status": None, "request_id": None}

@router.delete("/join/{req_id}")
def cancel_join_request(req_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    req = db.query(models.JoinRequest).filter(
        models.JoinRequest.id == req_id,
        models.JoinRequest.tenant_id == user.id
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    if req.status.lower() == "approved":
        raise HTTPException(status_code=400, detail="Cannot cancel an approved request.")
    db.delete(req)
    db.commit()
    return {"message": "Request cancelled successfully"}

@router.get("/join-requests")
def get_my_requests(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    reqs = db.query(models.JoinRequest, models.PG).join(models.PG, models.JoinRequest.pg_id == models.PG.id).filter(models.JoinRequest.tenant_id == user.id).order_by(models.JoinRequest.id.desc()).all()
    res = []
    for r, pg in reqs:
        res.append({
            "id": r.id,
            "status": r.status,
            "pg_id": pg.id,
            "pg_name": pg.name,
            "pg_location": pg.location,
            "pg_city": pg.city,
            "pg_rent": pg.rent,
            "pg_image_url": pg.image_url
        })
    return res

@router.get("/active-stay")
def get_active_stay(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    # Find approved join request
    req = db.query(models.JoinRequest, models.PG).join(models.PG, models.JoinRequest.pg_id == models.PG.id).filter(
        models.JoinRequest.tenant_id == user.id, 
        models.JoinRequest.status.ilike("approved")
    ).first()
    
    if req:
        _, pg = req
        return {"id": pg.id, "name": pg.name, "rent": pg.rent, "city": pg.city}
    return None

@router.post("/complaints")
def create_complaint(req: ComplaintCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    new_comp = models.Complaint(tenant_id=user.id, pg_id=req.pg_id, title=req.title, description=req.description, status="open")
    db.add(new_comp)
    db.commit()
    return {"message": "Complaint filed successfully"}

@router.get("/complaints")
def get_my_complaints(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    complaints = db.query(models.Complaint, models.PG).join(models.PG, models.Complaint.pg_id == models.PG.id).filter(models.Complaint.tenant_id == user.id).all()
    res = []
    for c, pg in complaints:
        res.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "status": c.status,
            "pg_name": pg.name
        })
    return res

class PaymentCreate(BaseModel):
    pg_id: int
    amount: float
    method: str

@router.post("/payments")
def create_payment(req: PaymentCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    from datetime import datetime
    new_pay = models.Payment(
        tenant_id=user.id, 
        pg_id=req.pg_id, 
        amount=req.amount, 
        description="Rent Payment",
        method=req.method,
        date=datetime.now().strftime("%b %d, %Y")
    )
    db.add(new_pay)
    db.commit()
    return {"message": "Payment successful"}

@router.get("/payments")
def get_payments(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    payments = db.query(models.Payment, models.PG).join(models.PG, models.Payment.pg_id == models.PG.id).filter(models.Payment.tenant_id == user.id).all()
    res = []
    for pay, pg in payments:
        res.append({
            "id": pay.id,
            "date": pay.date,
            "description": pay.description,
            "method": pay.method,
            "amount": pay.amount,
            "status": pay.status,
            "pg_name": pg.name
        })
    return res

@router.post("/saved/{pg_id}")
def save_property(pg_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    pg = db.query(models.PG).filter(models.PG.id == pg_id).first()
    if not pg:
        raise HTTPException(status_code=404, detail="PG property not found")

    existing = db.query(models.SavedProperty).filter_by(tenant_id=user.id, pg_id=pg_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Removed from wishlist", "is_saved": False}
    db.add(models.SavedProperty(tenant_id=user.id, pg_id=pg_id))
    db.commit()
    return {"message": "Saved to wishlist", "is_saved": True}

@router.delete("/saved/{pg_id}")
def remove_saved_property(pg_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    existing = db.query(models.SavedProperty).filter_by(tenant_id=user.id, pg_id=pg_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Removed from wishlist", "is_saved": False}
    return {"message": "Property was not saved", "is_saved": False}

@router.get("/saved/{pg_id}/status")
def get_saved_status(pg_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    existing = db.query(models.SavedProperty).filter_by(tenant_id=user.id, pg_id=pg_id).first()
    return {"is_saved": existing is not None}

@router.get("/saved")
def get_saved(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    saved = db.query(models.SavedProperty, models.PG).join(models.PG, models.SavedProperty.pg_id == models.PG.id).filter(models.SavedProperty.tenant_id == user.id).all()
    res = []
    for s, pg in saved:
        res.append({
            "id": pg.id,
            "name": pg.name,
            "location": pg.location,
            "city": pg.city,
            "rent": pg.rent,
            "deposit": pg.deposit,
            "description": pg.description,
            "image_url": pg.image_url,
            "owner_id": pg.owner_id
        })
    return res

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    notifs = db.query(models.Notification).filter(models.Notification.user_id == user.id).order_by(models.Notification.id.desc()).all()
    return notifs
