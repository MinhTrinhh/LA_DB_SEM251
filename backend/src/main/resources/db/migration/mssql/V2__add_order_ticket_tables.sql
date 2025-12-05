-- Order table
CREATE TABLE [order] (
    order_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_status NVARCHAR(50) NOT NULL,
    currency NVARCHAR(10),
    amount_of_money DECIMAL(10, 2),
    user_id BIGINT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT fk_order_user FOREIGN KEY (user_id)
        REFERENCES [participant_profile](user_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE INDEX idx_order_user ON [order](user_id);
CREATE INDEX idx_order_status ON [order](order_status);

-- Ticket
CREATE TABLE ticket (
    ticket_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    qr_code_url NVARCHAR(500),
    used_flag BIT NOT NULL DEFAULT 0,
    category_id BIGINT,
    order_id BIGINT NULL,  -- Nullable to allow SET NULL on order deletion

    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT fk_ticket_category FOREIGN KEY (category_id)
        REFERENCES ticket_category(category_id) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_ticket_order FOREIGN KEY (order_id)
        REFERENCES [order](order_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE INDEX idx_ticket_category ON ticket(category_id);
CREATE INDEX idx_ticket_order ON ticket(order_id);

