-- Designed to Elevate — Client Hub
-- Seed: the 4 founding clients.

insert into public.clients (slug, business_name, primary_contact_email, site_url)
values
  ('fitchin',        'Fitchin Auto Detail & Tint', 'ericfitch2011@yahoo.com',                 'https://fitchindetailingandtint.com'),
  ('modern-classic', 'Modern Classic Barbershop',  'modernclassicbarbershop@protonmail.com',  'https://modernclassicbarbershop.com'),
  ('all-transport',  'All Transport Bus Co LLC',   'alltransportbuscollc@gmail.com',          'https://www.alltransportbusco.com'),
  ('dte-test',       'Designed to Elevate (Test)', 'bilsonxnc@gmail.com',                     'https://designedtoelevate.co')
on conflict (slug) do nothing;