# Divine Drops API

Base URL: `http://localhost:4000/api`

Currency: **KWD**. Payment method: **CASH_ON_DELIVERY** only. No Stripe, PayPal or KNET.

## Auth

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | `{ fullName, email, phone?, password }` |
| POST | `/auth/login` | No | `{ email, password }` |
| GET | `/auth/me` | Bearer | — |

Default admin after seed:

- Email: `george.a@example.org`
- Password: `Admin@12345`

## Storefront

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/products` | Query: `q, category, minPrice, maxPrice, sort, featured, bestSeller, newArrival, page, limit` |
| GET | `/products/:id` | id or SKU |
| GET | `/categories` | |
| POST | `/orders` | Guest checkout |
| GET | `/orders/:orderNumber` | Confirmation lookup |
| GET | `/blogs` | |
| GET | `/blogs/:id` | id or slug |
| GET | `/reviews` | |
| POST | `/newsletter` | `{ email }` |
| GET | `/settings` | Delivery fee, currency |

### Create order body

```json
{
  "customerName": "Sara Al-Ahmad",
  "customerPhone": "96551234567",
  "customerEmail": "sara@example.com",
  "governorate": "Hawalli",
  "area": "Salmiya",
  "block": "4",
  "street": "Amman Street",
  "buildingNumber": "12",
  "deliveryInstructions": "Call on arrival",
  "items": [
    {
      "productId": "...",
      "quantity": 1,
      "selectedSize": "M",
      "selectedColour": "Black"
    }
  ]
}
```

Server calculates subtotal, delivery fee and total. Status starts as `PENDING`, payment `UNPAID`, method `CASH_ON_DELIVERY`.

## Admin (Bearer token, role ADMIN)

| Method | Path |
| --- | --- |
| GET | `/admin/dashboard` |
| GET | `/admin/inventory` |
| GET | `/admin/customers` |
| POST | `/admin/products` |
| PUT | `/admin/products/:id` |
| DELETE | `/admin/products/:id` |
| POST | `/admin/categories` |
| PUT | `/admin/categories/:id` |
| DELETE | `/admin/categories/:id` |
| GET | `/admin/orders?status=&q=` |
| GET | `/admin/orders/:id` |
| PATCH | `/admin/orders/:id/status` `{ "status": "CONFIRMED" }` |
| PATCH | `/admin/orders/:id/notes` `{ "adminNotes": "..." }` |
| GET | `/admin/orders/export/csv` |
| POST | `/admin/blogs` |
| PUT | `/admin/blogs/:id` |
| DELETE | `/admin/blogs/:id` |
| POST | `/admin/uploads` | multipart `image` via Cloudinary |

Confirming an order decrements stock. Cancelling a previously confirmed order restores stock.

Order statuses: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
