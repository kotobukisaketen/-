-- Customers Table
create table public.customers (
  id uuid2 default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customers(id) on delete cascade not null,
  name text not null,
  volume text default '-'::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) Policies
-- For simplicity in this prototype, we allow public read/write access.
-- In production, you should enable RLS and refine policies.

alter table public.customers enable row level security;
alter table public.products enable row level security;

create policy "Enable read access for all users" on public.customers for select using (true);
create policy "Enable insert access for all users" on public.customers for insert with check (true);
create policy "Enable update access for all users" on public.customers for update using (true);
create policy "Enable delete access for all users" on public.customers for delete using (true);

create policy "Enable read access for all users" on public.products for select using (true);
create policy "Enable insert access for all users" on public.products for insert with check (true);
create policy "Enable update access for all users" on public.products for update using (true);
create policy "Enable delete access for all users" on public.products for delete using (true);

-- Insert Sample Data (Optional)
insert into public.customers (name) values 
('田中酒店'),
('鈴木居酒屋'),
('山田レストラン');

-- Note: You'll need to get the generated UUIDs from customers table to insert products linked to them correctly.
