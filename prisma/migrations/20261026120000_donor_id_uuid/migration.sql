-- Donor ids are now uuid(). Convert existing cuid ids; contact_reveals.donor_id follows via ON UPDATE CASCADE.
UPDATE "donors"
SET "id" = gen_random_uuid()::text
WHERE "id" !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
