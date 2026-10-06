DROP POLICY IF EXISTS storage_objects_owner_select ON storage.objects;
DROP POLICY IF EXISTS storage_objects_owner_insert ON storage.objects;
DROP POLICY IF EXISTS storage_objects_owner_update ON storage.objects;
DROP POLICY IF EXISTS storage_objects_owner_delete ON storage.objects;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY resumes_owner_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket = 'resumes' AND uploaded_by = (SELECT auth.jwt() ->> 'sub'));

CREATE POLICY resumes_owner_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket = 'resumes' AND uploaded_by = (SELECT auth.jwt() ->> 'sub'));

CREATE POLICY resumes_owner_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket = 'resumes' AND uploaded_by = (SELECT auth.jwt() ->> 'sub'))
  WITH CHECK (bucket = 'resumes' AND uploaded_by = (SELECT auth.jwt() ->> 'sub'));

CREATE POLICY resumes_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket = 'resumes' AND uploaded_by = (SELECT auth.jwt() ->> 'sub'));

GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
