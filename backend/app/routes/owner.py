from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import domain as models
from app.routes.auth import get_current_user
from pydantic import BaseModel
import os, aiofiles, uuid

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/owner", tags=["Owner Dashboard"])

class JoinRequestUpdate(BaseModel):
    status: str

@router.get("/dashboard")
def get_owner_dashboard(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    my_pgs = db.query(models.PG).filter(models.PG.owner_id == user.id).all()
    pg_ids = [pg.id for pg in my_pgs]
    
    # Get all join requests for my PGs
    requests = db.query(models.JoinRequest, models.User, models.PG).join(models.User, models.JoinRequest.tenant_id == models.User.id).join(models.PG, models.JoinRequest.pg_id == models.PG.id).filter(models.JoinRequest.pg_id.in_(pg_ids)).all()
    
    req_res = []
    for r, u, p in requests:
        req_res.append({
            "id": r.id,
            "tenant_name": u.full_name,
            "pg_name": p.name,
            "status": r.status
        })
        
    return {
        "pgs": [{"id": p.id, "name": p.name, "rent": p.rent} for p in my_pgs],
        "requests": req_res
    }

@router.put("/join-requests/{req_id}")
def update_join_request(req_id: int, update: JoinRequestUpdate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    req = db.query(models.JoinRequest).filter(models.JoinRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    req.status = update.status
    db.commit()
    
    # Create notification for tenant
    msg = f"Your request to join was {update.status.lower()}"
    notif = models.Notification(user_id=req.tenant_id, message=msg, created_at="Just now")
    db.add(notif)
    db.commit()
    
    return {"message": "Updated"}

class PGCreate(BaseModel):
    name: str
    location: str
    city: str
    rent: float
    deposit: float
    description: str

@router.post("/properties")
def create_property(pg: PGCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    new_pg = models.PG(
        name=pg.name,
        location=pg.location,
        city=pg.city,
        rent=pg.rent,
        deposit=pg.deposit,
        description=pg.description,
        owner_id=user.id,
        image_url="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" # Default image
    )
    db.add(new_pg)
    db.commit()
    return {"message": "Property added successfully"}

@router.get("/complaints")
def get_owner_complaints(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    my_pgs = db.query(models.PG).filter(models.PG.owner_id == user.id).all()
    pg_ids = [pg.id for pg in my_pgs]
    
    complaints = db.query(models.Complaint, models.User, models.PG).join(models.User, models.Complaint.tenant_id == models.User.id).join(models.PG, models.Complaint.pg_id == models.PG.id).filter(models.Complaint.pg_id.in_(pg_ids)).all()
    
    res = []
    for c, u, p in complaints:
        res.append({
            "id": c.id,
            "tenant_name": u.full_name,
            "pg_name": p.name,
            "title": c.title,
            "description": c.description,
            "status": c.status
        })
    return res

class ComplaintUpdate(BaseModel):
    status: str

@router.put("/complaints/{comp_id}")
def update_complaint(comp_id: int, update: ComplaintUpdate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    comp = db.query(models.Complaint).filter(models.Complaint.id == comp_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Not found")
        
    comp.status = update.status
    db.commit()
    
    msg = f"Your complaint #{comp.id} was marked as {update.status}"
    notif = models.Notification(user_id=comp.tenant_id, message=msg, created_at="Just now")
    db.add(notif)
    db.commit()
    return {"message": "Updated"}


@router.post("/properties/{pg_id}/upload-image")
async def upload_pg_image(
    pg_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    if user.role != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")

    pg = db.query(models.PG).filter(models.PG.id == pg_id, models.PG.owner_id == user.id).first()
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found or not yours")

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP, or GIF images are allowed")

    # Save file with a unique name
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(filepath, "wb") as out:
        content = await file.read()
        await out.write(content)

    # Update PG image URL to the static served path
    pg.image_url = f"/static/uploads/{filename}"
    db.commit()

    return {"message": "Image uploaded successfully", "image_url": pg.image_url}
