-- Create storage buckets for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- Create profiles table for users (both doctors and patients)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('doctor', 'patient')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical specialties table
CREATE TABLE public.medical_specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(state, city, area)
);

-- Create doctor profiles table
CREATE TABLE public.doctor_profiles (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  license_number TEXT NOT NULL UNIQUE,
  specialty_id UUID REFERENCES public.medical_specialties(id),
  sub_specialty TEXT,
  years_of_experience INTEGER NOT NULL DEFAULT 0,
  consultation_fee DECIMAL(10,2) NOT NULL,
  location_id UUID REFERENCES public.locations(id),
  hospital_clinic_name TEXT,
  address TEXT NOT NULL,
  
  -- Service options
  home_visits BOOLEAN NOT NULL DEFAULT false,
  phone_consultation BOOLEAN NOT NULL DEFAULT true,
  emergency_calls BOOLEAN NOT NULL DEFAULT false,
  
  -- Working hours
  working_hours JSONB, -- {monday: {start: "09:00", end: "17:00", available: true}, ...}
  
  -- Social media (optional)
  facebook_url TEXT,
  instagram_url TEXT,
  
  -- Professional info
  bio TEXT,
  education TEXT,
  certifications TEXT[],
  languages TEXT[] DEFAULT ARRAY['English'],
  
  -- Status
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient profiles table
CREATE TABLE public.patient_profiles (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT,
  location_id UUID REFERENCES public.locations(id),
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT,
  allergies TEXT[],
  current_medications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id),
  doctor_id UUID NOT NULL REFERENCES public.profiles(id),
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('phone', 'video', 'in_person', 'home_visit')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  consultation_fee DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_reference TEXT,
  notes TEXT,
  prescription TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id),
  doctor_id UUID NOT NULL REFERENCES public.profiles(id),
  consultation_id UUID REFERENCES public.consultations(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, doctor_id, consultation_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for medical specialties (public read)
CREATE POLICY "Anyone can view medical specialties" ON public.medical_specialties FOR SELECT USING (true);

-- RLS Policies for locations (public read)
CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT USING (true);

-- RLS Policies for doctor profiles
CREATE POLICY "Anyone can view verified doctor profiles" ON public.doctor_profiles FOR SELECT USING (is_verified = true);
CREATE POLICY "Doctors can update their own profile" ON public.doctor_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors can insert their own profile" ON public.doctor_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for patient profiles
CREATE POLICY "Patients can view their own profile" ON public.patient_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Doctors can view patient profiles for their consultations" ON public.patient_profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.consultations 
    WHERE consultations.patient_id = patient_profiles.id 
    AND consultations.doctor_id = auth.uid()
  )
);
CREATE POLICY "Patients can update their own profile" ON public.patient_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Patients can insert their own profile" ON public.patient_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for consultations
CREATE POLICY "Users can view their own consultations" ON public.consultations FOR SELECT USING (
  auth.uid() = patient_id OR auth.uid() = doctor_id
);
CREATE POLICY "Patients can create consultations" ON public.consultations FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update their own consultations" ON public.consultations FOR UPDATE USING (
  auth.uid() = patient_id OR auth.uid() = doctor_id
);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Patients can create reviews for their consultations" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = patient_id AND 
  EXISTS (
    SELECT 1 FROM public.consultations 
    WHERE consultations.id = reviews.consultation_id 
    AND consultations.patient_id = auth.uid()
    AND consultations.status = 'completed'
  )
);

-- Storage policies for profile pictures
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'profile-pictures');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON public.doctor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON public.patient_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, first_name, last_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'patient'),
    COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    new.email
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some sample medical specialties
INSERT INTO public.medical_specialties (name, description) VALUES
('General Practice', 'Primary healthcare and general medical services'),
('Cardiology', 'Heart and cardiovascular system specialist'),
('Dermatology', 'Skin, hair, and nail conditions'),
('Pediatrics', 'Medical care for infants, children, and adolescents'),
('Gynecology', 'Women''s reproductive health'),
('Orthopedics', 'Musculoskeletal system disorders'),
('Psychiatry', 'Mental health and psychiatric disorders'),
('Ophthalmology', 'Eye and vision care'),
('ENT (Otolaryngology)', 'Ear, nose, and throat specialist'),
('Radiology', 'Medical imaging and diagnostics'),
('Laboratory Medicine', 'Medical laboratory testing and analysis'),
('Emergency Medicine', '24/7 emergency medical care'),
('Internal Medicine', 'Adult internal organ systems'),
('Surgery', 'Surgical procedures and operations'),
('Anesthesiology', 'Anesthesia and pain management');

-- Insert sample Nigerian locations
INSERT INTO public.locations (state, city, area) VALUES
('Lagos', 'Lagos Island', 'Victoria Island'),
('Lagos', 'Lagos Island', 'Ikoyi'),
('Lagos', 'Lagos Mainland', 'Ikeja'),
('Lagos', 'Lagos Mainland', 'Surulere'),
('Lagos', 'Lagos Mainland', 'Yaba'),
('Abuja', 'Abuja Municipal', 'Garki'),
('Abuja', 'Abuja Municipal', 'Wuse'),
('Abuja', 'Abuja Municipal', 'Maitama'),
('Rivers', 'Port Harcourt', 'GRA'),
('Rivers', 'Port Harcourt', 'Diobu'),
('Kano', 'Kano Municipal', 'Sabon Gari'),
('Oyo', 'Ibadan', 'Bodija'),
('Oyo', 'Ibadan', 'Ring Road'),
('Kaduna', 'Kaduna North', 'Tudun Wada'),
('Enugu', 'Enugu East', 'Independence Layout');