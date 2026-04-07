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
- Track punctuality from `checked_in_at` against `session_start_time`
- Flag members below 50% attendance for pastoral follow-up

---

## Module 3: Finance

The finance domain should cover both **giving** and **church financial operations**. In a typical church management system, finance is broader than simple donation logging. It should support tithe, offering, harvest, welfare, missions, special seeds, campaigns, statements, batches, and finance reporting in one place.

**Backend route prefix:** `/api/v1/donations`

### Endpoints
| Method | Path | Role Required | Description |
|---|---|---|---|
| GET | / | superadmin, finance | List all giving records |
| POST | / | superadmin, finance | Record a giving transaction |
| GET | /{id} | superadmin, finance | Get giving transaction details |
| GET | /member/{id} | any (own) superadmin, finance (others) | Member giving history |
| GET | /funds | any | List all church funds and giving categories |
| GET | /batches | superadmin, finance | List finance service/event batches |
| POST | /batches | superadmin, finance | Create finance batch for a service or event |
| POST | /funds | superadmin | Create church fund |
| POST | /funds/bootstrap | superadmin | Load standard church finance funds |
| GET | /expense-categories | any | List finance expense categories |
| POST | /expense-categories | superadmin | Create expense category |
| POST | /expense-categories/bootstrap | superadmin | Load standard expense categories |
| GET | /expenses | superadmin, finance | List church expense records |
| POST | /expenses | superadmin, finance | Record an expense |
| GET | /reports/monthly | superadmin, finance | Monthly giving report |
| GET | /reports/annual | superadmin, finance | Annual giving statement |
| GET | /member/{id}/statement | superadmin, finance | Member giving statement |

### Key Business Logic
- Finance should classify giving by church context, not generic donation-only language. Standard funds should include: `tithe`, `offering`, `harvest`, `missions`, `welfare`, `building`, `thanksgiving`, and other custom church funds.
- Some funds require a member link. Example: `tithe` should be recorded per member; `offering` can be recorded as a general church collection without a member.
- Total giving dashboard: sum by fund, sum by month, sum by payment method
- Finance should also capture expense categories, expense ledger, and monthly cash outflow
- Generate giving statements per member and optionally per family household
- Support service-day batching so finance can reconcile all collections from a particular service or event
- Support pledge/campaign tracking for harvest, building project, missions drive, and similar church campaigns
- Support deposits and reconciliation flow between giving records and church cash/bank balances
- Support online giving webhook endpoint for Paystack/Flutterwave integration (future)
- Keep a path open for broader church finance tables: `finance_batches`, `pledges`, `pledge_payments`, `expense_categories`, `expenses`, `budgets`, and `accounts`

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
  "expenses_this_month": 9000.00,
  "expenses_this_year": 84000.00,
  "net_flow_this_month": 6000.00,
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
| GET | /expenses/monthly | Monthly expense trend |
| GET | /members/growth | Member growth over time |
| GET | /export/members | Export members CSV |
| GET | /export/donations | Export donations Excel |

### Key Business Logic
- Dashboard loads fast — use aggregated SQL queries, not Python loops
- Charts data: return arrays of {month, value} for frontend charting (Recharts)
- Dashboard should show both income and expenses, plus monthly net flow
- All exports use pandas to generate clean spreadsheets
