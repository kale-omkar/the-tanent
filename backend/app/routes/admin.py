from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import domain as models
from app.routes.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Super Admin"])


def require_admin(user: models.User = Depends(get_current_user)):
    if user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin access required")
    return user


@router.get("/stats")
def get_platform_stats(db: Session = Depends(get_db), user: models.User = Depends(require_admin)):
    return {
        "total_users": db.query(models.User).count(),
        "total_tenants": db.query(models.User).filter(models.User.role == "tenant").count(),
        "total_owners": db.query(models.User).filter(models.User.role == "owner").count(),
        "total_pgs": db.query(models.PG).count(),
        "total_complaints": db.query(models.Complaint).count(),
        "open_complaints": db.query(models.Complaint).filter(models.Complaint.status.ilike("open")).count(),
        "total_payments": db.query(models.Payment).count(),
        "total_join_requests": db.query(models.JoinRequest).count(),
        "approved_requests": db.query(models.JoinRequest).filter(models.JoinRequest.status.ilike("approved")).count(),
    }


@router.get("/users")
def get_all_users(db: Session = Depends(get_db), user: models.User = Depends(require_admin)):
    users = db.query(models.User).all()
    return [{"id": u.id, "full_name": u.full_name, "email": u.email, "role": u.role, "phone_number": u.phone_number} for u in users]


@router.get("/pgs")
def get_all_pgs(db: Session = Depends(get_db), user: models.User = Depends(require_admin)):
    pgs = db.query(models.PG, models.User).join(models.User, models.PG.owner_id == models.User.id).all()
    return [{"id": pg.id, "name": pg.name, "city": pg.city, "location": pg.location, "rent": pg.rent, "deposit": pg.deposit, "owner_name": owner.full_name, "owner_email": owner.email} for pg, owner in pgs]


@router.get("/complaints")
def get_all_complaints(db: Session = Depends(get_db), user: models.User = Depends(require_admin)):
    results = db.query(models.Complaint, models.User, models.PG).join(models.User, models.Complaint.tenant_id == models.User.id).join(models.PG, models.Complaint.pg_id == models.PG.id).all()
    return [{"id": c.id, "title": c.title, "description": c.description, "status": c.status, "tenant_name": u.full_name, "pg_name": pg.name, "pg_city": pg.city} for c, u, pg in results]


@router.get("/payments")
def get_all_payments(db: Session = Depends(get_db), user: models.User = Depends(require_admin)):
    results = db.query(models.Payment, models.User, models.PG).join(models.User, models.Payment.tenant_id == models.User.id).join(models.PG, models.Payment.pg_id == models.PG.id).all()
    return [{"id": pay.id, "amount": pay.amount, "method": pay.method, "status": pay.status, "date": pay.date, "description": pay.description, "tenant_name": u.full_name, "pg_name": pg.name} for pay, u, pg in results]


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), user: models.User = Depends(require_admin)):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.role == "super_admin":
        raise HTTPException(status_code=400, detail="Cannot delete a super admin")
    db.delete(target)
    db.commit()
    return {"message": f"User {target.full_name} deleted"}


@router.put("/complaints/{comp_id}/status")
def admin_update_complaint(comp_id: int, payload: dict, db: Session = Depends(get_db), user: models.User = Depends(require_admin)):
    comp = db.query(models.Complaint).filter(models.Complaint.id == comp_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    comp.status = payload.get("status", comp.status)
    db.commit()
    return {"message": "Complaint status updated"}
