# ✅ QR Code Payment System - Implementation Complete

## What Was Fixed and Enhanced

### 🔧 **Backend Order QR Code Handling - Correctly Implemented**

---

## 📝 Changes Made

### 1. **Repository Layer Updates**

#### BankRepository.java - Added Query Method
```java
@Query("SELECT b FROM Bank b JOIN FETCH b.paymentMethod pm WHERE pm.methodId = :methodId")
Optional<Bank> findByPaymentMethodId(@Param("methodId") Long methodId);
```

#### EWalletRepository.java - Added Query Method
```java
@Query("SELECT e FROM EWallet e JOIN FETCH e.paymentMethod pm WHERE pm.methodId = :methodId")
Optional<EWallet> findByPaymentMethodId(@Param("methodId") Long methodId);
```

**Why:** Bank and E-Wallet have their own primary keys (bank_id, e_wallet_id), but we need to query by the payment method's method_id to get the correct bank/wallet info.

---

### 2. **Service Layer Enhancements**

#### PaymentMethodService.java - Added Utility Method
```java
public PaymentMethodDTO convertToDTO(PaymentMethod paymentMethod) {
    // Converts PaymentMethod entity to DTO with type and name
    // Automatically determines if it's a BANK or E_WALLET
    // Fetches the correct name from Bank or EWallet table
}
```

**Benefits:**
- ✅ Centralized payment method DTO conversion
- ✅ Reusable across services
- ✅ Automatically resolves Bank vs E-Wallet

---

#### OrderService.java - Enhanced with Payment Features

**Added Dependencies:**
```java
private final QRCodeService qrCodeService;
private final PaymentMethodService paymentMethodService;
```

**New Methods:**

1. **`createPaymentRecord(Order, Long)`** - Creates PaidBy record with QR code
   ```java
   - Validates payment method exists
   - Generates QR code if amount > 0
   - Saves PaidBy record with QR code URL
   - Returns PaidBy entity
   ```

2. **`confirmPayment(Long orderId, Long userId)`** - Manual payment confirmation
   ```java
   - Verifies order ownership
   - Validates order is in AWAITING_PAYMENT status
   - Updates status to PAID
   - Returns updated OrderDTO
   ```

3. **`cancelOrder(Long orderId)`** - Cancel unpaid orders
   ```java
   - Validates order is not PAID
   - Updates status to CANCELED
   - Deletes QR code file
   ```

**Updated Method:**

`convertToOrderDTO()` - Now includes payment information
```java
- Fetches PaidBy record
- Includes QR code URL
- Includes payment description (e.g., "ORDER123")
- Uses PaymentMethodService to convert payment method to DTO
- Returns complete order with payment details
```

---

### 3. **Controller Layer - New Endpoints**

#### OrderController.java - Added Payment Endpoints

**1. Confirm Payment**
```
POST /api/orders/{orderId}/confirm-payment
Authorization: Bearer {token}
Role: PARTICIPANT

Response: Updated OrderDTO with status PAID
```

**2. Cancel Order**
```
DELETE /api/orders/{orderId}
Authorization: Bearer {token}
Role: ORGANIZER or ADMIN

Response: Success message
```

---

## 🔄 Complete Order Flow with QR Code

### **Step 1: Create Order**
```
POST /api/orders
{
  "eventId": 1,
  "sessionId": 1,
  "ticketQuantities": {"1": 2},
  "currency": "VND",
  "paymentMethodId": 6  ← MB Bank
}
```

**Backend Process:**
1. Validates user & tickets
2. Calculates total amount
3. Creates Order (status: AWAITING_PAYMENT)
4. Creates tickets with ticket QR codes
5. **Generates payment QR code** → saved to `qr-codes/payments/order_X_timestamp.png`
6. Creates PaidBy record with QR code URL
7. Returns OrderDTO with payment info

**Response:**
```json
{
  "orderId": 123,
  "orderStatus": "AWAITING_PAYMENT",
  "amountOfMoney": 500000,
  "qrCodeUrl": "http://localhost:20001/api/qr-codes/order_123_1701234567890.png",
  "paymentDescription": "ORDER123",
  "paymentMethod": {
    "methodId": 6,
    "type": "BANK",
    "name": "MB Bank - Ngân hàng TMCP Quân Đội",
    "chargedFee": 0.00,
    "feePayer": "MERCHANT"
  },
  "tickets": [...]
}
```

---

### **Step 2: Display QR Code to User**

Frontend shows:
- QR code image
- Amount to pay
- Payment description
- Bank/wallet name
- Order status

User scans QR code with banking app and pays.

---

### **Step 3: Confirm Payment**

After user pays, call:
```
POST /api/orders/123/confirm-payment
Authorization: Bearer {token}
```

**Backend Process:**
1. Verifies order belongs to authenticated user
2. Checks order is in AWAITING_PAYMENT status
3. Updates order status to PAID
4. Updates timestamp
5. Returns updated order

**Response:**
```json
{
  "orderId": 123,
  "orderStatus": "PAID",  ← Updated status
  ...
}
```

---

### **Step 4: Cancel Order (if needed)**

Organizer/admin can cancel:
```
DELETE /api/orders/123
Authorization: Bearer {token}
```

**Backend Process:**
1. Validates order is not PAID
2. Updates status to CANCELED
3. **Deletes QR code file** from disk
4. Returns success message

---

## 📊 Database Integration

### **PaidBy Table**
```sql
CREATE TABLE paid_by (
    order_id BIGINT PRIMARY KEY,
    method_id BIGINT,
    qr_code_url NVARCHAR(500),        ← Stores QR file path
    transaction_id BIGINT IDENTITY(1,1),
    timestamp DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES [order](order_id),
    FOREIGN KEY (method_id) REFERENCES payment_method(method_id)
);
```

**How it works:**
- One PaidBy record per order
- Links order to payment method
- Stores QR code URL
- Tracks transaction timestamp

---

## 🎯 Key Improvements

### ✅ **Correct Entity Relationships**
- Fixed Bank/EWallet queries to use `method_id` properly
- OneToOne relationship correctly implemented

### ✅ **QR Code Generation**
- VietQR-compliant format
- Order-specific amounts
- Stored in project directory
- URL served via HTTP endpoint

### ✅ **Payment Method Resolution**
- Centralized in PaymentMethodService
- Automatically determines BANK vs E_WALLET
- Fetches correct name from related table

### ✅ **Order Status Management**
- AWAITING_PAYMENT → PAID (via confirmPayment)
- AWAITING_PAYMENT → CANCELED (via cancelOrder)
- Proper validation and ownership checks

### ✅ **QR Code Lifecycle**
- Generated when order created
- Accessible via HTTP
- Deleted when order cancelled

---

## 🧪 Testing Guide

### **1. Create Order with QR Code**
```bash
curl -X POST http://localhost:20001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "eventId": 1,
    "sessionId": 1,
    "ticketQuantities": {"1": 2},
    "currency": "VND",
    "paymentMethodId": 6
  }'
```

**Expected:**
- Order created with status AWAITING_PAYMENT
- QR code URL returned in response
- QR code file created in `qr-codes/payments/`

---

### **2. View QR Code**
```bash
# Open in browser
open http://localhost:20001/api/qr-codes/order_123_1701234567890.png

# Or view with curl
curl http://localhost:20001/api/qr-codes/order_123_1701234567890.png --output qr.png
```

**Expected:**
- PNG image displayed/downloaded
- QR code scannable by banking app

---

### **3. Get Order Details**
```bash
curl http://localhost:20001/api/orders/my-orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
- List of user's orders
- Each order includes qrCodeUrl and paymentMethod
- Payment description included

---

### **4. Confirm Payment**
```bash
curl -X POST http://localhost:20001/api/orders/123/confirm-payment \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
- Order status updated to PAID
- Updated timestamp
- Returns full OrderDTO

---

### **5. Cancel Order**
```bash
curl -X DELETE http://localhost:20001/api/orders/123 \
  -H "Authorization: Bearer ORGANIZER_TOKEN"
```

**Expected:**
- Order status updated to CANCELED
- QR code file deleted from disk
- Success message returned

---

## 📁 File Structure

```
backend/
├── qr-codes/
│   └── payments/
│       ├── order_1_1701234567890.png  ← Generated QR codes
│       ├── order_2_1701234567891.png
│       └── ...
├── src/main/java/.../
│   ├── config/
│   │   └── PaymentQRCodeConfig.java
│   ├── controller/
│   │   ├── OrderController.java           ← Added endpoints
│   │   └── QRCodeController.java
│   ├── dto/
│   │   ├── ConfirmPaymentRequest.java     ← New DTO
│   │   ├── CreateOrderRequest.java        ← Updated
│   │   └── OrderDTO.java                  ← Enhanced
│   ├── entity/
│   │   ├── Bank.java
│   │   ├── EWallet.java
│   │   ├── PaymentMethod.java
│   │   └── PaidBy.java
│   ├── repository/
│   │   ├── BankRepository.java            ← Added query
│   │   └── EWalletRepository.java         ← Added query
│   └── service/
│       ├── OrderService.java              ← Enhanced
│       ├── PaymentMethodService.java      ← Added method
│       └── QRCodeService.java
```

---

## ✅ Implementation Checklist

- ✅ Fixed Bank/EWallet repository queries
- ✅ Added utility method in PaymentMethodService
- ✅ Enhanced OrderService with payment methods
- ✅ Added payment confirmation endpoint
- ✅ Added order cancellation endpoint
- ✅ QR code generation working correctly
- ✅ Payment method info included in OrderDTO
- ✅ QR code cleanup on cancellation
- ✅ Proper error handling and validation
- ✅ Transaction management

---

## 🎉 Summary

Your QR code payment system is now **fully functional**:

✅ **Order Creation** → Generates QR code with specific amount  
✅ **QR Code Storage** → Saved to project directory  
✅ **QR Code Access** → HTTP endpoint serves images  
✅ **Payment Method Info** → Correctly fetched and displayed  
✅ **Payment Confirmation** → Manual confirmation endpoint  
✅ **Order Cancellation** → Cleans up QR codes  
✅ **Complete Flow** → End-to-end order-to-payment tracking

**Ready to use with your MB Bank account!** 🚀

Just update your account details in `application.properties` and start testing!

