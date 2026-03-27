
-- Create jewel_choices table
create table if not exists public.jewel_choices (
    id uuid not null default gen_random_uuid(),
    user_email text not null,
    matricula text not null,
    jewel_name text not null,
    created_at timestamp with time zone not null default now(),
    constraint jewel_choices_pkey primary key (id)
);

-- Enable RLS
alter table public.jewel_choices enable row level security;

-- Create policies
create policy "Enable insert for authenticated users and anon" 
on public.jewel_choices for insert 
with check (true);

create policy "Enable select for authenticated users and anon" 
on public.jewel_choices for select 
using (true);
