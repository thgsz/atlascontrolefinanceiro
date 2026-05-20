-- Fix function search path for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Insert default categories for new user
  INSERT INTO public.categories (user_id, name, icon, color, is_default) VALUES
    (NEW.id, 'Alimentação', 'utensils', '#f97316', true),
    (NEW.id, 'Transporte', 'car', '#3b82f6', true),
    (NEW.id, 'Moradia', 'home', '#8b5cf6', true),
    (NEW.id, 'Saúde', 'heart', '#ef4444', true),
    (NEW.id, 'Lazer', 'gamepad', '#22c55e', true),
    (NEW.id, 'Educação', 'graduation-cap', '#eab308', true),
    (NEW.id, 'Outros', 'circle', '#6b7280', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;