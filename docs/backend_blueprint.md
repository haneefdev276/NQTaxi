# NQTaxi — Complete Backend Development Blueprint

> **Stack:** Django 4.2 · Django REST Framework · PostgreSQL · Redis · Celery · Django Channels · Razorpay · Firebase FCM · Twilio SMS · AWS S3

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [Django App Structure](#3-django-app-structure)
4. [API Endpoint Reference](#4-api-endpoint-reference)
5. [Step-by-Step Build Order](#5-step-by-step-build-order)
6. [Real-Time WebSocket System](#6-real-time-websocket-system)
7. [Fare Calculation Engine](#7-fare-calculation-engine)
8. [Notifications System](#8-notifications-system)
9. [Payment Integration](#9-payment-integration)
10. [Admin Panel APIs](#10-admin-panel-apis)
11. [Security and Auth](#11-security-and-auth)
12. [Testing Strategy](#12-testing-strategy)
13. [Local Dev and Deployment](#13-local-dev-and-deployment)

---

## 1. Architecture Overview

```
                        React Frontend
             Customer App | Driver App | Admin Panel
                            |  HTTPS / WSS
                  Django + DRF + Daphne (ASGI)
              REST APIs (DRF)  |  WebSocket (Channels)
                    |                     |
              PostgreSQL DB          Redis
              (Primary Store)  (Channel Layer + Celery + Cache)
                    |
              Celery Workers
              OTP expiry | Payout scheduling | Notifications
                    |             |                |
                Razorpay      Twilio SMS      Firebase FCM
                (Payments)     (OTP)         (Push Notifs)
                    |
                 AWS S3
            (Document Storage)
```

### Key Design Decisions

- Single Django project, multiple apps (one per domain)
- JWT-based auth (access = 30 min, refresh = 7 days)
- WebSockets for real-time ride matching and live location tracking
- Celery Beat for scheduled tasks (payout cron, incentive resets)
- **All monetary values stored in paise (integer) — never floats**
- Booking OTP is 4-digit, generated server-side, never exposed to customer app
- Driver discovery uses Haversine distance formula (PostGIS optional for scale)

---

## 2. Database Schema

### 2.1 Users and Authentication

```sql
-- Core user table (extends Django AbstractBaseUser)
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(15)  UNIQUE NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    role            VARCHAR(10)  NOT NULL CHECK (role IN ('rider','driver','admin')),
    password_hash   VARCHAR(255) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,   -- phone OTP confirmed
    profile_photo   VARCHAR(500),            -- S3 URL
    date_joined     TIMESTAMPTZ DEFAULT NOW(),
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- OTP sessions (phone/email verification)
CREATE TABLE otp_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    phone       VARCHAR(15),
    email       VARCHAR(255),
    otp_code    VARCHAR(6) NOT NULL,
    purpose     VARCHAR(20) NOT NULL
                    CHECK (purpose IN ('login','register','reset_password','ride')),
    is_used     BOOLEAN DEFAULT FALSE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- JWT refresh token blacklist (for logout)
CREATE TABLE token_blacklist (
    id              BIGSERIAL PRIMARY KEY,
    jti             VARCHAR(255) UNIQUE NOT NULL,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    blacklisted_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Rider Profile

```sql
CREATE TABLE rider_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    rating                  DECIMAL(3,2) DEFAULT 5.00,
    total_rides             INTEGER DEFAULT 0,
    wallet_balance          BIGINT DEFAULT 0,    -- paise (100 paise = 1 INR)
    home_address            VARCHAR(500),
    work_address            VARCHAR(500),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Saved payment methods (cards and UPI)
CREATE TABLE payment_methods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id        UUID REFERENCES rider_profiles(id) ON DELETE CASCADE,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('card','upi','wallet')),
    card_last4      VARCHAR(4),
    card_brand      VARCHAR(20),      -- Visa, Mastercard, RuPay
    card_expiry     VARCHAR(7),       -- MM/YYYY
    card_holder     VARCHAR(150),
    upi_id          VARCHAR(100),
    upi_name        VARCHAR(150),
    razorpay_token  VARCHAR(255),
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Saved home / work / other places
CREATE TABLE saved_places (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id    UUID REFERENCES rider_profiles(id) ON DELETE CASCADE,
    label       VARCHAR(20) NOT NULL CHECK (label IN ('home','work','other')),
    name        VARCHAR(150),
    address     VARCHAR(500) NOT NULL,
    latitude    DECIMAL(10,8) NOT NULL,
    longitude   DECIMAL(11,8) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency contacts for SOS feature
CREATE TABLE emergency_contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id        UUID REFERENCES rider_profiles(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    phone           VARCHAR(15)  NOT NULL,
    relationship    VARCHAR(50),
    is_primary      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Driver Profile and Onboarding

```sql
CREATE TABLE driver_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    -- Onboarding progress
    onboarding_step         VARCHAR(30) DEFAULT 'STEP_1_PROFILE_SETUP'
                                CHECK (onboarding_step IN (
                                    'STEP_1_PROFILE_SETUP',
                                    'STEP_2_DOCUMENT_VERIFICATION',
                                    'STEP_3_DASHBOARD_ACCESS'
                                )),
    is_profile_complete     BOOLEAN DEFAULT FALSE,
    is_documents_complete   BOOLEAN DEFAULT FALSE,
    is_approved             BOOLEAN DEFAULT FALSE,   -- admin manually approves
    -- Availability
    status                  VARCHAR(10) DEFAULT 'OFFLINE'
                                CHECK (status IN ('OFFLINE','ONLINE','BUSY')),
    -- Personal info
    date_of_birth           DATE,
    gender                  VARCHAR(10) CHECK (gender IN ('male','female','other')),
    -- Performance metrics
    rating                  DECIMAL(3,2) DEFAULT 5.00,
    total_rides             INTEGER DEFAULT 0,
    acceptance_rate         DECIMAL(5,2) DEFAULT 100.00,
    -- Live location (updated every 3s during rides)
    current_latitude        DECIMAL(10,8),
    current_longitude       DECIMAL(11,8),
    last_location_at        TIMESTAMPTZ,
    -- Financials
    wallet_balance          BIGINT DEFAULT 0,   -- paise
    pending_payout          BIGINT DEFAULT 0,
    -- Bank details for payouts
    bank_account_holder     VARCHAR(150),
    bank_name               VARCHAR(100),
    bank_account_number     VARCHAR(20),
    bank_ifsc               VARCHAR(15),
    bank_verified           BOOLEAN DEFAULT FALSE,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle linked to driver
CREATE TABLE vehicles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id           UUID UNIQUE REFERENCES driver_profiles(id) ON DELETE CASCADE,
    vehicle_type        VARCHAR(20) NOT NULL
                            CHECK (vehicle_type IN ('auto','sedan','suv','prime')),
    make                VARCHAR(50),          -- Maruti, Tata, Hyundai
    model               VARCHAR(50) NOT NULL, -- Swift Dzire, Innova
    color               VARCHAR(30),
    year                SMALLINT,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    seats               SMALLINT DEFAULT 4,
    is_ac               BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 7 document types required per driver
-- aadhaar | pan | driving_license | rc_book | insurance | permit | pollution
CREATE TABLE driver_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id           UUID REFERENCES driver_profiles(id) ON DELETE CASCADE,
    doc_type            VARCHAR(20) NOT NULL,
    file_url            VARCHAR(500) NOT NULL,   -- AWS S3 URL
    status              VARCHAR(15) DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    rejection_reason    VARCHAR(300),
    dl_number           VARCHAR(20),    -- for driving_license only
    dl_expiry           DATE,
    uploaded_at         TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at         TIMESTAMPTZ,
    reviewed_by         UUID REFERENCES users(id)
);
```

### 2.4 Rides and Bookings (Core Table)

```sql
-- Fare configuration managed by admin
CREATE TABLE fare_configs (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_type                   VARCHAR(20) UNIQUE NOT NULL, -- auto, sedan, suv, prime
    base_fare                   BIGINT NOT NULL,   -- paise
    min_fare                    BIGINT NOT NULL,
    per_km_charge               BIGINT NOT NULL,   -- paise per km
    per_minute_charge           BIGINT NOT NULL,   -- paise per minute
    waiting_charge_per_min      BIGINT DEFAULT 0,
    night_charge_multiplier     DECIMAL(4,2) DEFAULT 1.0,
    platform_fee_pct            DECIMAL(5,2) DEFAULT 20.00,
    driver_commission_pct       DECIMAL(5,2) DEFAULT 80.00,
    is_active                   BOOLEAN DEFAULT TRUE,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Admin-configurable surge pricing rules
CREATE TABLE pricing_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label       VARCHAR(100) NOT NULL,   -- "Peak Hour Surge", "Rain Surge"
    rule_type   VARCHAR(20) NOT NULL
                    CHECK (rule_type IN ('time','demand','weather','area')),
    multiplier  DECIMAL(4,2) NOT NULL,
    config      JSONB DEFAULT '{}',      -- {start_hour:8, end_hour:11} etc.
    is_enabled  BOOLEAN DEFAULT TRUE,
    priority    SMALLINT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- THE CORE RIDE RECORD
-- Status flow: pending -> accepted -> driver_arrived -> in_progress -> completed | cancelled
CREATE TABLE rides (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref             VARCHAR(20) UNIQUE NOT NULL,   -- NQ123456
    rider_id                UUID REFERENCES rider_profiles(id),
    driver_id               UUID REFERENCES driver_profiles(id),
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending'
                                CHECK (status IN (
                                    'pending','accepted','driver_arrived',
                                    'in_progress','completed','cancelled'
                                )),
    ride_type               VARCHAR(20) NOT NULL,
    -- Pickup location
    pickup_address          VARCHAR(500) NOT NULL,
    pickup_latitude         DECIMAL(10,8) NOT NULL,
    pickup_longitude        DECIMAL(11,8) NOT NULL,
    -- Drop location
    drop_address            VARCHAR(500) NOT NULL,
    drop_latitude           DECIMAL(10,8) NOT NULL,
    drop_longitude          DECIMAL(11,8) NOT NULL,
    -- Route metrics
    estimated_distance_km   DECIMAL(8,2),
    actual_distance_km      DECIMAL(8,2),
    estimated_duration_min  SMALLINT,
    actual_duration_min     SMALLINT,
    -- Boarding OTP (4-digit, driver enters after passenger boards)
    boarding_otp            VARCHAR(6) NOT NULL,
    otp_verified            BOOLEAN DEFAULT FALSE,
    -- Fare breakdown (all in paise)
    estimated_fare          BIGINT,
    actual_fare             BIGINT,
    base_fare               BIGINT,
    distance_fare           BIGINT,
    time_fare               BIGINT,
    surge_amount            BIGINT DEFAULT 0,
    waiting_charge          BIGINT DEFAULT 0,
    discount_amount         BIGINT DEFAULT 0,
    tax_amount              BIGINT DEFAULT 0,
    platform_fee            BIGINT,
    driver_earnings         BIGINT,
    surge_multiplier        DECIMAL(4,2) DEFAULT 1.00,
    -- Payment
    payment_method          VARCHAR(20)
                                CHECK (payment_method IN ('cash','upi','card','wallet')),
    payment_status          VARCHAR(15) DEFAULT 'pending'
                                CHECK (payment_status IN ('pending','paid','refunded','failed')),
    razorpay_order_id       VARCHAR(100),
    razorpay_payment_id     VARCHAR(100),
    -- Cancellation
    cancelled_by            VARCHAR(10) CHECK (cancelled_by IN ('rider','driver','admin')),
    cancellation_reason     VARCHAR(300),
    -- Timestamps
    requested_at            TIMESTAMPTZ DEFAULT NOW(),
    accepted_at             TIMESTAMPTZ,
    arrived_at              TIMESTAMPTZ,    -- driver reached pickup
    started_at              TIMESTAMPTZ,    -- OTP verified, ride started
    completed_at            TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Time-series GPS trail during active rides
CREATE TABLE ride_location_logs (
    id          BIGSERIAL PRIMARY KEY,
    ride_id     UUID REFERENCES rides(id) ON DELETE CASCADE,
    driver_id   UUID REFERENCES driver_profiles(id),
    latitude    DECIMAL(10,8) NOT NULL,
    longitude   DECIMAL(11,8) NOT NULL,
    speed_kmph  DECIMAL(6,2),
    heading     DECIMAL(6,2),        -- degrees 0-360
    logged_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ride_loc_ride_id  ON ride_location_logs(ride_id);
CREATE INDEX idx_ride_loc_time     ON ride_location_logs(logged_at DESC);

-- Scheduled future bookings
CREATE TABLE scheduled_bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id            UUID REFERENCES rider_profiles(id),
    pickup_address      VARCHAR(500) NOT NULL,
    pickup_latitude     DECIMAL(10,8) NOT NULL,
    pickup_longitude    DECIMAL(11,8) NOT NULL,
    drop_address        VARCHAR(500) NOT NULL,
    drop_latitude       DECIMAL(10,8) NOT NULL,
    drop_longitude      DECIMAL(11,8) NOT NULL,
    ride_type           VARCHAR(20) NOT NULL,
    scheduled_at        TIMESTAMPTZ NOT NULL,
    status              VARCHAR(15) DEFAULT 'scheduled'
                            CHECK (status IN ('scheduled','dispatched','cancelled')),
    ride_id             UUID REFERENCES rides(id),  -- set when dispatched
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.5 Ratings and Reviews

```sql
-- One ratings record per completed ride
CREATE TABLE ratings (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id                     UUID UNIQUE REFERENCES rides(id) ON DELETE CASCADE,
    rider_rating_for_driver     SMALLINT CHECK (rider_rating_for_driver BETWEEN 1 AND 5),
    rider_review_for_driver     TEXT,
    rider_rated_at              TIMESTAMPTZ,
    driver_rating_for_rider     SMALLINT CHECK (driver_rating_for_rider BETWEEN 1 AND 5),
    driver_review_for_rider     TEXT,
    driver_rated_at             TIMESTAMPTZ,
    rider_tags                  JSONB DEFAULT '[]',  -- ['polite','clean','on_time']
    driver_tags                 JSONB DEFAULT '[]',  -- ['safe_driver','helpful']
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.6 Wallet and Transactions

```sql
CREATE TABLE wallet_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id),
    ride_id             UUID REFERENCES rides(id),
    type                VARCHAR(10) NOT NULL CHECK (type IN ('credit','debit')),
    category            VARCHAR(20) NOT NULL
                            CHECK (category IN (
                                'ride_payment','topup','withdrawal',
                                'refund','incentive','tip','platform_fee'
                            )),
    amount              BIGINT NOT NULL,       -- paise
    balance_after       BIGINT NOT NULL,       -- wallet balance after this tx
    description         VARCHAR(300),
    status              VARCHAR(15) DEFAULT 'completed'
                            CHECK (status IN ('pending','completed','failed')),
    razorpay_payout_id  VARCHAR(100),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_wallet_tx_user_id  ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_tx_created  ON wallet_transactions(created_at DESC);
```

### 2.7 Notifications

```sql
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    body        TEXT NOT NULL,
    type        VARCHAR(30) NOT NULL
                    CHECK (type IN (
                        'ride_request','ride_accepted','driver_arrived',
                        'ride_started','ride_completed','payment',
                        'payout','incentive','system','sos'
                    )),
    data        JSONB DEFAULT '{}',     -- extra payload e.g. {ride_id: "..."}
    is_read     BOOLEAN DEFAULT FALSE,
    fcm_sent    BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notif_user_id  ON notifications(user_id);
CREATE INDEX idx_notif_created  ON notifications(created_at DESC);

-- Per-device FCM tokens (multiple devices per user)
CREATE TABLE user_fcm_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(500) NOT NULL,
    device_type VARCHAR(10) CHECK (device_type IN ('android','ios','web')),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, token)
);
```

### 2.8 SOS and Safety

```sql
CREATE TABLE sos_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id         UUID REFERENCES rides(id),
    triggered_by    UUID REFERENCES users(id),
    latitude        DECIMAL(10,8),
    longitude       DECIMAL(11,8),
    status          VARCHAR(15) DEFAULT 'active'
                        CHECK (status IN ('active','resolved','false_alarm')),
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.9 Incentives and Bonuses

```sql
CREATE TABLE incentive_programs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    type            VARCHAR(20) NOT NULL
                        CHECK (type IN ('trip_target','peak_hour','referral','custom')),
    reward_amount   BIGINT NOT NULL,    -- paise
    target_value    INTEGER NOT NULL,   -- e.g. 80 (trips)
    metric          VARCHAR(30) NOT NULL, -- 'trip_count' | 'peak_hour_trips'
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    config          JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE driver_incentive_progress (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id           UUID REFERENCES driver_profiles(id) ON DELETE CASCADE,
    incentive_id        UUID REFERENCES incentive_programs(id) ON DELETE CASCADE,
    current_progress    INTEGER DEFAULT 0,
    status              VARCHAR(15) DEFAULT 'active'
                            CHECK (status IN ('active','completed','expired')),
    completed_at        TIMESTAMPTZ,
    payout_processed    BOOLEAN DEFAULT FALSE,
    UNIQUE (driver_id, incentive_id)
);
```

### 2.10 Support Tickets

```sql
CREATE TABLE support_tickets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_ref  VARCHAR(20) UNIQUE NOT NULL,  -- TKT-4921
    user_id     UUID REFERENCES users(id),
    ride_id     UUID REFERENCES rides(id),    -- optional context
    subject     VARCHAR(300) NOT NULL,
    category    VARCHAR(30) NOT NULL
                    CHECK (category IN (
                        'billing','technical','service_quality',
                        'payouts','safety','other'
                    )),
    status      VARCHAR(15) DEFAULT 'open'
                    CHECK (status IN ('open','pending','resolved','closed')),
    priority    VARCHAR(10) DEFAULT 'medium'
                    CHECK (priority IN ('low','medium','high','critical')),
    assigned_to UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE support_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id   UUID REFERENCES users(id),
    sender_role VARCHAR(10) CHECK (sender_role IN ('user','admin')),
    message     TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',   -- [{url, name, type}]
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Django App Structure

```
backend/
├── manage.py
├── requirements.txt
├── nqtaxi/
│   ├── settings/
│   │   ├── base.py          # shared config
│   │   ├── development.py   # DEBUG=True, SQLite optional
│   │   └── production.py    # PostgreSQL, S3, Sentry
│   ├── urls.py              # root URL routing
│   ├── asgi.py              # WebSocket + HTTP routing (Channels)
│   └── celery.py            # Celery app definition
│
├── apps/
│   ├── accounts/            # CustomUser, OTP, JWT auth
│   ├── riders/              # RiderProfile, saved places, payment methods
│   ├── drivers/             # DriverProfile, Vehicle, Documents, status
│   ├── rides/               # Booking, OTP verification, WebSocket consumers
│   ├── fares/               # FareConfig, PricingRules
│   ├── payments/            # Razorpay, wallet, payouts, webhook
│   ├── notifications/       # FCM service, in-app feed, Twilio SMS
│   ├── incentives/          # IncentivePrograms, progress tracking
│   ├── support/             # Tickets, messages
│   ├── safety/              # SOS alerts
│   └── admin_panel/         # Admin-specific views, reports, analytics
│
└── shared/
    ├── fare_engine.py       # Pure fare calculation logic
    ├── permissions.py       # IsRider, IsDriver, IsAdmin, IsDriverFullyOnboarded
    ├── pagination.py        # StandardResultsSetPagination
    ├── utils.py             # generate_otp, generate_booking_ref, haversine
    └── exceptions.py        # Custom DRF exception handler
```

---

## 4. API Endpoint Reference

> **Base URL:** `/api/v1/`
> **Auth Header:** `Authorization: Bearer <access_token>`

### 4.1 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register/` | Register rider or driver | Public |
| POST | `/auth/send-otp/` | Send OTP via Twilio SMS | Public |
| POST | `/auth/verify-otp/` | Verify OTP, activate account | Public |
| POST | `/auth/login/` | Email + password → JWT pair | Public |
| POST | `/auth/token/refresh/` | Refresh access token | Public |
| POST | `/auth/logout/` | Blacklist refresh token | JWT |
| POST | `/auth/forgot-password/` | Send reset OTP to phone | Public |
| POST | `/auth/reset-password/` | Confirm OTP + new password | Public |
| GET | `/auth/me/` | Current user + profile + unread count | JWT |

### 4.2 Rider Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / PATCH | `/riders/profile/` | Get or update rider profile |
| GET / POST | `/riders/saved-places/` | List or add saved places |
| PUT / DELETE | `/riders/saved-places/{id}/` | Update or remove saved place |
| GET / POST | `/riders/payment-methods/` | List or add UPI / card |
| DELETE | `/riders/payment-methods/{id}/` | Remove method |
| PATCH | `/riders/payment-methods/{id}/default/` | Set as default |
| GET / POST | `/riders/emergency-contacts/` | List or add emergency contacts |
| DELETE | `/riders/emergency-contacts/{id}/` | Remove contact |
| GET | `/riders/wallet/` | Balance + paginated transactions |
| POST | `/riders/wallet/topup/` | Add money via Razorpay |
| GET | `/riders/trip-history/` | Past rides (paginated) |
| GET | `/riders/ratings/` | Given and received ratings |

### 4.3 Driver Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / PATCH | `/drivers/profile/` | Get or update driver profile |
| GET / POST / PATCH | `/drivers/vehicle/` | Manage vehicle info |
| GET | `/drivers/documents/` | List all docs with status |
| POST | `/drivers/documents/upload/` | Register uploaded S3 document |
| DELETE | `/drivers/documents/{id}/` | Remove document |
| PATCH | `/drivers/status/` | Toggle ONLINE / OFFLINE |
| GET | `/drivers/wallet/` | Wallet + earnings + transactions |
| POST | `/drivers/wallet/withdraw/` | Request payout to bank |
| GET / PATCH | `/drivers/bank-details/` | Get or update bank info |
| GET | `/drivers/earnings/` | Weekly / monthly earnings breakdown |
| GET | `/drivers/stats/` | Rides, acceptance rate, rating |
| GET | `/drivers/trip-history/` | Past rides (paginated) |
| GET | `/drivers/incentives/` | Active incentives + progress |
| POST | `/drivers/location/` | Push current GPS coordinates |

### 4.4 Ride Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rides/estimate/` | Fare estimate before booking |
| POST | `/rides/book/` | Create ride + generate OTP |
| GET | `/rides/{id}/` | Get ride details |
| GET | `/rides/active/` | Current active ride for user |
| POST | `/rides/{id}/cancel/` | Cancel with reason |
| POST | `/rides/{id}/accept/` | Driver accepts ride |
| POST | `/rides/{id}/arrived/` | Driver marks arrived at pickup |
| POST | `/rides/{id}/verify-otp/` | Driver enters OTP → ride starts |
| POST | `/rides/{id}/complete/` | Driver marks ride complete |
| POST | `/rides/{id}/rate/` | Submit rating (rider or driver) |
| GET | `/rides/{id}/track/` | Latest driver GPS position |
| POST | `/rides/schedule/` | Book a future ride |
| GET | `/rides/scheduled/` | List scheduled bookings |

### 4.5 Fares

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fares/` | All ride types + pricing (public) |
| GET | `/fares/{type}/` | Specific fare config |
| POST | `/fares/calculate/` | Calculate fare for given route |

### 4.6 Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create-order/` | Create Razorpay order |
| POST | `/payments/verify/` | Verify HMAC signature |
| POST | `/payments/webhook/` | Razorpay webhook (HMAC verified, no JWT) |
| GET | `/payments/transactions/` | Transaction history |
| POST | `/payments/refund/` | Initiate refund (admin only) |

### 4.7 Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications/` | List notifications (unread first) |
| PATCH | `/notifications/{id}/read/` | Mark single as read |
| POST | `/notifications/read-all/` | Mark all as read |
| POST | `/notifications/fcm-token/` | Register device FCM token |

### 4.8 Safety

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/safety/sos/` | Trigger SOS alert |
| PATCH | `/safety/sos/{id}/resolve/` | Resolve SOS (admin) |
| GET | `/safety/sos/` | List all SOS alerts (admin) |

### 4.9 Support

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/support/tickets/` | Create support ticket |
| GET | `/support/tickets/` | My tickets |
| GET | `/support/tickets/{id}/` | Ticket detail + messages |
| POST | `/support/tickets/{id}/messages/` | Send message |

### 4.10 Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin-api/dashboard/` | KPI stats: rides, revenue, drivers |
| GET | `/admin-api/users/` | All users (filterable by role, status, date) |
| PATCH | `/admin-api/users/{id}/status/` | Activate or deactivate user |
| GET | `/admin-api/drivers/pending/` | Drivers awaiting doc approval |
| PATCH | `/admin-api/documents/{id}/approve/` | Approve document |
| PATCH | `/admin-api/documents/{id}/reject/` | Reject with reason |
| GET | `/admin-api/rides/` | All rides (filterable by status, date) |
| GET | `/admin-api/fleet/` | Fleet overview with live locations |
| GET / POST / PUT / DELETE | `/admin-api/fares/` | CRUD for fare types |
| GET / PATCH | `/admin-api/pricing-rules/{id}/` | Toggle or update pricing rules |
| GET | `/admin-api/analytics/` | Revenue + ride charts by period |
| GET | `/admin-api/reports/` | CSV export (drivers, trips, transactions) |
| GET | `/admin-api/support/tickets/` | All tickets |
| PATCH | `/admin-api/support/tickets/{id}/assign/` | Assign to agent |
| PATCH | `/admin-api/support/tickets/{id}/status/` | Update ticket status |
| GET / POST / PATCH | `/admin-api/incentives/` | Manage incentive programs |
| GET | `/admin-api/payouts/` | Pending payout requests |
| POST | `/admin-api/payouts/{id}/process/` | Trigger bank transfer |

---

## 5. Step-by-Step Build Order

### PHASE 1 — Project Foundation (Week 1)

**Goal:** Working Django project with PostgreSQL, auth skeleton, and all apps created.

```
Step 1.1 — Django Project Setup
  django-admin startproject nqtaxi .
  Create nqtaxi/settings/base.py, development.py, production.py
  Configure PostgreSQL in base.py (psycopg2-binary)
  Configure Redis cache (django-redis)
  Install and configure django-cors-headers
  Install python-decouple for .env management
  Set up .gitignore (include .env, __pycache__, venv)

Step 1.2 — Custom User Model  *** MUST DO BEFORE FIRST MIGRATION ***
  In apps/accounts/models.py:
    class CustomUser(AbstractBaseUser, PermissionsMixin)
      id = UUIDField(primary_key=True, default=uuid.uuid4)
      email = EmailField(unique=True)
      phone = CharField(max_length=15, unique=True)
      full_name = CharField(max_length=150)
      role = CharField(choices=[rider, driver, admin])
      is_active, is_verified, profile_photo, date_joined
    class CustomUserManager(BaseUserManager)
      create_user(email, phone, password, role, **extra)
      create_superuser(email, phone, password, **extra)
  In nqtaxi/settings/base.py:
    AUTH_USER_MODEL = 'accounts.CustomUser'

Step 1.3 — Create All Apps
  python manage.py startapp accounts
  python manage.py startapp riders
  python manage.py startapp drivers
  python manage.py startapp rides
  python manage.py startapp fares
  python manage.py startapp payments
  python manage.py startapp notifications
  python manage.py startapp incentives
  python manage.py startapp support
  python manage.py startapp safety
  python manage.py startapp admin_panel

Step 1.4 — Write All Models
  Write all models from Section 2 into their respective apps
  python manage.py makemigrations
  python manage.py migrate
  Register every model in each app's admin.py

Step 1.5 — JWT Auth Configuration
  Install djangorestframework-simplejwt
  Add to INSTALLED_APPS: rest_framework, rest_framework_simplejwt
  In settings/base.py configure SIMPLE_JWT (see Section 11)
  Create accounts/serializers.py:
    class CustomTokenObtainPairSerializer(TokenObtainPairSerializer)
      add role, full_name, is_verified to token claims
  Wire up /auth/token/ and /auth/token/refresh/ in urls.py

Step 1.6 — DRF Global Config
  REST_FRAMEWORK = {
    DEFAULT_AUTHENTICATION_CLASSES: [JWTAuthentication],
    DEFAULT_PERMISSION_CLASSES: [IsAuthenticated],
    DEFAULT_PAGINATION_CLASS: StandardResultsSetPagination,
    PAGE_SIZE: 20,
    DEFAULT_THROTTLE_CLASSES + RATES (see Section 11),
    EXCEPTION_HANDLER: shared.exceptions.custom_exception_handler,
  }
```

---

### PHASE 2 — Authentication Module (Week 1–2)

**Goal:** Full register → OTP → login → logout → password-reset flow.

```
Step 2.1 — OTP System
  In shared/utils.py:
    generate_otp() -> 6-digit string (secrets.randbelow)
  In accounts/services.py:
    send_otp_sms(phone, otp) -> Twilio client.messages.create(...)
  In accounts/models.py:
    OTPSession model (see schema 2.1)
  Celery Beat task: expire_old_otps()
    runs every 10 minutes, deletes expired OTPSessions
  API: POST /auth/send-otp/
    body: {phone, purpose}
    creates OTPSession, calls send_otp_sms()
  API: POST /auth/verify-otp/
    body: {phone, otp_code, purpose}
    validates OTPSession.expires_at > now() and is_used=False
    marks is_used=True

Step 2.2 — Registration
  API: POST /auth/register/
    body: {email, phone, full_name, password, role}
    validates email + phone uniqueness
    hashes password with make_password()
    creates CustomUser
    if role==rider: auto-create RiderProfile
    if role==driver: auto-create DriverProfile (onboarding_step=STEP_1)
    returns JWT pair + user object

Step 2.3 — Login
  API: POST /auth/login/
    body: {email, password}
    authenticate user, check is_active
    return: {access, refresh, user: {id, role, full_name, is_verified, ...}}
    for drivers also include: {onboarding_step, is_approved}

Step 2.4 — Logout + Token Blacklist
  API: POST /auth/logout/
    body: {refresh}
    adds refresh token JTI to TokenBlacklist table
    override JWTAuthentication to check blacklist on every request

Step 2.5 — Password Reset
  API: POST /auth/forgot-password/  body: {phone}
    find user by phone, send OTP (purpose=reset_password)
  API: POST /auth/reset-password/
    body: {phone, otp_code, new_password}
    verify OTP, set_password(), save()

Step 2.6 — Current User
  API: GET /auth/me/
    return: CustomUser + role-specific profile + unread_notification_count
```

---

### PHASE 3 — Driver Onboarding (Week 2)

**Goal:** Driver completes profile → uploads documents → admin approves → full access.

```
Step 3.1 — Profile Setup
  API: PATCH /drivers/profile/
    fields: date_of_birth, gender, full_name, profile_photo
    on full save: set is_profile_complete=True, onboarding_step=STEP_2
    also handles vehicle creation inline (make, model, color, year, reg_number)

Step 3.2 — AWS S3 Document Upload
  Configure django-storages with boto3
  API: POST /drivers/documents/presign/
    body: {doc_type, file_name}
    generate presigned S3 PUT URL (expires in 5 min)
    return: {upload_url, file_url}
  Frontend: PUT directly to S3 using upload_url
  API: POST /drivers/documents/upload/
    body: {doc_type, file_url, dl_number?, dl_expiry?}
    creates DriverDocument with status=PENDING

Step 3.3 — Admin Document Review
  API: PATCH /admin-api/documents/{id}/approve/
    sets status=APPROVED, reviewed_at, reviewed_by
    checks if ALL 7 docs approved for this driver:
      if yes: set is_documents_complete=True, onboarding_step=STEP_3
              send FCM + SMS: "Documents approved! You can now start driving."
  API: PATCH /admin-api/documents/{id}/reject/
    body: {rejection_reason}
    sets status=REJECTED, notifies driver via FCM + SMS

Step 3.4 — Onboarding Guard Permission
  class IsDriverFullyOnboarded(BasePermission):
    checks: is_profile_complete AND is_documents_complete AND is_approved
    returns 403 with onboarding_step in error detail if not complete
  Apply to: all ride-accept, status-toggle, location-update endpoints
```

---

### PHASE 4 — Fare Engine (Week 2–3)

**Goal:** Configurable fare calculation with surge, night, and GST support.

```
Step 4.1 — Seed Default Fares
  python manage.py seed_fares
  Creates FareConfig rows for: auto, sedan, suv, prime
  Values (in paise):
    auto:  base=3000, min=3500, per_km=1200, per_min=100
    sedan: base=5000, min=6000, per_km=1500, per_min=150
    suv:   base=8000, min=9000, per_km=2000, per_min=200
    prime: base=7000, min=8000, per_km=1800, per_min=180

Step 4.2 — Fare Calculator (shared/fare_engine.py)
  def calculate_fare(ride_type, distance_km, duration_min,
                     surge_multiplier=1.0, waiting_minutes=0) -> dict:
    config = FareConfig.objects.get(ride_type=ride_type, is_active=True)
    base        = config.base_fare
    dist_charge = int(distance_km * config.per_km_charge)
    time_charge = int(duration_min * config.per_minute_charge)
    wait_charge = int(waiting_minutes * config.waiting_charge_per_min)
    subtotal    = max(base + dist_charge + time_charge + wait_charge, config.min_fare)
    surge_amt   = int(subtotal * (surge_multiplier - 1))
    after_surge = subtotal + surge_amt
    if is_night_time():  # 10PM - 6AM IST
        after_surge = int(after_surge * config.night_charge_multiplier)
    tax         = int(after_surge * 0.05)   # 5% GST
    total       = after_surge + tax
    plat_fee    = int(total * config.platform_fee_pct / 100)
    driver_earn = total - plat_fee
    return {base_fare, distance_fare, time_fare, waiting_charge,
            surge_amount, tax_amount, total_fare, platform_fee,
            driver_earnings, surge_multiplier}

Step 4.3 — Surge Engine (shared/fare_engine.py)
  def get_current_surge(latitude, longitude) -> float:
    rules = PricingRule.objects.filter(is_enabled=True).order_by('-priority')
    for rule in rules:
        if rule.rule_type == 'time':
            if current_hour in rule.config['hours']:
                return rule.multiplier
    return 1.0

Step 4.4 — Estimate API
  POST /rides/estimate/
  body: {pickup_lat, pickup_lng, drop_lat, drop_lng, ride_type}
  calls Google Maps Distance Matrix API (distance_km, duration_min)
  calls get_current_surge(pickup_lat, pickup_lng)
  calls calculate_fare(...)
  returns: {estimated_fare, distance_km, duration_min, surge_multiplier, breakdown}

Step 4.5 — Admin Fare CRUD
  Full CRUD: GET/POST/PUT/DELETE /admin-api/fares/
  Toggle is_active on a fare type
  Every change logs to an audit activity table
```

---

### PHASE 5 — Core Ride Flow (Week 3–4)

**Goal:** Full ride lifecycle from booking to payment and rating.

```
Step 5.1 — Book a Ride  POST /rides/book/
  body: {pickup_address, pickup_lat, pickup_lng,
         drop_address, drop_lat, drop_lng,
         ride_type, payment_method, payment_method_id?}
  validate: rider has no active ride (status in pending/accepted/in_progress)
  call calculate_fare() with current surge -> estimated_fare
  generate boarding_otp = 4-digit (e.g. "5729")
  generate booking_ref  = "NQ" + 6 random digits
  create Ride(status=pending)
  broadcast via WebSocket to nearby ONLINE drivers (see Phase 6)
  return: {ride_id, booking_ref, otp, estimated_fare, breakdown}
  NOTE: OTP shown to CUSTOMER only — driver enters what passenger tells them

Step 5.2 — Driver Accepts  POST /rides/{id}/accept/
  validate: ride.status == 'pending'
  validate: driver.status == 'ONLINE'
  validate: driver has no other active ride
  atomic:
    ride.status = 'accepted'
    ride.driver_id = request.user.driver_profile.id
    ride.accepted_at = now()
    driver_profile.status = 'BUSY'
  send FCM to rider: "Your driver is on the way"
  WebSocket event to rider channel: ride_status {accepted, driver_info}

Step 5.3 — Driver Arrived  POST /rides/{id}/arrived/
  validate: ride.status == 'accepted'
  validate: ride.driver_id == current driver
  ride.status = 'driver_arrived'
  ride.arrived_at = now()
  send FCM + WebSocket to rider: "Driver has arrived at pickup"

Step 5.4 — OTP Verification  POST /rides/{id}/verify-otp/
  body: {otp_code: "5729"}
  validate: ride.status == 'driver_arrived'
  validate: otp_code == ride.boarding_otp (constant-time compare)
  validate: now() - ride.arrived_at < 10 minutes
  ride.otp_verified = True
  ride.status = 'in_progress'
  ride.started_at = now()
  send FCM + WebSocket to rider: "Your ride has started. Enjoy your journey!"

Step 5.5 — Complete Ride  POST /rides/{id}/complete/
  validate: ride.status == 'in_progress'
  validate: ride.driver_id == current driver
  body: {actual_distance_km?, actual_duration_min?}
  if not provided: calculate from ride_location_logs or Google Maps
  recalculate final fare using actual values
  ride.status = 'completed'
  ride.completed_at = now()
  ride.actual_fare = final_fare
  driver_profile.status = 'ONLINE'
  driver_profile.total_rides += 1
  rider_profile.total_rides += 1
  process payment:
    if cash: ride.payment_status = 'paid'
    if wallet: debit rider wallet, credit driver wallet, create WalletTransactions
    if card/upi: capture Razorpay payment
  send FCM to both: "Ride completed! Total: Rs.{fare}"
  create Notification for both parties

Step 5.6 — Cancel Ride  POST /rides/{id}/cancel/
  body: {reason}
  allowed if status in [pending, accepted, driver_arrived]
  cancelled_by = request.user.role
  ride.status = 'cancelled'
  ride.cancelled_at = now()
  ride.cancellation_reason = reason
  if driver had accepted: driver_profile.status = 'ONLINE'
  apply cancellation fee if configured (after grace period)
  send FCM to other party

Step 5.7 — Rating  POST /rides/{id}/rate/
  body: {rating(1-5), review(text), tags([...])}
  determine who is rating whom based on request.user.role
  create or update Rating record
  recalculate rated user's average rating:
    new_avg = (old_avg * (total_rides-1) + new_rating) / total_rides
  update driver_profiles.rating or rider_profiles.rating
```

---

### PHASE 6 — Real-Time WebSocket System (Week 4–5)

**Goal:** Live location tracking and instant ride status across all devices.

```
Step 6.1 — Django Channels Setup
  pip install channels channels-redis daphne
  In nqtaxi/settings/base.py:
    INSTALLED_APPS += ['channels']
    ASGI_APPLICATION = 'nqtaxi.asgi.application'
    CHANNEL_LAYERS = {
      'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {'hosts': [(REDIS_HOST, 6379)]},
      }
    }
  Update nqtaxi/asgi.py:
    ProtocolTypeRouter({
      'http': django_asgi_app,
      'websocket': AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    })

Step 6.2 — WebSocket Consumers (apps/rides/consumers.py)

  RideConsumer  ->  path: /ws/ride/{ride_id}/
    on connect:
      authenticate JWT from query param ?token=
      join groups: ride_{ride_id}_rider OR ride_{ride_id}_driver
    on receive (from driver):
      if type == location_update:
        save to ride_location_logs
        update driver_profiles.current_latitude/longitude
        broadcast to group: ride_{ride_id}_rider
        compute new ETA, broadcast eta_update
    on disconnect: leave groups

  DriverAvailabilityConsumer  ->  path: /ws/driver/
    on connect: join group driver_{driver_id}
    on receive: handle ping/pong keepalive
    receives from server: new_ride_request events

Step 6.3 — Broadcasting New Ride Requests
  After POST /rides/book/ creates a ride:
  1. Query ONLINE drivers within 5km using Haversine:
       distance = 2R * arcsin(sqrt(
         sin^2((lat2-lat1)/2) + cos(lat1)*cos(lat2)*sin^2((lng2-lng1)/2)
       ))
  2. Sort by distance, take top 5
  3. For each driver: channel_layer.group_send(
       f"driver_{driver_id}", {type: new_ride_request, ride_id, ...}
     )
  4. Start Celery countdown task: if no accept in 90s, try next batch

Step 6.4 — Driver Location Updates  POST /drivers/location/
  body: {latitude, longitude, speed_kmph, heading}
  rate-limited: max 1/2s per driver (Redis throttle)
  update driver_profiles.current_latitude/longitude
  if driver has active ride: save ride_location_logs row
  publish to ride_{ride_id} channel group
```

---

### PHASE 7 — Payment Integration (Week 5)

**Goal:** Razorpay payments, wallet top-up, and driver bank payouts.

```
Step 7.1 — RazorpayService (apps/payments/services.py)
  import razorpay
  client = razorpay.Client(auth=(KEY_ID, KEY_SECRET))

  def create_order(amount_paise, receipt):
    return client.order.create({amount, currency:'INR', receipt})

  def verify_signature(order_id, payment_id, signature):
    key = KEY_SECRET.encode()
    msg = f"{order_id}|{payment_id}".encode()
    expected = hmac.new(key, msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

  def create_payout(amount_paise, account_number, ifsc, name):
    return client.payout.create({...})

  def refund(payment_id, amount_paise):
    return client.payment.refund(payment_id, {amount: amount_paise})

Step 7.2 — Wallet Top-Up Flow
  POST /payments/create-order/
    body: {amount_paise}  (min 1000, max 500000)
    razorpay_order = RazorpayService.create_order(amount_paise, f"topup_{user_id}")
    return: {order_id, amount, currency, key_id}

  Frontend: Razorpay checkout popup with order_id

  POST /payments/verify/
    body: {razorpay_order_id, razorpay_payment_id, razorpay_signature}
    verify signature -> if invalid: 400 Bad Request
    atomic:
      rider_profile.wallet_balance += amount
      WalletTransaction(type=credit, category=topup)

Step 7.3 — Ride Payment (Digital)
  At booking: create Razorpay order for estimated_fare
  At completion: capture payment for actual_fare
  If actual > estimated: charge difference separately
  If actual < estimated: refund difference

Step 7.4 — Driver Payout
  POST /drivers/wallet/withdraw/
    body: {amount_paise}
    validate: amount <= driver.wallet_balance
    atomic debit: driver.wallet_balance -= amount, create pending WalletTx
  Celery task: process_driver_payout(driver_id, tx_id)
    calls RazorpayService.create_payout(amount, account_number, ifsc, name)
    on success: WalletTx.status = completed; send FCM "Payout sent!"
    on failure: reverse debit, WalletTx.status = failed; notify driver

Step 7.5 — Webhook Handler  POST /payments/webhook/
  no JWT auth — verified by Razorpay HMAC header
  handle events:
    payment.captured  -> mark WalletTx completed
    payment.failed    -> notify rider, revert ride payment_status
    payout.processed  -> confirm driver payout
    refund.processed  -> credit rider wallet
  idempotency: check if tx already processed before acting
```

---

### PHASE 8 — Notifications (Week 5–6)

**Goal:** FCM push notifications and in-app notification feed.

```
Step 8.1 — FCM Setup
  pip install firebase-admin
  In notifications/apps.py AppConfig.ready():
    firebase_admin.initialize_app(credentials.Certificate(FIREBASE_CRED_PATH))

  class FCMService:
    @staticmethod
    def send_to_user(user_id, title, body, data={}):
      tokens = UserFCMToken.objects.filter(user_id=user_id).values_list('token')
      for token in tokens:
        try:
          firebase_admin.messaging.send(Message(
            notification=Notification(title=title, body=body),
            data=data, token=token
          ))
        except Exception: pass   # remove invalid tokens

Step 8.2 — Trigger Points (integrate into ride flow Phase 5)
  Ride booked    -> FCM to nearby drivers: "New ride request"
  Driver accepted -> FCM to rider: "Driver on the way"
  Driver arrived  -> FCM to rider: "Driver has arrived"
  Ride started    -> FCM to rider: "Ride started"
  Ride completed  -> FCM to both: "Ride complete! Rs.{fare}"
  Payment confirmed -> FCM to rider: "Payment successful"
  Payout sent       -> FCM to driver: "Rs.{X} sent to bank"
  Doc approved      -> FCM to driver: "Documents approved!"
  Doc rejected      -> FCM to driver: "Re-upload {doc_type}"
  SOS triggered     -> FCM to all admins + emergency contacts SMS

Step 8.3 — In-App Feed
  Every FCM send() also calls Notification.objects.create(...)
  GET /notifications/ -> paginated, is_read=False first
  GET /auth/me/ includes unread_count = Notification.objects.filter(
      user=request.user, is_read=False).count()
```

---

### PHASE 9 — Incentives and Bonuses (Week 6)

**Goal:** Admin creates bonus programs; driver progress auto-tracked.

```
Step 9.1 — Admin CRUD
  Full CRUD at /admin-api/incentives/
  Create program with: title, type, reward_amount, target_value, metric, starts_at, ends_at
  Celery Beat task: expire_incentives() — daily at midnight
    marks overdue programs as expired, marks uncompleted progress as expired

Step 9.2 — Auto Progress Tracking
  Django Signal: @receiver(post_save, sender=Ride)
    if instance.status == 'completed':
      active_incentives = IncentiveProgram.objects.filter(
          is_active=True, starts_at__lte=now(), ends_at__gte=now()
      )
      for incentive in active_incentives:
          progress, created = DriverIncentiveProgress.objects.get_or_create(
              driver_id=instance.driver_id, incentive_id=incentive.id
          )
          progress.current_progress += 1
          if progress.current_progress >= incentive.target_value:
              progress.status = 'completed'
              progress.completed_at = now()
              pay_incentive_bonus.delay(progress.id)  # Celery task
          progress.save()

Step 9.3 — Incentive Payout (Celery Task)
  @shared_task
  def pay_incentive_bonus(progress_id):
    progress = DriverIncentiveProgress.objects.get(id=progress_id)
    if progress.payout_processed: return  # idempotency
    amount = progress.incentive.reward_amount
    atomic:
      driver.wallet_balance += amount
      WalletTransaction(type=credit, category=incentive, amount=amount)
      progress.payout_processed = True
    FCMService.send_to_user(driver.user_id,
        "Bonus Credited!", f"Rs.{amount/100:.0f} added to your wallet")

Step 9.4 — Driver API
  GET /drivers/incentives/
  returns: list of {incentive_id, title, type, reward_amount,
                    current_progress, target_value, status, ends_at}
```

---

### PHASE 10 — Admin Panel APIs (Week 6–7)

**Goal:** Complete admin dashboard, fleet management, and reporting.

```
Step 10.1 — Dashboard KPIs  GET /admin-api/dashboard/
  response: {
    today: {total_rides, completed, cancelled, ongoing, revenue_paise, new_riders},
    drivers: {total, online, busy, offline, pending_approval},
    platform: {avg_driver_rating, avg_rider_rating, avg_ride_duration_min}
  }
  Use Django ORM aggregates: Count, Sum, Avg filtered to date=today

Step 10.2 — User Management
  GET /admin-api/users/?role=rider&status=active&search=john&page=1
  Returns paginated list with full_name, email, phone, role, is_active, date_joined
  PATCH /admin-api/users/{id}/status/  body: {is_active: false}

Step 10.3 — Fleet Overview  GET /admin-api/fleet/
  All drivers with: status, current_lat/lng, rating, vehicle_info, today_ride_count
  Used by admin Live Map page

Step 10.4 — Analytics  GET /admin-api/analytics/?period=week
  revenue_chart: [{date, total_revenue_paise, ride_count}] x 7 days
  top_drivers: [{driver_id, name, rides_completed, earnings_paise}] top 10
  Computed via .annotate() and .values() on Ride queryset

Step 10.5 — CSV Reports  GET /admin-api/reports/?type=trips&start=2026-01-01&end=2026-06-30
  StreamingHttpResponse with StreamingBuffer
  types: drivers | trips | transactions | ratings
  Apply Q(created_at__date__range=(start, end)) filter

Step 10.6 — Support Inbox
  GET /admin-api/support/tickets/?status=open&priority=high
  PATCH .../assign/  body: {assigned_to: admin_user_id}
  PATCH .../status/  body: {status: resolved}
  POST /admin-api/support/tickets/{id}/messages/  (admin replies)

Step 10.7 — Payout Management
  GET /admin-api/payouts/?status=pending
  Returns: WalletTransactions where category=withdrawal and status=pending
  POST /admin-api/payouts/{id}/process/
    triggers Celery: process_driver_payout(driver_id, tx_id)
```

---

### PHASE 11 — Safety SOS Module (Week 7)

```
Step 11.1 — SOS Trigger  POST /safety/sos/
  body: {latitude?, longitude?}  (GPS optional, ride_id auto-detected)
  creates SosAlert with status=active
  Simultaneously (all async):
    1. FCMService.send_to_user(admin_id, "SOS ALERT", ...) for ALL admins
    2. Celery task: sms_emergency_contacts(rider_id, lat, lng, ride_id)
         calls Twilio for each EmergencyContact
    3. channel_layer.group_send('admin_sos_feed', {type: sos_alert, ...})

Step 11.2 — SOS Resolution  PATCH /safety/sos/{id}/resolve/
  IsAdmin permission required
  body: {status: resolved, notes: "Officer dispatched"}
  sets resolved_at, resolved_by, notes
```

---

### PHASE 12 — Testing and Deployment (Week 7–8)

```
Step 12.1 — Test Setup
  pip install pytest pytest-django factory-boy faker
  conftest.py: set up db, api_client, user_factory, ride_factory

Step 12.2 — Unit Tests
  accounts: register, OTP expiry, login, token refresh, logout, reset
  rides: book, accept, arrived, otp_verify, complete, cancel, rate
  fares: calculate_fare correctness, min_fare floor, surge, night multiplier, GST
  payments: HMAC verify, wallet debit/credit, idempotency on webhook

Step 12.3 — Integration Test
  Full ride lifecycle (5.1 through 5.7) in one test
  WebSocket consumer test using Django Channels testing framework

Step 12.4 — Coverage
  pytest --cov=apps --cov-report=html
  Target: >= 85% overall

Step 12.5 — API Docs
  pip install drf-spectacular
  INSTALLED_APPS += ['drf_spectacular']
  urlpatterns += [path('api/docs/', SpectacularSwaggerView.as_view())]
  Add @extend_schema decorators to all ViewSets
```

---

## 6. Real-Time WebSocket Message Formats

```json
// Driver sends location update every 3 seconds
{
  "type": "location_update",
  "data": { "latitude": 12.9716, "longitude": 77.5946, "speed_kmph": 45.2, "heading": 180.0 }
}

// Server sends to rider: driver position + ETA
{
  "type": "driver_location",
  "data": { "latitude": 12.9716, "longitude": 77.5946, "eta_minutes": 4 }
}

// Server sends to both: ride status changed
{
  "type": "ride_status",
  "data": {
    "ride_id": "uuid",
    "status": "accepted",
    "driver": { "name": "Rajesh Kumar", "rating": 4.8, "vehicle": "KA03 TS 1234", "phone": "+91 9876543210" }
  }
}

// Server sends to driver: new booking request
{
  "type": "new_ride_request",
  "data": {
    "ride_id": "uuid",
    "pickup": "MG Road, Bengaluru",
    "drop": "Kempegowda Airport",
    "distance_km": 32,
    "estimated_fare_paise": 85000,
    "rider_name": "Rahul",
    "rider_rating": 4.9,
    "expires_in_seconds": 30
  }
}
```

---

## 7. Fare Calculation Engine

```python
# shared/fare_engine.py

from datetime import datetime
import pytz

IST = pytz.timezone('Asia/Kolkata')

def is_night_time() -> bool:
    now = datetime.now(IST)
    return now.hour >= 22 or now.hour < 6

def calculate_fare(
    ride_type: str,
    distance_km: float,
    duration_min: int,
    surge_multiplier: float = 1.0,
    waiting_minutes: int = 0,
) -> dict:
    config = FareConfig.objects.get(ride_type=ride_type, is_active=True)

    base        = config.base_fare
    dist_charge = int(distance_km * config.per_km_charge)
    time_charge = int(duration_min * config.per_minute_charge)
    wait_charge = int(waiting_minutes * config.waiting_charge_per_min)

    subtotal    = max(base + dist_charge + time_charge + wait_charge, config.min_fare)
    surge_amt   = int(subtotal * (surge_multiplier - 1))
    after_surge = subtotal + surge_amt

    if is_night_time():
        after_surge = int(after_surge * float(config.night_charge_multiplier))

    tax_amount      = int(after_surge * 0.05)       # 5% GST
    total           = after_surge + tax_amount
    platform_fee    = int(total * float(config.platform_fee_pct) / 100)
    driver_earnings = total - platform_fee

    return {
        'base_fare':        base,
        'distance_fare':    dist_charge,
        'time_fare':        time_charge,
        'waiting_charge':   wait_charge,
        'surge_amount':     surge_amt,
        'tax_amount':       tax_amount,
        'total_fare':       total,            # paise
        'platform_fee':     platform_fee,
        'driver_earnings':  driver_earnings,
        'surge_multiplier': surge_multiplier,
    }
```

---

## 8. Notification Templates (FCM)

| Event | Title | Body |
|-------|-------|------|
| New ride request (driver) | New Ride Request | {pickup} to {drop} · Rs.{fare} |
| Driver accepted (rider) | Driver On The Way | {driver_name} is heading to you |
| Driver arrived (rider) | Driver Has Arrived | Your driver is waiting at pickup |
| Ride started (rider) | Ride Started | Safe travels! Ride has begun |
| Ride completed (both) | Ride Completed | Hope you had a great ride! Rs.{fare} |
| OTP SMS | Your OTP | NQTaxi OTP: {otp}. Valid 5 minutes. Do not share |
| Document approved (driver) | Documents Approved | You can now accept rides! |
| Document rejected (driver) | Document Issue | Please re-upload {doc_type} |
| Bonus credited (driver) | Bonus Credited | Rs.{amount} bonus added to wallet |
| Payout sent (driver) | Payout Sent | Rs.{amount} transferred to your bank |
| SOS triggered (admin) | SOS ALERT | {name} triggered emergency at {location} |

---

## 9. Payment Integration (Razorpay Flow)

```
WALLET TOP-UP FLOW
==================
1.  Rider clicks "Add Money"
2.  POST /payments/create-order/  {amount_paise: 100000}
3.  Server: razorpay.order.create -> returns {order_id}
4.  Frontend: Razorpay Checkout popup opens with order_id
5.  Rider pays -> Razorpay returns {payment_id, order_id, signature}
6.  POST /payments/verify/  {order_id, payment_id, signature}
7.  Server: HMAC verify -> if OK: credit wallet + WalletTransaction(credit, topup)
8.  Response: {success: true, new_balance_paise}

RIDE PAYMENT FLOW (Digital)
============================
1.  At booking: create Razorpay order for estimated_fare (capture=false)
2.  At completion: capture actual_fare
    if actual < estimated: trigger partial refund
    if actual > estimated: charge supplementary amount
3.  Create WalletTransaction(debit, ride_payment) for rider
4.  Create WalletTransaction(credit, ride_payment) for driver

DRIVER PAYOUT FLOW
==================
1.  Driver requests withdrawal: POST /drivers/wallet/withdraw/
2.  Server: debit wallet (pending), create WalletTransaction(pending)
3.  Celery task: RazorpayService.create_payout(amount, account, ifsc, name)
4.  Razorpay bank transfer (T+1 business days)
5.  Webhook: payout.processed -> WalletTransaction.status = completed
6.  FCM: "Rs.{X} has been transferred to your bank account"

WEBHOOK SECURITY
=================
POST /payments/webhook/  (no JWT)
Header: X-Razorpay-Signature
Verify: HMAC-SHA256(payload, webhook_secret) == signature
Reject if mismatch with 400
```

---

## 10. Admin Panel APIs

### Dashboard KPI Response Shape

```json
{
  "today": {
    "total_rides": 147,
    "completed": 132,
    "cancelled": 15,
    "ongoing": 8,
    "revenue_paise": 1284500,
    "new_riders": 23,
    "new_drivers": 4
  },
  "drivers": {
    "total": 85,
    "online": 34,
    "busy": 12,
    "offline": 39,
    "pending_approval": 6
  },
  "platform": {
    "avg_driver_rating": 4.72,
    "avg_rider_rating": 4.61,
    "avg_ride_duration_min": 28
  }
}
```

### Analytics Response Shape

```json
{
  "period": "week",
  "revenue_chart": [
    {"date": "2026-06-19", "revenue_paise": 185000, "ride_count": 42},
    {"date": "2026-06-20", "revenue_paise": 210000, "ride_count": 51}
  ],
  "top_drivers": [
    {"driver_id": "uuid", "name": "Rajesh Kumar", "rides": 18, "earnings_paise": 42000}
  ]
}
```

---

## 11. Security and Auth

### JWT Settings

```python
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":    timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME":   timedelta(days=7),
    "ROTATE_REFRESH_TOKENS":    True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM":                "HS256",
    "SIGNING_KEY":              SECRET_KEY,
    "AUTH_HEADER_TYPES":        ("Bearer",),
    "USER_ID_FIELD":            "id",
    "USER_ID_CLAIM":            "user_id",
    "TOKEN_OBTAIN_SERIALIZER":  "accounts.serializers.CustomTokenObtainPairSerializer",
}
```

### Custom DRF Permissions

```python
# shared/permissions.py
from rest_framework.permissions import BasePermission

class IsRider(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'rider'

class IsDriver(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'driver'

class IsDriverFullyOnboarded(BasePermission):
    def has_permission(self, request, view):
        if not (request.user.is_authenticated and request.user.role == 'driver'):
            return False
        p = request.user.driver_profile
        return p.is_profile_complete and p.is_documents_complete and p.is_approved

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'
```

### Rate Limiting

```python
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon":     "100/hour",
        "user":     "1000/hour",
        "otp":      "5/hour",     # custom: OTP send attempts
        "auth":     "20/hour",    # custom: login attempts
        "location": "30/minute",  # custom: driver GPS updates
    },
}
```

---

## 12. Testing Strategy

### Coverage Targets

| Module | Coverage Goal |
|--------|--------------|
| `accounts` | 95% |
| `rides` | 90% |
| `fares` (calculator) | 100% |
| `payments` | 85% |
| `notifications` | 80% |
| `admin_panel` | 75% |
| **Overall** | **85%+** |

### Key Test Cases

```python
# Test: complete ride lifecycle (integration test)
def test_full_ride_flow(api_client, rider_user, driver_user, active_fare_config):
    # 1. Rider books -> returns otp
    # 2. Driver accepts -> status=accepted
    # 3. Driver marks arrived -> status=driver_arrived
    # 4. Driver submits otp -> status=in_progress
    # 5. Driver completes -> status=completed, wallets updated
    # 6. Rider rates driver -> rating recalculated

# Test: wrong OTP must be rejected
def test_invalid_otp_rejected(api_client, in_progress_ride):
    response = api_client.post(
        f'/api/v1/rides/{in_progress_ride.id}/verify-otp/',
        {'otp_code': '0000'}
    )
    assert response.status_code == 400
    assert in_progress_ride.status == 'driver_arrived'  # unchanged

# Test: fare calculation correctness
def test_fare_math_adds_up():
    result = calculate_fare('auto', distance_km=10, duration_min=25, surge_multiplier=1.5)
    assert result['driver_earnings'] + result['platform_fee'] == result['total_fare'] - result['tax_amount']
    assert result['total_fare'] > result['base_fare']

# Test: Razorpay signature verification
def test_razorpay_signature_invalid():
    response = api_client.post('/api/v1/payments/verify/', {
        'razorpay_order_id': 'order_123',
        'razorpay_payment_id': 'pay_123',
        'razorpay_signature': 'bad_signature'
    })
    assert response.status_code == 400
```

---

## 13. Local Dev and Deployment

### Local Development Setup

```bash
# 1. Clone and create virtual environment
git clone https://github.com/haneefdev276/NQTaxi
cd NQTaxi/backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# 2. Install all dependencies
pip install -r requirements.txt

# 3. Copy .env and fill in values
copy .env.example .env

# 4. Start PostgreSQL + Redis via Docker
docker run -d -p 5432:5432 ^
  -e POSTGRES_DB=nqtaxi_db ^
  -e POSTGRES_USER=nqtaxi_user ^
  -e POSTGRES_PASSWORD=password ^
  postgres:15

docker run -d -p 6379:6379 redis:7

# 5. Run migrations and seed data
python manage.py migrate
python manage.py seed_fares
python manage.py createsuperuser

# 6. Start Celery worker (separate terminal)
celery -A nqtaxi worker -l info -Q default

# 7. Start Celery Beat scheduler (separate terminal)
celery -A nqtaxi beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler

# 8. Start Django development server
python manage.py runserver 8000

# For WebSocket support in dev, use Daphne instead:
daphne nqtaxi.asgi:application --port 8000
```

### Production Architecture

```
Internet
   |
Nginx (SSL termination, static files via CDN)
   |
Daphne (ASGI server — handles both HTTP and WebSocket)
   |  \_____________________________
   |                                |
Django + DRF                 Django Channels
(REST endpoints)             (WebSocket consumers)
   |                                |
   |___________ Redis ______________| (Channel layer + Celery broker + cache)
   |
PostgreSQL                   Celery Workers x3 + Beat x1
(AWS RDS, Multi-AZ)
   |
AWS S3 + CloudFront          Sentry (error tracking)
(Static + Media files)       CloudWatch (logs + metrics)
```

### Required Environment Variables

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com

# PostgreSQL
DB_NAME=nqtaxi_db
DB_USER=nqtaxi_user
DB_PASSWORD=your-db-password
DB_HOST=your-rds-endpoint
DB_PORT=5432

# Redis
REDIS_URL=redis://your-elasticache-endpoint:6379/1
CELERY_BROKER_URL=redis://your-elasticache-endpoint:6379/0

# JWT
ACCESS_TOKEN_LIFETIME_MINUTES=30
REFRESH_TOKEN_LIFETIME_DAYS=7

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=your-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Twilio (OTP + SMS)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+91xxxxxxxxxx

# Firebase (Push Notifications)
FIREBASE_CREDENTIALS_PATH=/etc/secrets/firebase-credentials.json

# Google Maps (Fare Estimate)
GOOGLE_MAPS_API_KEY=AIzaSyxxx

# AWS S3 (Document Storage)
AWS_ACCESS_KEY_ID=AKIAxxx
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=nqtaxi-documents
AWS_S3_REGION_NAME=ap-south-1
```

---

## Priority Build Summary

```
MUST BUILD (Core MVP) — Weeks 1 through 5
  Phase 1   Project setup and custom user model
  Phase 2   Authentication: register, OTP, login, JWT, password reset
  Phase 3   Driver onboarding: profile, vehicle, documents, admin approval
  Phase 4   Fare engine: config, calculator, surge, estimate API
  Phase 5   Core ride lifecycle: book, accept, arrived, OTP, complete, cancel, rate
  Phase 6   WebSockets: live tracking, ride broadcast, driver discovery
  Phase 7   Payments: Razorpay wallet top-up, ride payment, driver payout

SHOULD BUILD (Full Product) — Weeks 5 through 7
  Phase 8   Push notifications: FCM, Twilio SMS, in-app feed
  Phase 9   Incentives and bonuses: programs, auto-tracking, payout
  Phase 10  Admin panel APIs: dashboard, fleet, analytics, reports, support
  Phase 11  Safety SOS: trigger, SMS contacts, admin resolution

POLISH (Production Ready) — Weeks 7 through 8
  Phase 12  Tests (85%+ coverage), API docs (Swagger), deployment
```

---

*Document last updated: 2026-06-25*
*NQTaxi Engineering Team*
