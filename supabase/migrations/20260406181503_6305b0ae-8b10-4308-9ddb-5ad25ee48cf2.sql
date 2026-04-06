-- Restrict votes SELECT to only the user's own votes
DROP POLICY IF EXISTS "Votes viewable by everyone" ON public.votes;

CREATE POLICY "Users can read own votes"
  ON public.votes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);