from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import domain as models
from app.schemas import dto as schemas

router = APIRouter(prefix="/pgs", tags=["PGs"])

@router.get("/", response_model=List[schemas.PG])
def read_pgs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    pgs = db.query(models.PG).offset(skip).limit(limit).all()
    return pgs

@router.get("/{pg_id}")
def read_pg(pg_id: int, db: Session = Depends(get_db)):
    pg = db.query(models.PG).filter(models.PG.id == pg_id).first()
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
        
    reviews = db.query(models.Review, models.User).join(models.User, models.Review.tenant_id == models.User.id).filter(models.Review.pg_id == pg_id).all()
    rev_res = [{"id": r.id, "rating": r.rating, "comment": r.comment, "user_name": u.full_name} for r, u in reviews]
    
    # We can use schemas.PG.from_orm or just dump dict
    pg_dict = {
        "id": pg.id, "name": pg.name, "location": pg.location, "city": pg.city, 
        "rent": pg.rent, "deposit": pg.deposit, "description": pg.description, 
        "image_url": pg.image_url, "owner_id": pg.owner_id
    }
    pg_dict["reviews"] = rev_res
    return pg_dict

from pydantic import BaseModel
class ReviewCreate(BaseModel):
    rating: int
    comment: str

from app.routes.auth import get_current_user
@router.post("/{pg_id}/reviews")
def create_review(pg_id: int, review: ReviewCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    new_rev = models.Review(tenant_id=user.id, pg_id=pg_id, rating=review.rating, comment=review.comment)
    db.add(new_rev)
    db.commit()
    return {"message": "Review added"}
