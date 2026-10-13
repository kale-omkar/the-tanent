from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine
from app.models import domain as models
from app.routes import pgs, auth, tenant, owner, admin
import os

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="The Tenant API", version="1.0.0")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images as static files
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include Routers
app.include_router(auth.router)
app.include_router(pgs.router)
app.include_router(tenant.router)
app.include_router(owner.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to The Tenant API"}
