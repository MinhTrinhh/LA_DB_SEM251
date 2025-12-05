-- Payment method
CREATE TABLE payment_method (
    method_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    charged_fee DECIMAL(10, 2),
    fee_payer NVARCHAR(50)
);

-- Bank (payment method subtype)
CREATE TABLE bank (
    bank_id BIGINT PRIMARY KEY,
    bank_name NVARCHAR(255),
    method_id BIGINT,

    CONSTRAINT fk_bank_method FOREIGN KEY (method_id)
        REFERENCES payment_method(method_id) ON DELETE SET NULL
);

-- E-wallet (payment method subtype)
CREATE TABLE e_wallet (
    e_wallet_id BIGINT PRIMARY KEY,
    e_wallet_name NVARCHAR(255),
    method_id BIGINT,
    CONSTRAINT fk_ewallet_method FOREIGN KEY (method_id)
        REFERENCES payment_method(method_id) ON DELETE SET NULL
);

-- Paid by (Order - Payment Method relationship)
CREATE TABLE paid_by (
    order_id BIGINT PRIMARY KEY,
    method_id BIGINT,

    qr_code_url NVARCHAR(500),
    transaction_id BIGINT IDENTITY(1,1),
    timestamp DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT fk_paid_by_order FOREIGN KEY (order_id)
        REFERENCES [order](order_id) ON DELETE CASCADE,
    CONSTRAINT fk_paid_by_method FOREIGN KEY (method_id)
        REFERENCES payment_method(method_id)
);

-- =====================================================
-- INSERT DEMO DATA
-- =====================================================

-- Insert Payment Methods for Banks (fee_payer: PARTICIPANT or ORGANIZER)
-- Banks typically charge 0-1% fee
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (0.00, 'ORGANIZER');  -- method_id 1: Free for PARTICIPANT
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (1100.00, 'PARTICIPANT'); -- method_id 2: Fixed fee
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (0.00, 'ORGANIZER');  -- method_id 3: Free for PARTICIPANT
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (0.00, 'ORGANIZER');  -- method_id 4: Free for PARTICIPANT
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (1100.00, 'PARTICIPANT'); -- method_id 5: Fixed fee
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (0.00, 'ORGANIZER');  -- method_id 6: Free for PARTICIPANT

-- Insert Payment Methods for E-wallets
-- E-wallets typically charge higher fees or fixed amounts
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (2000.00, 'PARTICIPANT'); -- method_id 7: Fixed fee
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (1500.00, 'PARTICIPANT'); -- method_id 8: Fixed fee
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (0.00, 'ORGANIZER');  -- method_id 9: Free for PARTICIPANT
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (0.00, 'ORGANIZER');  -- method_id 10: Free for PARTICIPANT
INSERT INTO payment_method (charged_fee, fee_payer) VALUES (2500.00, 'PARTICIPANT'); -- method_id 11: Fixed fee

-- Insert Popular Vietnamese Banks
INSERT INTO bank (bank_id, bank_name, method_id) VALUES (1, N'Vietcombank - Ngân hàng TMCP Ngoại Thương Việt Nam', 1);
INSERT INTO bank (bank_id, bank_name, method_id) VALUES (2, N'VietinBank - Ngân hàng TMCP Công Thương Việt Nam', 2);
INSERT INTO bank (bank_id, bank_name, method_id) VALUES (3, N'BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', 3);
INSERT INTO bank (bank_id, bank_name, method_id) VALUES (4, N'Agribank - Ngân hàng Nông nghiệp và Phát triển Nông thôn', 4);
INSERT INTO bank (bank_id, bank_name, method_id) VALUES (5, N'Techcombank - Ngân hàng TMCP Kỹ Thương Việt Nam', 5);
INSERT INTO bank (bank_id, bank_name, method_id) VALUES (6, N'MB Bank - Ngân hàng TMCP Quân Đội', 6);

-- Insert Popular Vietnamese E-wallets
INSERT INTO e_wallet (e_wallet_id, e_wallet_name, method_id) VALUES (1, N'MoMo - Ví điện tử MoMo', 7);
INSERT INTO e_wallet (e_wallet_id, e_wallet_name, method_id) VALUES (2, N'ZaloPay - Ví điện tử ZaloPay', 8);
INSERT INTO e_wallet (e_wallet_id, e_wallet_name, method_id) VALUES (3, N'VNPay - Ví điện tử VNPay', 9);
INSERT INTO e_wallet (e_wallet_id, e_wallet_name, method_id) VALUES (4, N'ShopeePay - Ví điện tử ShopeePay', 10);
INSERT INTO e_wallet (e_wallet_id, e_wallet_name, method_id) VALUES (5, N'ViettelPay - Ví điện tử Viettel Money', 11);
