-- Create ORDER table
CREATE TABLE [ORDER] (
    Order_ID BIGINT IDENTITY(1,1) PRIMARY KEY,
    Order_Status NVARCHAR(50) NOT NULL,
    Currency NVARCHAR(10) NOT NULL,
    Amount_of_Money DECIMAL(19,2) NOT NULL,
    User_ID BIGINT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_ORDER_USER FOREIGN KEY (User_ID) REFERENCES [user](User_ID) ON DELETE CASCADE
);

-- Create TICKET table
CREATE TABLE TICKET (
    Ticket_ID BIGINT IDENTITY(1,1) PRIMARY KEY,
    QR_Code_URL NVARCHAR(500),
    Used_flag BIT NOT NULL DEFAULT 0,
    Order_ID BIGINT NOT NULL,
    Category_ID BIGINT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_TICKET_ORDER FOREIGN KEY (Order_ID) REFERENCES [ORDER](Order_ID) ON DELETE CASCADE,
    CONSTRAINT FK_TICKET_TICKET_CATEGORY FOREIGN KEY (Category_ID) REFERENCES ticket_category(category_id) ON DELETE NO ACTION
);

-- Create indexes for better query performance
CREATE INDEX idx_order_user_id ON [ORDER](User_ID);
CREATE INDEX idx_order_status ON [ORDER](Order_Status);
CREATE INDEX idx_ticket_order_id ON TICKET(Order_ID);
CREATE INDEX idx_ticket_category_id ON TICKET(Category_ID);
CREATE INDEX idx_ticket_used_flag ON TICKET(Used_flag);
