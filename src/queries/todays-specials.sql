-- Create todays_specials table
CREATE TABLE IF NOT EXISTS todays_specials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_veg BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_todays_specials_is_active ON todays_specials(is_active);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_todays_specials_category ON todays_specials(category);

-- Create index on is_veg for filtering
CREATE INDEX IF NOT EXISTS idx_todays_specials_is_veg ON todays_specials(is_veg);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_todays_specials_created_at ON todays_specials(created_at DESC);

-- Sample data for testing (optional)
INSERT INTO todays_specials (name, description, price, image, category, is_veg, is_active) VALUES
('Butter Chicken Special', 'Creamy butter chicken with basmati rice and naan', 18.99, 'https://example.com/butter-chicken.jpg', 'Main Course', false, true),
('Paneer Makhani', 'Rich and creamy paneer curry with rice', 16.99, 'https://example.com/paneer-makhani.jpg', 'Main Course', true, true),
('Biryani Deluxe', 'Aromatic basmati rice with tender meat and spices', 22.99, 'https://example.com/biryani.jpg', 'Rice', false, true),
('Vegetable Korma', 'Mixed vegetables in coconut curry sauce', 15.99, 'https://example.com/veg-korma.jpg', 'Main Course', true, false);
