import sys
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models import domain as models
from app.services.auth import get_password_hash

def seed():
    # Ensure tables are completely cleared (disable FK checks for MySQL drops)
    with engine.begin() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        models.Base.metadata.drop_all(bind=conn)
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    # 1. Create Users (Owners)
    demo_pw = get_password_hash("password123")
    owner1 = models.User(
        email="owner1@the-tenant.com", 
        full_name="Rajesh Kumar", 
        phone_number="9876543210", 
        role="owner", 
        hashed_password=demo_pw
    )
    owner2 = models.User(
        email="owner2@the-tenant.com", 
        full_name="Priya Sharma", 
        phone_number="8765432109", 
        role="owner", 
        hashed_password=demo_pw
    )
    db.add(owner1)
    db.add(owner2)
    db.commit()

    # 2. Create PGs
    pgs = [
        models.PG(
            name="Imperial PG-2",
            location="Hinjewadi Phase 1",
            city="Pune",
            rent=8500,
            deposit=15000,
            description="Premium boys PG with high-speed Wi-Fi, daily housekeeping, and 3 meals a day. Walking distance from IT Park.",
            owner_id=owner1.id,
            image_url="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
        ),
        models.PG(
            name="Sunrise Girls Accommodation",
            location="Kothrud",
            city="Pune",
            rent=7000,
            deposit=10000,
            description="Safe and secure girls PG with CCTV, attached bathrooms, and AC rooms available.",
            owner_id=owner1.id,
            image_url="https://images.unsplash.com/photo-1502672260266-1c1e52b154ce?w=800&q=80"
        ),
        models.PG(
            name="Elite Co-Living",
            location="Koramangala",
            city="Bangalore",
            rent=12000,
            deposit=25000,
            description="Modern co-living space for professionals. Includes gym, gaming zone, and fully furnished studio rooms.",
            owner_id=owner2.id,
            image_url="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
        ),
        models.PG(
            name="Green View Homes",
            location="Indiranagar",
            city="Bangalore",
            rent=10500,
            deposit=20000,
            description="Peaceful residential area, fully furnished twin-sharing rooms with balcony and washing machine.",
            owner_id=owner2.id,
            image_url="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"
        ),
        models.PG(
            name="Viman Nagar Nest",
            location="Viman Nagar",
            city="Pune",
            rent=9000,
            deposit=15000,
            description="Close to Symbiosis college. Includes food, Wi-Fi, and 24/7 power backup.",
            owner_id=owner2.id,
            image_url="https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80"
        )
    ]
    
    for pg in pgs:
        db.add(pg)
    db.commit()
    
    # 3. Create Tenant
    tenant = models.User(
        email="tenant@the-tenant.com", 
        full_name="Amit Patel", 
        phone_number="7654321098", 
        role="tenant", 
        hashed_password=demo_pw
    )
    db.add(tenant)
    db.commit()

    # Create Super Admin
    admin = models.User(
        email="admin@the-tenant.com",
        full_name="Super Admin",
        phone_number="9999999999",
        role="super_admin",
        hashed_password=demo_pw
    )
    db.add(admin)
    db.commit()
    
    # 4. Create Mock Data
    pg1 = db.query(models.PG).filter(models.PG.name == "Imperial PG-2").first()
    pg2 = db.query(models.PG).filter(models.PG.name == "Elite Co-Living").first()
    
    if pg1 and pg2:
        # Join Request
        req = models.JoinRequest(tenant_id=tenant.id, pg_id=pg1.id, status="Approved")
        db.add(req)
        
        # Complaint
        comp = models.Complaint(tenant_id=tenant.id, pg_id=pg1.id, title="AC not cooling", description="The AC in room 102 is blowing warm air.", status="Open")
        db.add(comp)
        
        # Payment
        pay1 = models.Payment(tenant_id=tenant.id, pg_id=pg1.id, amount=8500, description="October Rent", method="UPI", status="Paid", date="Oct 01, 2026")
        pay2 = models.Payment(tenant_id=tenant.id, pg_id=pg1.id, amount=15000, description="Security Deposit", method="Net Banking", status="Paid", date="Sep 15, 2026")
        db.add(pay1)
        db.add(pay2)
        
        # Review
        rev = models.Review(tenant_id=tenant.id, pg_id=pg1.id, rating=4, comment="Great place, food is decent and the wifi is really fast.")
        db.add(rev)
        
        # Saved Property
        save = models.SavedProperty(tenant_id=tenant.id, pg_id=pg2.id)
        db.add(save)
        
        # Notification
        notif1 = models.Notification(user_id=tenant.id, message="Your request to join Imperial PG-2 was approved", is_read=False, created_at="2 days ago")
        notif2 = models.Notification(user_id=owner1.id, message="Amit Patel raised a new complaint", is_read=False, created_at="1 hour ago")
        db.add(notif1)
        db.add(notif2)
        
        db.commit()

    db.close()
    print("Successfully seeded the database with complete mock profiles!")

if __name__ == "__main__":
    seed()
