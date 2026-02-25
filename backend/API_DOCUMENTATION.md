# Repair E-commerce API Documentation

**Base URL**: `/api/v1`
**Version**: v1

## Authentication
Authentication is handled via JWT (JSON Web Tokens).
For protected routes, include the token in the request header:
`Authorization: Bearer <your_jwt_token>`

## Error Handling
Standard error response format:
```json
{
  "message": "Error description",
  "stack": "Stack trace (development only)"
}
```

---

## 1. Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/signup` | Register a new user | No | `name`, `email`, `password` |
| **POST** | `/auth/login` | Login user | No | `email`, `password` |
| **POST** | `/auth/google` | Google Login | No | `token` |
| **POST** | `/auth/forgot-password` | Request password reset | No | `email` |
| **POST** | `/auth/reset-password` | Reset password | No | `token`, `password` |
| **POST** | `/auth/change-password` | Change password | Yes | `currentPassword`, `newPassword` |

---

## 2. Products (`/products`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/products` | Get all products (with filters) | No | Query: `page`, `limit`, `q`, `category`, `brand`, `minPrice`, `maxPrice`, `sort` |
| **GET** | `/products/:id` | Get single product | No | - |
| **POST** | `/products/:id/reviews` | Add product review | Yes | `rating` (1-5), `comment` |
| **POST** | `/products` | Create product | Admin/Tech | `name`, `description`, `price`, `category`, `stock`, `images` (array), `brand` |
| **PUT** | `/products/:id` | Update product | Admin/Tech | Product fields to update |
| **DELETE** | `/products/:id` | Delete product | Admin | - |

---

## 3. Repairs (`/repairs`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/repairs/track/:trackingId` | Track repair by ID | No | - |
| **POST** | `/repairs` | Create repair request | Yes | `deviceType`, `brand`, `model`, `issue`, `problemDescription`, `fullName`, `phoneNumber`, `pickupAddress`, `city`, `pincode`, `pickupDate` |
| **GET** | `/repairs/my-repairs` | Get user's repairs | Yes | - |
| **GET** | `/repairs/:id` | Get repair details | Yes | - |
| **GET** | `/repairs` | Get all repairs | Admin/Tech | Query filters |
| **PUT** | `/repairs/:id` | Update repair | Admin/Tech | Repair fields to update |
| **POST** | `/repairs/:id/status` | Add status update | Admin/Tech | `status`, `note` |
| **DELETE** | `/repairs/:id` | Delete repair | Admin | - |

**Valid Statuses**: `Pending`, `Confirmed`, `In Progress`, `Diagnosed`, `Repairing`, `Quality Check`, `Completed`, `Delivered`, `Cancelled`

---

## 4. Orders (`/orders`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/orders` | Create new order | Yes | `orderItems` (array), `shippingAddress` (obj), `paymentMethod`, `itemsPrice`, `shippingPrice`, `totalPrice` |
| **GET** | `/orders/my-orders` | Get user's orders | Yes | - |
| **GET** | `/orders/:id` | Get order details | Yes | - |
| **GET** | `/orders` | Get all orders | Admin | - |
| **PUT** | `/orders/:id` | Update order | Admin | Order fields |
| **PATCH** | `/orders/:id/status` | Update order status | Admin | `status` |
| **DELETE** | `/orders/:id` | Delete order | Yes | - |

**Valid Statuses**: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`

---

## 5. Users (`/users`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/users/contact` | Contact Support | No | `name`, `email`, `subject`, `message` |
| **GET** | `/users/profile` | Get my profile | Yes | - |
| **PUT** | `/users/profile` | Update my profile | Yes | `name`, `phone`, `address`, `socialLinks`, `preferences` |
| **GET** | `/users` | Get all users | Admin | - |
| **GET** | `/users/:id` | Get user by ID | Admin | - |
| **PUT** | `/users/:id` | Update user | Admin | `name`, `email`, `role`, `password` |
| **DELETE** | `/users/:id` | Delete user | Admin | - |

---

## 6. Cart (`/cart`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/cart` | Get cart items | Yes | - |
| **POST** | `/cart/sync` | Sync local cart to DB | Yes | `cartItems` (array) |
| **PUT** | `/cart` | Update cart item | Yes | `productId`, `quantity` |

---

## 7. Wishlist (`/wishlist`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/wishlist` | Get wishlist | Yes | - |
| **POST** | `/wishlist/:productId` | Add to wishlist | Yes | - |
| **GET** | `/wishlist/check/:productId` | Check if exists | Yes | - |
| **DELETE** | `/wishlist/:productId` | Remove item | Yes | - |
| **DELETE** | `/wishlist` | Clear wishlist | Yes | - |

---

## 8. Dashboard (`/dashboard`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/dashboard/summary` | User dashboard summary | Yes | - |
| **GET** | `/dashboard/orders` | Get orders with filters | Yes | - |
| **POST** | `/dashboard/orders/:orderId/reorder` | Reorder items | Yes | - |

---

## 9. Addresses (`/addresses`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/addresses` | Get all addresses | Yes | - |
| **GET** | `/addresses/default` | Get default address | Yes | - |
| **POST** | `/addresses` | Add address | Yes | `fullName`, `phone`, `address`, `city`, `state`, `zip`, `label` |
| **PUT** | `/addresses/:id` | Update address | Yes | Address fields |
| **PUT** | `/addresses/:id/default` | Set as default | Yes | - |
| **DELETE** | `/addresses/:id` | Delete address | Yes | - |

---

## 10. Notifications (`/notifications`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/notifications` | Get notifications | Yes | - |
| **GET** | `/notifications/unread-count` | Get unread count | Yes | - |
| **PUT** | `/notifications/:id/read` | Mark as read | Yes | - |
| **PUT** | `/notifications/read-all` | Mark all read | Yes | - |
| **DELETE** | `/notifications/:id` | Delete notification | Yes | - |

---

## 11. Chat (`/chat`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/chat/send` | Send message | Yes | `receiverId`, `message` |
| **GET** | `/chat/messages/:userId` | Get messages with user | Yes | - |
| **GET** | `/chat/conversations` | Get conversations | Yes | - |
| **GET** | `/chat/unread-count` | Get unread messages | Yes | - |
| **GET** | `/chat/support-admin` | Get support admin ID | Yes | - |
| **DELETE** | `/chat/conversations/:userId` | Delete conversation | Yes | - |

---

## 12. Admin (`/admin`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/admin/dashboard/stats` | Dashboard stats | Admin | - |
| **GET** | `/admin/dashboard/activities`| Recent activities | Admin | - |
| **GET** | `/admin/users` | Get all users | Admin | - |
| **PUT** | `/admin/orders/:id/status` | Update order status | Admin | `status` |
| **POST** | `/admin/repairs/:repairId/assign-technician` | Assign technician | Admin | `technicianId` |

---

## 13. Parts (`/parts`) - Technician/Admin

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/parts` | Get all parts | Tech | - |
| **POST** | `/parts` | Create part | Tech | `name`, `partNumber`, `description`, `price`, `stock` |
| **GET** | `/parts/:id` | Get part details | Tech | - |
| **PUT** | `/parts/:id` | Update part | Tech | Part fields |
| **DELETE** | `/parts/:id` | Delete part | Tech | - |
| **POST** | `/parts/:id/stock` | Add stock | Tech | `quantity` |

---

## 14. Payment (`/payment`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/payment/create-order` | Create Razorpay order | Yes | `amount` |
| **POST** | `/payment/verify` | Verify payment | Yes | `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` |
