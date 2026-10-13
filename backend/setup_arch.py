import os
import shutil

base = r"d:\Manasvi\Tanent\backend"

# 1. Create directories
dirs = [
    "app",
    "app/models",
    "app/routes",
    "app/schemas",
    "app/services"
]
for d in dirs:
    os.makedirs(os.path.join(base, d), exist_ok=True)

# 2. Create __init__.py files
for d in dirs:
    with open(os.path.join(base, d, "__init__.py"), "w") as f:
        f.write("")

# 3. Create config.py, .env, .env.example, requirements.txt
with open(os.path.join(base, "app", "config.py"), "w") as f:
    f.write("# Configuration settings\n")

with open(os.path.join(base, ".env"), "w") as f:
    f.write("DATABASE_URL=sqlite:///./sql_app.db\nSECRET_KEY=mysecretkey\n")

with open(os.path.join(base, ".env.example"), "w") as f:
    f.write("DATABASE_URL=\nSECRET_KEY=\n")

with open(os.path.join(base, "requirements.txt"), "w") as f:
    f.write("fastapi\nuvicorn\nsqlalchemy\npydantic\n")

# 4. Move files
files_to_move = {
    "database.py": "app/database.py",
    "seed.py": "app/seed.py"
}

for src, dst in files_to_move.items():
    if os.path.exists(os.path.join(base, src)):
        shutil.move(os.path.join(base, src), os.path.join(base, dst))

# 5. Move and rename models and schemas
if os.path.exists(os.path.join(base, "models.py")):
    shutil.move(os.path.join(base, "models.py"), os.path.join(base, "app", "models", "domain.py"))

if os.path.exists(os.path.join(base, "schemas.py")):
    shutil.move(os.path.join(base, "schemas.py"), os.path.join(base, "app", "schemas", "dto.py"))

# 6. We will manually rewrite app/main.py after this script runs, 
# so let's just delete the old main.py to prevent confusion.
if os.path.exists(os.path.join(base, "main.py")):
    os.remove(os.path.join(base, "main.py"))

print("Architecture setup complete.")
