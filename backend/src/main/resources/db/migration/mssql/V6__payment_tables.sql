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


