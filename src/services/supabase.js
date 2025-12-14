import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xpouaiynushylsjpnklc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwb3VhaXludXNoeWxzanBua2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDk1MzksImV4cCI6MjA4MTEyNTUzOX0.arKmFMLAdrZsCN_VL3trL0rFnX8W8ECN_dRktq0ZWwI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
