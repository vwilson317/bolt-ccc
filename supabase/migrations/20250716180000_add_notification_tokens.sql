-- Migration: Add notification_tokens table for session-based push notifications
create table if not exists notification_tokens (
  session_id uuid primary key,
  fcm_token text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
); 