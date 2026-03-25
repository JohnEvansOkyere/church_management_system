# MODULES.md — Feature Modules & Requirements

Each module has a backend router, CRUD file, model, schema, and a frontend page + service file.

---

## Module 1: Member Management

**Backend route prefix:** `/api/v1/members`

### Endpoints
| Method | Path | Role Required | Description |
|---|---|---|---|
| GET | / | any | List all members (paginated, searchable) |
| POST | / | superadmin, secretary | Create new member |
| GET | /{id} | any | Get member profile |
| PUT | /{id} | superadmin, secretary | Update member |
| DELETE | /{id} | superadmin | Soft delete member |
| POST | /{id}/photo | superadmin, secretary | Upload member photo |
| GET | /family/{family_id} | any | Get all members in a family |
| GET | /export | superadmin, secretary | Export member list to CSV |

### Key Business Logic
- When creating a family head, create the Family record first
- When a member hasn't attended in 30+ days, flag them (low_attendance = true)
- Auto-send birthday SMS on the member's birthday (background task)
- Member export should include: name, phone, email, status, date joined

---

## Module 2: Attendance Tracking

**Backend route prefix:** `/api/v1/attendance`

### Endpoints
| Method | Path | Role Required | Description |
|---|---|---|---|
| GET | /sessions | any | List attendance sessions |
| POST | /sessions | superadmin, secretary | Create new session |
| GET | /sessions/{id} | any | Get session with all records |
| POST | /sessions/{id}/mark | superadmin, secretary | Mark attendance for members |
| GET | /member/{id} | any | Get attendance history for a member |
| GET | /summary | any | Attendance summary stats |

### Key Business Logic
- A session must be created before attendance can be marked
- Bulk mark attendance: accept array of {member_id, status} objects
- Calculate attendance percentage per member (present / total sessions)
- Flag members below 50% attendance for pastoral follow-up

---

## Module 3: Donations & Finance

**Backend route prefix:** `/api/v1/donations`

### Endpoints
| Method | Path | Role Required | Description |
|---|---|---|---|
| GET | / | superadmin, finance | List all donations |
| POST | / | superadmin, finance | Record a donation |
| GET | /{id} | superadmin, finance | Get donation details |
| GET | /member/{id} | any (own) superadmin, finance (others) | Member giving history |
| GET | /funds | any | List all donation funds |
| POST | /funds | superadmin | Create donation fund |
| GET | /reports/monthly | superadmin, finance | Monthly giving report |
| GET | /reports/annual | superadmin, finance | Annual giving statement |
| GET | /member/{id}/statement | superadmin, finance | Member giving statement PDF |

### Key Business Logic
- Total giving dashboard: sum by fund, sum by month
- Generate PDF giving statement for each member (use WeasyPrint or ReportLab)
- Online giving webhook endpoint for Paystack/Flutterwave integration (future)

---

## Module 4: Groups & Ministries

**Backend route prefix:** `/api/v1/groups`

### Endpoints
| Method | Path | Role Required | Description |
|---|---|---|---|
| GET | / | any | List all groups |
| POST | / | superadmin, secretary | Create group |
| PUT | /{id} | superadmin, secretary | Update group |
| DELETE | /{id} | superadmin | Delete group |
| GET | /{id}/members | any | List members in group |
| POST | /{id}/members | superadmin, secretary, group_leader | Add member to group |
| DELETE | /{id}/members/{member_id} | superadmin, secretary, group_leader | Remove member |

### Key Business Logic
- Group leaders can only manage their own group
- A member can belong to multiple groups
- Show member count per group on the groups list page

---

## Module 5: Events & Calendar

**Backend route prefix:** `/api/v1/events`

### Endpoints
| Method | Path | Role Required | Description |
|---|---|---|---|
| GET | / | any | List upcoming events |
| POST | / | superadmin, secretary | Create event |
| PUT | /{id} | superadmin, secretary | Update event |
| DELETE | /{id} | superadmin | Delete event |
| POST | /{id}/register | any | Register member for event |
| GET | /{id}/registrations | superadmin, secretary | List registrations |
| POST | /remind | superadmin, secretary | Send reminder for upcoming events |

### Key Business Logic
- Auto-send SMS/email 24 hours before an event (background task)
- Recurring events: store recurrence_rule and generate instances dynamically
- Enforce max_capacity — reject registration if full

---

## Module 6: Communication

**Backend route prefix:** `/api/v1/communication`

### Endpoints
| Method | Path | Role Required | Description |
|---|---|---|---|
| POST | /sms | superadmin, secretary | Send bulk SMS |
| POST | /email | superadmin, secretary | Send bulk email |
| GET | /history | superadmin, secretary | View all sent communications |
| POST | /announcement | superadmin, secretary | Post announcement (in-app) |
| GET | /announcements | any | List active announcements |

### Key Business Logic
- SMS via Africa's Talking API (Ghana numbers)
- Email via SendGrid
- Support sending to: all members, specific group, or selected member IDs
- Log every sent communication with timestamp, sender, and recipient count

### Africa's Talking SMS Example
```python
import africastalking

africastalking.initialize(username=settings.AT_USERNAME, api_key=settings.AT_API_KEY)
sms = africastalking.SMS

def send_sms(phone_numbers: list, message: str):
    response = sms.send(message, phone_numbers)
    return response
```

---

## Module 7: Reports & Dashboard

**Backend route prefix:** `/api/v1/reports`

### Dashboard Stats Endpoint
GET `/api/v1/reports/dashboard` — returns:
```json
{
  "total_members": 250,
  "new_members_this_month": 12,
  "attendance_last_sunday": 180,
  "attendance_percentage": 72,
  "donations_this_month": 15000.00,
  "donations_this_year": 180000.00,
  "low_attendance_members": 18,
  "upcoming_events": 3
}
```

### Report Endpoints
| Method | Path | Description |
|---|---|---|
| GET | /dashboard | Main dashboard stats |
| GET | /attendance/monthly | Monthly attendance trend |
| GET | /donations/monthly | Monthly giving trend |
| GET | /members/growth | Member growth over time |
| GET | /export/members | Export members CSV |
| GET | /export/donations | Export donations Excel |

### Key Business Logic
- Dashboard loads fast — use aggregated SQL queries, not Python loops
- Charts data: return arrays of {month, value} for frontend charting (Recharts)
- All exports use pandas to generate clean spreadsheets

