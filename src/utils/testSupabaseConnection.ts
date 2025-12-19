// Quick utility to test Supabase connection
// You can call this from the browser console: window.testSupabase()

import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can query projects table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    if (projectsError) {
      console.error('❌ Projects table error:', projectsError.message);
      if (projectsError.message.includes('relation') || projectsError.message.includes('does not exist')) {
        console.error('💡 Tip: Run the SQL migration in Supabase SQL Editor!');
        console.error('   File: supabase/migrations/001_initial_schema.sql');
      }
      return false;
    }
    
    console.log('✅ Projects table accessible');
    
    // Test 2: Check testimonials
    const { data: testimonials, error: testimonialsError } = await supabase
      .from('testimonials')
      .select('count')
      .limit(1);
    
    if (testimonialsError) {
      console.error('❌ Testimonials table error:', testimonialsError.message);
      return false;
    }
    
    console.log('✅ Testimonials table accessible');
    
    // Test 3: Check metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('metrics')
      .select('count')
      .limit(1);
    
    if (metricsError) {
      console.error('❌ Metrics table error:', metricsError.message);
      return false;
    }
    
    console.log('✅ Metrics table accessible');
    console.log('🎉 All Supabase tables are accessible!');
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection;
}



