-- Create special_offers table
CREATE TABLE IF NOT EXISTS special_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(500) NOT NULL,
    link VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_special_offers_is_active ON special_offers(is_active);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_special_offers_created_at ON special_offers(created_at DESC);

-- Sample data for testing (optional)
INSERT INTO special_offers (title, description, image, link, is_active) VALUES
('Weekend Special - 20% Off', 'Get 20% off on all orders this weekend!', 'https://example.com/weekend-special.jpg', 'https://example.com/order-now', true),
('Family Combo Deal', 'Perfect combo for family dinner with dessert included', 'https://example.com/family-combo.jpg', 'https://example.com/family-deal', true),
('New Customer Offer', 'First time customers get free delivery', 'https://example.com/new-customer.jpg', null, false);
