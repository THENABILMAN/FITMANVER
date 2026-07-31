-- FITMAN Initial Database Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    age INTEGER,
    gender TEXT,
    height_cm NUMERIC(6,2),
    current_weight_kg NUMERIC(6,2),
    target_weight_kg NUMERIC(6,2),
    goal TEXT CHECK (goal IN ('Bulk', 'Cut', 'Maintain', 'Recomposition', 'General fitness', 'Strength', 'Endurance')),
    activity_level TEXT CHECK (activity_level IN ('Sedentary', 'Lightly active', 'Moderately active', 'Very active', 'Extremely active')),
    gym_experience TEXT CHECK (gym_experience IN ('Beginner', 'Intermediate', 'Advanced')),
    dietary_preferences TEXT,
    food_allergies TEXT,
    foods_disliked TEXT,
    injuries TEXT,
    physical_limitations TEXT,
    typical_gym_schedule TEXT,
    preferred_workout_days TEXT,
    preferred_workout_duration INTEGER,
    preferred_units TEXT DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')),
    timezone TEXT DEFAULT 'UTC',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    memory_enabled BOOLEAN DEFAULT TRUE,
    ai_response_style TEXT DEFAULT 'balanced',
    theme_preference TEXT DEFAULT 'dark',
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON profiles (LOWER(username));

-- ============================================================
-- WORKOUT PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT,
    experience_level TEXT,
    days_per_week INTEGER,
    duration_weeks INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    generated_by_ai BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    day_name TEXT NOT NULL,
    focus_area TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_day_id UUID NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    exercise_category TEXT,
    muscle_group TEXT,
    sets INTEGER DEFAULT 3,
    target_reps TEXT,
    target_weight NUMERIC(8,2),
    rest_seconds INTEGER DEFAULT 90,
    tempo TEXT,
    instructions TEXT,
    alternative_exercises TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
    workout_day_id UUID REFERENCES workout_days(id) ON DELETE SET NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In progress', 'Completed', 'Missed', 'Skipped')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    session_rating INTEGER,
    energy_level INTEGER,
    pain_or_discomfort TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE SET NULL,
    exercise_name TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    reps_completed INTEGER,
    weight_used NUMERIC(8,2),
    rpe NUMERIC(3,1),
    rir INTEGER,
    is_warmup BOOLEAN DEFAULT FALSE,
    is_personal_record BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    record_type TEXT NOT NULL,
    record_value NUMERIC(12,2) NOT NULL,
    unit TEXT,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NUTRITION
-- ============================================================
CREATE TABLE IF NOT EXISTS nutrition_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calorie_target INTEGER,
    protein_target_g INTEGER,
    carbohydrate_target_g INTEGER,
    fat_target_g INTEGER,
    fiber_target_g INTEGER,
    water_target_ml INTEGER,
    target_type TEXT DEFAULT 'daily',
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout')),
    food_name TEXT NOT NULL,
    quantity NUMERIC(8,2),
    unit TEXT,
    calories NUMERIC(8,2),
    protein_g NUMERIC(8,2),
    carbohydrates_g NUMERIC(8,2),
    fat_g NUMERIC(8,2),
    fiber_g NUMERIC(8,2),
    sugar_g NUMERIC(8,2),
    sodium_mg NUMERIC(8,2),
    image_url TEXT,
    source TEXT DEFAULT 'Manual' CHECK (source IN ('Manual', 'AI estimate', 'Recipe', 'Imported')),
    confidence_score NUMERIC(3,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    daily_calorie_target INTEGER,
    daily_protein_target INTEGER,
    generated_by_ai BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    meal_type TEXT,
    meal_name TEXT NOT NULL,
    ingredients TEXT,
    instructions TEXT,
    calories INTEGER,
    protein_g INTEGER,
    carbohydrates_g INTEGER,
    fat_g INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    ingredients TEXT,
    instructions TEXT,
    preparation_time_minutes INTEGER,
    cooking_time_minutes INTEGER,
    servings INTEGER DEFAULT 1,
    calories_per_serving INTEGER,
    protein_g INTEGER,
    carbohydrates_g INTEGER,
    fat_g INTEGER,
    dietary_tags TEXT,
    generated_by_ai BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grocery_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grocery_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    grocery_list_id UUID NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity NUMERIC(8,2),
    unit TEXT,
    category TEXT,
    is_purchased BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight_kg NUMERIC(6,2) NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    neck_cm NUMERIC(6,2),
    shoulders_cm NUMERIC(6,2),
    chest_cm NUMERIC(6,2),
    waist_cm NUMERIC(6,2),
    hips_cm NUMERIC(6,2),
    left_arm_cm NUMERIC(6,2),
    right_arm_cm NUMERIC(6,2),
    left_thigh_cm NUMERIC(6,2),
    right_thigh_cm NUMERIC(6,2),
    left_calf_cm NUMERIC(6,2),
    right_calf_cm NUMERIC(6,2),
    body_fat_percentage NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_type TEXT CHECK (photo_type IN ('Front', 'Side', 'Back', 'Other')),
    photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(6,2),
    notes TEXT,
    ai_analysis TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    video_url TEXT NOT NULL,
    analysis_status TEXT DEFAULT 'pending',
    ai_feedback TEXT,
    confidence_score NUMERIC(3,2),
    safety_warning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS & RAG
-- ============================================================
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT,
    storage_url TEXT NOT NULL,
    document_category TEXT CHECK (document_category IN ('Blood report', 'Diet plan', 'Coach program', 'Research paper', 'Medical document', 'Other')),
    processing_status TEXT DEFAULT 'pending',
    extracted_text TEXT,
    document_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES uploaded_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI COACH
-- ============================================================
CREATE TABLE IF NOT EXISTS coach_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    conversation_type TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coach_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('User', 'Assistant', 'System', 'Tool')),
    content TEXT NOT NULL,
    message_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL,
    memory_key TEXT NOT NULL,
    memory_value TEXT NOT NULL,
    importance_score NUMERIC(3,2) DEFAULT 0.5,
    source TEXT DEFAULT 'conversation',
    last_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    workouts_completed INTEGER DEFAULT 0,
    workouts_missed INTEGER DEFAULT 0,
    average_calories NUMERIC(8,2),
    average_protein_g NUMERIC(8,2),
    weight_change_kg NUMERIC(6,2),
    personal_records_count INTEGER DEFAULT 0,
    report_summary TEXT,
    recommendations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INTEGRATIONS & NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    external_account_id TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expiry TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'profiles', 'workout_plans', 'workout_days', 'workout_exercises',
        'workout_sessions', 'nutrition_targets', 'food_logs', 'meal_plans',
        'meal_plan_items', 'recipes', 'grocery_lists', 'grocery_list_items',
        'form_analysis', 'uploaded_documents', 'coach_conversations',
        'user_memories', 'calendar_integrations'
    ])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own data
DO $$
DECLARE
    tbl TEXT;
    policy_name TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'profiles', 'workout_plans', 'workout_days', 'workout_exercises',
        'workout_sessions', 'exercise_logs', 'personal_records',
        'nutrition_targets', 'food_logs', 'meal_plans', 'meal_plan_items',
        'recipes', 'grocery_lists', 'grocery_list_items', 'weight_logs',
        'body_measurements', 'progress_photos', 'form_analysis',
        'uploaded_documents', 'document_chunks', 'coach_conversations',
        'coach_messages', 'user_memories', 'weekly_reports',
        'calendar_integrations', 'notifications'
    ])
    LOOP
        policy_name := format('Users can view own %s', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', policy_name, tbl);
        EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (auth.uid() = user_id);', policy_name, tbl);

        policy_name := format('Users can insert own %s', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', policy_name, tbl);
        EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (auth.uid() = user_id);', policy_name, tbl);

        policy_name := format('Users can update own %s', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', policy_name, tbl);
        EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (auth.uid() = user_id);', policy_name, tbl);

        policy_name := format('Users can delete own %s', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', policy_name, tbl);
        EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (auth.uid() = user_id);', policy_name, tbl);
    END LOOP;
END $$;

-- Allow username lookup for login (public read of username only via service role)
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
CREATE POLICY "Service role full access profiles" ON profiles
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ============================================================
-- Buckets: avatars, progress-photos, meal-photos, form-videos, documents, coach-programs, research-papers
-- All buckets should be private with RLS policies on storage.objects
