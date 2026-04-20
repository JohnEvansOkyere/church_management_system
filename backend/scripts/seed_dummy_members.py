import random
import os
import sys
from datetime import date, timedelta

from sqlalchemy.orm import Session

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import SessionLocal
from app.models.member import Member

FIRST_NAMES = [
    "Kwame", "Kofi", "Kojo", "Yaw", "Ama", "Akosua", "Adwoa", "Abena", "Nana", "Esi",
    "Michael", "Daniel", "Grace", "Sarah", "Joseph", "Mary", "John", "Esther", "David", "Ruth",
]

LAST_NAMES = [
    "Okyere", "Mensah", "Boateng", "Asare", "Owusu", "Agyeman", "Appiah", "Asiedu", "Boadi", "Frimpong",
    "Ankomah", "Addo", "Nyarko", "Quaye", "Sarpong", "Tetteh", "Kwarteng", "Antwi", "Bempah", "Darko",
]

OCCUPATIONS = [
    "Teacher", "Nurse", "Trader", "Engineer", "Accountant", "Student", "Driver", "Farmer", "Pastor", "Technician",
]

MARITAL_STATUSES = ["single", "married", "divorced", "widowed"]
MEMBERSHIP_STATUSES = ["active", "active", "active", "visitor", "new_convert"]
GENDERS = ["male", "female"]


def rand_date(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, max(delta, 1)))


def seed_dummy_members(db: Session, count: int = 30) -> int:
    existing = db.query(Member).count()
    created = 0

    for idx in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        suffix = existing + idx + 1

        member = Member(
            first_name=first,
            last_name=last,
            other_name=None,
            gender=random.choice(GENDERS),
            date_of_birth=rand_date(date(1965, 1, 1), date(2010, 12, 31)),
            phone=f"+23324{random.randint(1000000, 9999999)}",
            email=f"{first.lower()}.{last.lower()}.{suffix}@example.com",
            address=f"House {random.randint(1, 250)}, East Legon, Accra",
            occupation=random.choice(OCCUPATIONS),
            marital_status=random.choice(MARITAL_STATUSES),
            membership_status=random.choice(MEMBERSHIP_STATUSES),
            date_joined=rand_date(date(2019, 1, 1), date.today()),
            baptism_date=rand_date(date(2018, 1, 1), date.today()),
            membership_class_completed=random.choice([True, False]),
            is_family_head=random.choice([True, False]),
        )
        db.add(member)
        created += 1

    db.commit()
    return created


def main() -> None:
    db = SessionLocal()
    try:
        created = seed_dummy_members(db, count=30)
        print(f"Created {created} dummy members")
    finally:
        db.close()


if __name__ == "__main__":
    main()
