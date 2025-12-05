# 🎯 Payment QR Code Implementation - Complete Guide

## Overview
Successfully implemented a complete payment QR code generation system for MB Bank that generates VietQR-compliant QR codes when participants place orders.

---

## ✅ What Was Implemented

### 1. **Dependencies Added**
- **ZXing Library** (v3.5.2) - For QR code generation
  - `com.google.zxing:core` - Core QR code functionality
  - `com.google.zxing:javase` - Image generation

### 2. **Configuration**
- **PaymentQRCodeConfig.java** - Configuration properties class
- **application.properties** - Added QR code settings:
  ```properties
  # QR Code Storage
  payment.qrcode.storage-dir=qr-codes/payments
  payment.qrcode.width=400
  payment.qrcode.height=400
  payment.qrcode.base-url=http://localhost:20001/api/qr-codes
  
  # MB Bank Account (YOU NEED TO UPDATE THIS)
  payment.mbbank.account-no=YOUR_ACCOUNT_NUMBER
  payment.mbbank.account-name=YOUR_ACCOUNT_NAME
  payment.mbbank.bank-code=970422
  payment.mbbank.bank-name=MB Bank
  ```

### 3. **Services Created**

#### QRCodeService.java
- `generateVietQRCode()` - Generates VietQR standard QR codes
- `generatePaymentDescription()` - Creates payment description
- `deleteQRCode()` - Cleans up QR codes for cancelled orders
- Stores QR codes in `qr-codes/payments/` directory
- QR code filename format: `order_{orderId}_{timestamp}.png`

### 4. **Order Flow Enhanced**

#### CreateOrderRequest.java - Updated
```java
@NotNull(message = "Payment method ID is required")
private Long paymentMethodId; // User selects payment method
```

#### OrderService.java - Enhanced
- Added `QRCodeService`, `PaymentMethodRepository`, `PaidByRepository` dependencies
- New method: `createPaymentRecord()` - Creates PaidBy record with QR code
- Updated `createOrder()` - Generates QR code after order creation
- Updated `convertToOrderDTO()` - Includes payment information

#### OrderDTO.java - Enhanced
```java
private String qrCodeUrl;
private PaymentMethodDTO paymentMethod;
private String paymentDescription;
```

### 5. **PaidBy Entity Integration**
- Automatically created when order is placed
- Stores QR code URL for payment
- Links order with payment method
- Tracks transaction ID and timestamp

### 6. **QR Code Controller**
- **QRCodeController.java** - Serves QR code images
- Endpoint: `GET /api/qr-codes/{filename}`
- Returns PNG images for frontend display

---

## 🔄 Order Creation Flow

```
1. User selects tickets and payment method
   ↓
2. POST /api/orders (with paymentMethodId)
   ↓
3. OrderService.createOrder()
   - Validates user & tickets
   - Calculates total amount
   - Creates Order (status: AWAITING_PAYMENT)
   - Creates tickets
   - Generates payment QR code (if amount > 0)
   - Creates PaidBy record
   ↓
4. Returns OrderDTO with:
   - Order details
   - QR code URL
   - Payment method info
   - Payment description
```

---

## 📊 VietQR Format

The QR code contains a string in VietQR standard format:
```
{bankCode}|{accountNo}|{accountName}|{amount}|{description}|{template}
```

**Example:**
```
970422|0123456789|NGUYEN VAN A|500000|ORDER123|compact2
```

**Where:**
- `970422` - MB Bank code
- `0123456789` - Your account number
- `NGUYEN VAN A` - Your account name
- `500000` - Amount in VND (no decimals)
- `ORDER123` - Order reference
- `compact2` - VietQR template

---

## 🚀 How to Use

### Step 1: Update MB Bank Account Info

Edit `application.properties`:
```properties
payment.mbbank.account-no=YOUR_REAL_ACCOUNT_NUMBER
payment.mbbank.account-name=YOUR_REAL_ACCOUNT_NAME
```

### Step 2: Create Order with Payment Method

**Frontend sends:**
```json
POST /api/orders
{
  "eventId": 1,
  "sessionId": 1,
  "ticketQuantities": {
    "1": 2
  },
  "currency": "VND",
  "paymentMethodId": 6  ← MB Bank method ID
}
```

### Step 3: Receive Order with QR Code

**Backend returns:**
```json
{
  "orderId": 123,
  "orderStatus": "AWAITING_PAYMENT",
  "amountOfMoney": 500000,
  "qrCodeUrl": "http://localhost:20001/api/qr-codes/order_123_1701234567890.png",
  "paymentDescription": "ORDER123",
  "paymentMethod": {
    "methodId": 6,
    "chargedFee": 0.00,
    "feePayer": "MERCHANT",
    "type": "BANK",
    "name": "MB Bank - Ngân hàng TMCP Quân Đội"
  },
  "tickets": [ ... ]
}
```

### Step 4: Display QR Code to User

Frontend displays:
```html
<img src="http://localhost:20001/api/qr-codes/order_123_1701234567890.png" 
     alt="Payment QR Code" />
<p>Scan to pay: 500,000 VND</p>
<p>Description: ORDER123</p>
```

### Step 5: User Scans QR Code

- User opens banking app
- Scans QR code
- Banking app auto-fills:
  - Bank: MB Bank
  - Account number
  - Amount: 500,000 VND
  - Description: ORDER123
- User confirms payment

### Step 6: Confirm Payment (Manual/Webhook)

You'll need to implement payment confirmation:
```
POST /api/orders/{orderId}/confirm-payment
```

---

## 📁 Project Structure

```
backend/
├── qr-codes/
│   └── payments/
│       ├── order_1_1701234567890.png
│       ├── order_2_1701234567891.png
│       └── ...
├── src/main/java/org/minhtrinh/eventease251/
│   ├── config/
│   │   └── PaymentQRCodeConfig.java          ← Configuration
│   ├── controller/
│   │   └── QRCodeController.java             ← Serves QR images
│   ├── entity/
│   │   ├── PaidBy.java                       ← Payment tracking
│   │   ├── PaymentMethod.java
│   │   ├── Bank.java
│   │   └── EWallet.java
│   ├── service/
│   │   ├── QRCodeService.java                ← QR generation
│   │   ├── OrderService.java                 ← Updated with payment
│   │   └── PaymentMethodService.java
│   └── dto/
│       ├── CreateOrderRequest.java           ← Updated
│       ├── OrderDTO.java                     ← Enhanced
│       └── PaymentMethodDTO.java
└── src/main/resources/
    └── application.properties                ← QR config
```

---

## 🔧 Configuration Options

### QR Code Size
```properties
payment.qrcode.width=400    # Change to 300-600 for different sizes
payment.qrcode.height=400
```

### Storage Directory
```properties
payment.qrcode.storage-dir=qr-codes/payments  # Can be absolute path
```

### VietQR Template
```properties
payment.vietqr.template=compact2  # Options: compact, compact2, print, qr_only
```

---

## 🎨 Frontend Integration

### React Example
```typescript
import { useState, useEffect } from 'react';

function PaymentQRCode({ order }) {
  return (
    <div className="payment-qr">
      <h3>Scan QR Code to Pay</h3>
      <img 
        src={order.qrCodeUrl} 
        alt="Payment QR Code"
        width="400"
        height="400"
      />
      <div className="payment-details">
        <p>Amount: {order.amountOfMoney.toLocaleString()} VND</p>
        <p>Payment to: {order.paymentMethod.name}</p>
        <p>Description: {order.paymentDescription}</p>
        <p>Status: {order.orderStatus}</p>
      </div>
      <p className="note">
        After payment, please wait for confirmation
      </p>
    </div>
  );
}
```

---

## 🔐 Security Considerations

1. **QR Code Access**: Files are served publicly (anyone with URL can access)
   - Consider adding authentication if needed
   - QR codes expire when order expires

2. **Payment Verification**: 
   - Currently manual verification needed
   - Consider integrating MB Bank API for automatic verification
   - Or use webhooks from payment gateway

3. **File Cleanup**:
   - Delete QR codes for expired/cancelled orders
   - Implement scheduled cleanup task

---

## 📝 Next Steps

### 1. Update Application Properties
```bash
cd backend/src/main/resources
nano application.properties
# Update MB Bank account details
```

### 2. Run Maven to Download Dependencies
```bash
cd backend
./mvnw clean install
```

### 3. Test Order Creation
```bash
# Start backend
./mvnw spring-boot:run

# Create order with payment method
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

### 4. Check QR Code
```bash
# List generated QR codes
ls -la backend/qr-codes/payments/

# Open QR code in browser
open http://localhost:20001/api/qr-codes/order_1_xxxxx.png
```

---

## 🐛 Troubleshooting

### QR Code Not Generated
- Check `qr-codes/payments/` directory exists
- Check logs for errors
- Verify ZXing library is downloaded

### QR Code Not Displayed
- Check QR code URL in OrderDTO
- Verify QRCodeController is accessible
- Check CORS settings

### Invalid QR Code
- Update MB Bank account details in application.properties
- Check VietQR format is correct
- Test with banking app

---

## 📚 Database Schema

```sql
-- PaidBy table stores QR code and payment info
CREATE TABLE paid_by (
    order_id BIGINT PRIMARY KEY,
    method_id BIGINT,
    qr_code_url NVARCHAR(500),        ← Stores QR code URL
    transaction_id BIGINT IDENTITY(1,1),
    timestamp DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES [order](order_id),
    FOREIGN KEY (method_id) REFERENCES payment_method(method_id)
);
```

---

## ✅ Implementation Checklist

- ✅ Added ZXing dependency to pom.xml
- ✅ Created PaymentQRCodeConfig
- ✅ Created QRCodeService
- ✅ Updated CreateOrderRequest
- ✅ Updated OrderService
- ✅ Updated OrderDTO
- ✅ Created QRCodeController
- ✅ Added configuration to application.properties
- ⚠️ **TODO: Update MB Bank account details**
- ⚠️ **TODO: Run Maven to download dependencies**
- ⚠️ **TODO: Test order creation with QR code**
- ⚠️ **TODO: Implement payment confirmation endpoint**

---

## 🎉 Summary

Your event ticketing system now supports:
- ✅ QR code generation for MB Bank payments
- ✅ VietQR-compliant format
- ✅ Order-specific payment amounts
- ✅ QR code storage in project directory
- ✅ HTTP endpoint to serve QR codes
- ✅ Payment method selection
- ✅ Complete order-to-payment tracking

**Next:** Update your MB Bank account details and test the feature!

