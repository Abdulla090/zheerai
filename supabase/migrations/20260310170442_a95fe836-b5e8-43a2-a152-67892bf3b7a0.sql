
-- Allow admins to delete any question
CREATE POLICY "Admins can delete any question"
ON public.questions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete any comment
CREATE POLICY "Admins can delete any comment"
ON public.comments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete any project
CREATE POLICY "Admins can delete any project"
ON public.projects
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete any answer
CREATE POLICY "Admins can delete any answer"
ON public.answers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
