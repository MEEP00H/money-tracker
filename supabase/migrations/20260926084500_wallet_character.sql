-- Optional mascot character image for a wallet, shown instead of the plain emoji icon
-- on the wallet card and edit modal where there's room for it.
alter table public.wallets add column character_url text;
