-- Create Checkins Table
create table checkins (
  id uuid default uuid_generate_v4() primary key,
  user_name text not null,
  user_email text,
  matricula text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Word Cloud Table
create table word_cloud (
  id uuid default uuid_generate_v4() primary key,
  text text not null,
  approved boolean default false, -- For moderation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Evaluations Table
create table evaluations (
  id uuid default uuid_generate_v4() primary key,
  rating_general integer not null,
  best_moment text,
  improvements text,
  team_energy text,
  phrase_completion text,
  user_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) - Optional but recommended
alter table checkins enable row level security;
alter table word_cloud enable row level security;
alter table evaluations enable row level security;

-- Create Policies (Public access for demo purposes, adjust for production)
create policy "Enable insert for all users" on checkins for insert with check (true);
create policy "Enable read for all users" on checkins for select using (true);

create policy "Enable insert for all users" on word_cloud for insert with check (true);
create policy "Enable read for all users" on word_cloud for select using (true);
create policy "Enable update for all users" on word_cloud for update using (true);
create policy "Enable delete for all users" on word_cloud for delete using (true);

create policy "Enable insert for all users" on evaluations for insert with check (true);
create policy "Enable read for all users" on evaluations for select using (true);
