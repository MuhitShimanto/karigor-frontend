# Karigor Frontend: API Integration Documentation (MR-1)

This document maps all frontend components, routes, and hooks to their corresponding backend REST API endpoints implemented in `karigor-api`.

## 1. Authentication & Session

| Frontend Route / Component            | Method   | Backend Endpoint     | Purpose                              | Request Body / Query                      |
| :------------------------------------ | :------- | :------------------- | :----------------------------------- | :---------------------------------------- |
| `src/features/auth/register-form`     | `POST`   | `/api/auth/register` | Register customer or technician      | `{ name, email, password, role, phone? }` |
| `src/features/auth/login-form`        | `POST`   | `/api/auth/login`    | Authenticate user, receive JWT       | `{ email, password }`                     |
| `src/app/api/session` (Route Handler) | `POST`   | `/api/auth/login`    | Sets httpOnly `karigor_token` cookie | `{ email, password }`                     |
| `src/app/api/session` (Route Handler) | `DELETE` | —                    | Clears session cookie on logout      | None                                      |
| `src/lib/auth/session`                | `GET`    | `/api/auth/profile`  | Fetches active user profile          | Headers: `Bearer <token>`                 |

## 2. Public Marketplace & Services

| Frontend Route / Component                | Method | Backend Endpoint       | Purpose                                     | Request Body / Query                                                       |
| :---------------------------------------- | :----- | :--------------------- | :------------------------------------------ | :------------------------------------------------------------------------- |
| `src/app/(public)/page` (Hero/Featured)   | `GET`  | `/api/services`        | Fetches featured services for home grid     | `?limit=6`                                                                 |
| `src/app/(public)/page` (Top Technicians) | `GET`  | `/api/technicians`     | Fetches top rated technicians               | `?sortBy=rating&order=desc&limit=4`                                        |
| `src/features/services/filter-bar`        | `GET`  | `/api/categories`      | Populates category filter pills/select      | None                                                                       |
| `src/app/(public)/services/page`          | `GET`  | `/api/technicians`     | Search & filter technicians with pagination | `?category=&location=&minRating=&minPrice=&maxPrice=&search=&page=&limit=` |
| `src/app/(public)/technicians/[id]/page`  | `GET`  | `/api/technicians/:id` | Full technician public profile & reviews    | Param: `:id`                                                               |

## 3. Customer Bookings & Payments

| Frontend Route / Component                     | Method  | Backend Endpoint           | Purpose                                   | Request Body / Query                                   |
| :--------------------------------------------- | :------ | :------------------------- | :---------------------------------------- | :----------------------------------------------------- |
| `src/features/technicians/book-now-panel`      | `POST`  | `/api/bookings`            | Create new booking (Status `REQUESTED`)   | `{ technicianId, serviceId, slotId, address, notes? }` |
| `src/features/technicians/slot-picker`         | `GET`   | `/api/technicians/:id`     | Retrieves available slots for booking     | Param: `:id`                                           |
| `src/features/bookings/booking-table`          | `GET`   | `/api/bookings`            | Lists customer booking history            | `?status=&page=&limit=`                                |
| `src/features/bookings/cancel-dialog`          | `PATCH` | `/api/bookings/:id/cancel` | Cancels unpaid booking (releases slot)    | Param: `:id`, `{ reason? }`                            |
| `src/app/dashboard/customer/bookings/[id]/pay` | `POST`  | `/api/payments/create`     | Initiates Stripe Checkout hosted session  | `{ bookingId }`                                        |
| `src/features/payments/payment-table`          | `GET`   | `/api/payments`            | Lists customer payment transaction logs   | `?page=&limit=`                                        |
| `src/features/reviews/review-form`             | `POST`  | `/api/reviews`             | Submits rating & review for completed job | `{ bookingId, rating, comment? }`                      |

## 4. Technician Dashboard

| Frontend Route / Component                     | Method  | Backend Endpoint               | Purpose                                                  | Request Body / Query                                     |
| :--------------------------------------------- | :------ | :----------------------------- | :------------------------------------------------------- | :------------------------------------------------------- |
| `src/app/dashboard/technician/profile`         | `PUT`   | `/api/technician/profile`      | Updates bio, hourly rate, location, skills               | `{ bio, skills, hourlyRate, location, experienceYears }` |
| `src/app/dashboard/technician/availability`    | `PUT`   | `/api/technician/availability` | Bulk update weekly availability time slots               | `{ slots: [{ startTime, endTime }] }`                    |
| `src/features/technicians/technician-bookings` | `GET`   | `/api/technician/bookings`     | Lists incoming job requests & active jobs                | `?status=&page=&limit=`                                  |
| `src/features/technicians/technician-bookings` | `PATCH` | `/api/technician/bookings/:id` | Action buttons: `accept`, `decline`, `start`, `complete` | `{ action: 'accept'                                      | 'decline' | 'start' | 'complete' }` |

## 5. Admin Dashboard

| Frontend Route / Component                | Method  | Backend Endpoint        | Purpose                                   | Request Body / Query                  |
| :---------------------------------------- | :------ | :---------------------- | :---------------------------------------- | :------------------------------------ |
| `src/app/dashboard/admin/page`            | `GET`   | `/api/admin/bookings`   | Platform bookings metrics & health        | `?page=1&limit=1`                     |
| `src/app/dashboard/admin/page`            | `GET`   | `/api/admin/payments`   | Platform revenue overview                 | `?page=1&limit=1`                     |
| `src/app/dashboard/admin/users/page`      | `GET`   | `/api/admin/users`      | List all users with role/status filters   | `?role=&status=&search=&page=&limit=` |
| `src/features/admin/ban-toggle`           | `PATCH` | `/api/admin/users/:id`  | Ban or unban a user account               | `{ status: 'ACTIVE'                   | 'BANNED' }` |
| `src/app/dashboard/admin/categories/page` | `GET`   | `/api/admin/categories` | Admin list of categories with active flag | None                                  |
| `src/features/admin/category-form`        | `POST`  | `/api/admin/categories` | Create a new service category             | `{ name }`                            |

## 6. BFF Proxy Architecture

All client-side requests originating from React Components and TanStack Query pass through `/api/bff/[...path]`.

- Avoids cross-domain CORS issues.
- Securely reads the httpOnly `karigor_token` cookie and attaches `Authorization: Bearer <token>`.
- Token is never exposed to browser client JavaScript bundles.
