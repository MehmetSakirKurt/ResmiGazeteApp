-- Resmi Gazete Uygulaması Veritabanı Şeması

-- Kullanıcılar tablosu
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    company_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı tercihleri tablosu
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_preferences JSONB DEFAULT '{}',
    font_size_scale FLOAT DEFAULT 1.0,
    dark_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı cihazları tablosu (bildirimler için)
CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_token TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT DEFAULT 'android',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_token)
);

-- Kategoriler tablosu
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yayınlar tablosu
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    content TEXT NOT NULL,
    url TEXT NOT NULL,
    category_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı favorileri tablosu
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, publication_id)
);

-- Kategori abonelikleri tablosu
CREATE TABLE user_category_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);

-- Bildirimler tablosu
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    publication_id UUID REFERENCES publications(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Sohbet geçmişi tablosu
CREATE TABLE chat_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chat_id TEXT NOT NULL,
    last_question TEXT,
    last_response TEXT,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chat_id)
);

-- İndeksler
CREATE INDEX idx_publications_publication_date ON publications(publication_date);
CREATE INDEX idx_publications_category_ids ON publications USING GIN(category_ids);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_category_subscriptions_user_id ON user_category_subscriptions(user_id);
CREATE INDEX idx_user_category_subscriptions_category_id ON user_category_subscriptions(category_id);

-- Örnek kategoriler
INSERT INTO categories (name, description, icon, color) VALUES
('Kanunlar', 'Yasama organı tarafından çıkarılan yasal düzenlemeler', 'gavel', '#4285F4'),
('Kararnameler', 'Yürütme organı tarafından çıkarılan düzenlemeler', 'description', '#DB4437'),
('Yönetmelikler', 'Bakanlıklar ve kamu tüzel kişileri tarafından çıkarılan düzenlemeler', 'rule', '#F4B400'),
('Tebliğler', 'Bakanlıklar tarafından yayımlanan duyurular', 'campaign', '#0F9D58'),
('İlanlar', 'Resmi ilanlar ve duyurular', 'announcement', '#9C27B0'),
('Atamalar', 'Kamu görevlilerine ilişkin atama kararları', 'person', '#FF6D00'),
('Ekonomi', 'Ekonomik düzenlemeler ve kararlar', 'trending_up', '#00BCD4'),
('Eğitim', 'Eğitim ile ilgili düzenlemeler', 'school', '#795548'),
('Sağlık', 'Sağlık ile ilgili düzenlemeler', 'local_hospital', '#E91E63'),
('Çevre', 'Çevre ile ilgili düzenlemeler', 'nature', '#4CAF50');

-- Örnek admin kullanıcısı (şifre: admin123)
INSERT INTO users (email, hashed_password, is_superuser) VALUES
('admin@resmigazete.gov.tr', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', TRUE);
