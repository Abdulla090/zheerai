
-- Allow authors to delete their own questions
CREATE POLICY "Authors can delete own questions"
ON public.questions
FOR DELETE
TO public
USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = questions.author_id));

-- Allow authors to delete their own answers
CREATE POLICY "Authors can delete own answers"
ON public.answers
FOR DELETE
TO public
USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = answers.author_id));
