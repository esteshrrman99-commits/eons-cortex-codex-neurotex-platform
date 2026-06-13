-- EONS fake pilot records only
-- Do not use real sensitive data.

insert into public.matter_files (matter_name, entity_or_person, tax_year_or_period, issue_type, reviewer, status) values ('DEMO Matter - Fake Records Only', 'Demo Entity', '2024', 'fake evidence readiness test', 'owner_pre_review', 'draft');

-- After creating a matter, manually use the generated matter_id for related fake records if testing in SQL editor.
