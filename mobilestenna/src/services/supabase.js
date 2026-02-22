import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const url = SUPABASE_URL || 'https://jatwtohvdfvundhoigox.supabase.co';
const key = SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdHd0b2h2ZGZ2dW5kaG9pZ294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjY5ODAsImV4cCI6MjA4NjQwMjk4MH0.XYCmwngWmQpG2cUIk342E5xQEkIeIkJlWRlCH-R_3Sw';

export const supabase = createClient(url, key);
