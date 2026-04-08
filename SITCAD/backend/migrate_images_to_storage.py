"""
One-time migration: move base64 images from DB → Firebase Storage.

Usage:
    cd backend
    source venv/bin/activate
    python migrate_images_to_storage.py
"""
import os
import uuid
import base64
from pathlib import Path
from dotenv import load_dotenv

_DIR = Path(__file__).resolve().parent
load_dotenv(_DIR / ".env")

import firebase_admin
from firebase_admin import credentials, storage
import database
import models
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

# Initialise Firebase
cred = credentials.Certificate(str(_DIR / "sitcad-sabahsprout-firebase-adminsdk.json"))
firebase_admin.initialize_app(cred, {
    "storageBucket": os.environ.get(
        "FIREBASE_STORAGE_BUCKET", "sitcad-sabahsprout.firebasestorage.app"
    ),
})

bucket = storage.bucket()


def _upload_b64(b64_str: str) -> str | None:
    """Decode base64, upload to Firebase Storage, return public URL."""
    try:
        image_bytes = base64.b64decode(b64_str)
        blob_name = f"activity-images/{uuid.uuid4()}.png"
        blob = bucket.blob(blob_name)
        blob.upload_from_string(image_bytes, content_type="image/png")
        blob.make_public()
        return blob.public_url
    except Exception as e:
        print(f"  Warning: upload failed: {e}")
        return None


def migrate_activity(activity: models.Activity) -> bool:
    """Migrate a single activity's images. Returns True if modified."""
    content = activity.generated_content
    if not content:
        return False

    modified = False

    # Flashcard images
    for img in content.get("images", []):
        b64 = img.get("image_b64")
        if b64:
            url = _upload_b64(b64)
            if url:
                img["image_url"] = url
                del img["image_b64"]
                modified = True

    # Story page images
    for page in content.get("pages", []):
        b64 = page.get("image_b64")
        if b64:
            url = _upload_b64(b64)
            if url:
                page["image_url"] = url
                del page["image_b64"]
                modified = True

    if modified:
        activity.generated_content = content
        flag_modified(activity, "generated_content")

    return modified


def main():
    db: Session = database.SessionLocal()
    try:
        activities = db.query(models.Activity).filter(
            models.Activity.generated_content.isnot(None)
        ).all()

        print(f"Found {len(activities)} activities with generated_content")
        migrated = 0
        for act in activities:
            print(f"  [{act.activity_type}] {act.title} ... ", end="", flush=True)
            if migrate_activity(act):
                migrated += 1
                print("migrated")
            else:
                print("no base64 images")

        if migrated:
            db.commit()
        print(f"\nDone. Migrated {migrated}/{len(activities)} activities.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
