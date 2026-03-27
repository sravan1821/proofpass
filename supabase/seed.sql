insert into events (name, slug, venue, start_date, end_date, status)
values ('HackFusion 2026', 'hackfusion-2026', 'JNTUH Innovation Hall', '2026-03-12', '2026-03-14', 'active')
on conflict (slug) do nothing;
