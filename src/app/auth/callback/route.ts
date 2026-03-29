import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  if (token_hash && type) {
    // Email confirmation via token hash (magic link / email verify)
    await supabase.auth.verifyOtp({ token_hash, type: type as any });
  } else if (code) {
    // OAuth or PKCE code exchange
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard after verification
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
