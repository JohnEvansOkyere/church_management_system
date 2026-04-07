# DATABASE.md — Database Schema & Models

## Database: PostgreSQL via Supabase

All models are defined using **SQLAlchemy** in `backend/app/models/`.
Migrations are managed with **Alembic**.

---

## Tables Overview

| Table | Description |
|---|---|
| `users` | Login accounts and roles |
| `members` | Church member profiles |
| `families` | Family groupings |
| `attendance_sessions` | A single service/event attendance was taken for |
| `attendance_records` | Individual member attendance per session |
| `donation_funds` | Church finance funds/categories (Tithe, Offering, Harvest, Building Fund, etc.) |
| `donations` | Individual giving records |
| `groups` | Church ministries and departments |
| `group_members` | Members assigned to groups |
| `events` | Church events and programs |
| `event_registrations` | Member registrations for events |
| `communications` | Log of SMS/email messages sent |
| `pastoral_logs` | Pastoral follow-up notes per member |
| `audit_logs` | Tracks all changes in the system |

---

## Detailed Schema

### `users`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
email           VARCHAR UNIQUE NOT NULL
hashed_password VARCHAR NOT NULL
role            VARCHAR NOT NULL  -- superadmin, secretary, finance, group_leader, member
is_active       BOOLEAN DEFAULT TRUE
member_id       UUID FK members.id NULLABLE  -- links user to a member profile
created_at      TIMESTAMP DEFAULT NOW()
```

### `members`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
first_name      VARCHAR NOT NULL
last_name       VARCHAR NOT NULL
other_name      VARCHAR
photo_url       VARCHAR
gender          VARCHAR  -- male, female
date_of_birth   DATE
phone           VARCHAR
email           VARCHAR
address         TEXT
occupation      VARCHAR
marital_status  VARCHAR  -- single, married, divorced, widowed
membership_status VARCHAR  -- active, inactive, visitor, new_convert
date_joined     DATE
baptism_date    DATE
membership_class_completed BOOLEAN DEFAULT FALSE
family_id       UUID FK families.id NULLABLE
is_family_head  BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### `families`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
family_name VARCHAR NOT NULL
created_at  TIMESTAMP DEFAULT NOW()
```

### `attendance_sessions`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
title       VARCHAR NOT NULL  -- e.g. "Sunday Service", "Midweek Prayer"
session_date DATE NOT NULL
session_type VARCHAR  -- sunday_service, midweek, prayer, special
notes        TEXT
created_by   UUID FK users.id
created_at   TIMESTAMP DEFAULT NOW()
```

### `attendance_records`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
session_id  UUID FK attendance_sessions.id
member_id   UUID FK members.id
status      VARCHAR  -- present, absent, excused
checked_in_at TIMESTAMP
notes       TEXT
```

### `donation_funds`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
name        VARCHAR NOT NULL  -- Tithe, Offering, Harvest, Building Fund, Missions, Welfare, Thanksgiving
description TEXT
is_active   BOOLEAN DEFAULT TRUE
```

### `donations`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
member_id   UUID FK members.id NULLABLE  -- nullable for anonymous or loose offering
fund_id     UUID FK donation_funds.id
amount      NUMERIC(12, 2) NOT NULL
currency    VARCHAR DEFAULT 'GHS'
payment_method VARCHAR  -- cash, mobile_money, cheque, online
reference   VARCHAR  -- transaction reference
donation_date DATE NOT NULL
notes       TEXT
recorded_by UUID FK users.id
created_at  TIMESTAMP DEFAULT NOW()
```

## Finance Expansion Guidance

To support a full church finance module, the system should later expand beyond giving records into:

### `finance_batches`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
title           VARCHAR NOT NULL  -- e.g. "Sunday Service 1st Collection"
service_date    DATE NOT NULL
service_type    VARCHAR
recorded_by     UUID FK users.id
created_at      TIMESTAMP DEFAULT NOW()
```

### `pledges`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
member_id       UUID FK members.id NULLABLE
campaign_name   VARCHAR NOT NULL  -- e.g. Harvest 2026, Building Project
target_amount   NUMERIC(12, 2) NOT NULL
start_date      DATE
end_date        DATE
status          VARCHAR  -- active, fulfilled, cancelled
created_at      TIMESTAMP DEFAULT NOW()
```

### `pledge_payments`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
pledge_id       UUID FK pledges.id
donation_id     UUID FK donations.id
amount          NUMERIC(12, 2) NOT NULL
payment_date    DATE NOT NULL
```

### `expense_categories`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR NOT NULL  -- Utilities, Welfare, Missions, Payroll, Maintenance
description     TEXT
is_active       BOOLEAN DEFAULT TRUE
```

### `expenses`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
category_id     UUID FK expense_categories.id
amount          NUMERIC(12, 2) NOT NULL
expense_date    DATE NOT NULL
payment_method  VARCHAR
reference       VARCHAR
vendor_name     VARCHAR
notes           TEXT
recorded_by     UUID FK users.id
created_at      TIMESTAMP DEFAULT NOW()
```

### `budgets`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
year            INTEGER NOT NULL
category_name   VARCHAR NOT NULL
planned_amount  NUMERIC(12, 2) NOT NULL
actual_amount   NUMERIC(12, 2) DEFAULT 0
```

### `groups`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
name        VARCHAR NOT NULL  -- Choir, Ushers, Youth, Women's Fellowship, etc.
description TEXT
leader_id   UUID FK members.id NULLABLE
is_active   BOOLEAN DEFAULT TRUE
created_at  TIMESTAMP DEFAULT NOW()
```

### `group_members`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
group_id    UUID FK groups.id
member_id   UUID FK members.id
joined_at   TIMESTAMP DEFAULT NOW()
UNIQUE(group_id, member_id)
```

### `events`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
title       VARCHAR NOT NULL
description TEXT
location    VARCHAR
start_datetime TIMESTAMP NOT NULL
end_datetime   TIMESTAMP
is_recurring   BOOLEAN DEFAULT FALSE
recurrence_rule VARCHAR  -- e.g. WEEKLY, MONTHLY
max_capacity   INTEGER
created_by  UUID FK users.id
created_at  TIMESTAMP DEFAULT NOW()
```

### `event_registrations`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
event_id    UUID FK events.id
member_id   UUID FK members.id
registered_at TIMESTAMP DEFAULT NOW()
UNIQUE(event_id, member_id)
```

### `communications`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
type        VARCHAR  -- sms, email
subject     VARCHAR  -- for emails
body        TEXT NOT NULL
recipients  TEXT  -- JSON array of member IDs or group IDs
sent_by     UUID FK users.id
sent_at     TIMESTAMP DEFAULT NOW()
status      VARCHAR  -- sent, failed, partial
```

### `pastoral_logs`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
member_id   UUID FK members.id
log_type    VARCHAR  -- visit, call, counseling, prayer
notes       TEXT
logged_by   UUID FK users.id
log_date    DATE NOT NULL
created_at  TIMESTAMP DEFAULT NOW()
```

### `audit_logs`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID FK users.id
action      VARCHAR  -- created, updated, deleted
table_name  VARCHAR
record_id   UUID
old_value   JSONB
new_value   JSONB
created_at  TIMESTAMP DEFAULT NOW()
```

---

## Alembic Setup

```bash
# Initialize (already done)
alembic init alembic

# Create a migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

## SQLAlchemy Base Pattern

```python
# app/db/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
