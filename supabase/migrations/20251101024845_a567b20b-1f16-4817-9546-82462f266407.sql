-- Temporary permissive RLS for prototype (remove for production)
-- INSERT must use WITH CHECK only

-- Sessions: allow insert/select/update by anyone
create policy "prototype_sessions_insert"
  on public.multiplications_app_learning_sessions
  for insert
  with check (true);

create policy "prototype_sessions_select"
  on public.multiplications_app_learning_sessions
  for select
  using (true);

create policy "prototype_sessions_update"
  on public.multiplications_app_learning_sessions
  for update
  using (true)
  with check (true);

-- Question attempts: allow insert by anyone
create policy "prototype_attempts_insert"
  on public.multiplications_app_question_attempts
  for insert
  with check (true);