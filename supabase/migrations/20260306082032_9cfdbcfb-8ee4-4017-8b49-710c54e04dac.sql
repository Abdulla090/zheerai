-- Remove answer-based content/data as requested
DELETE FROM public.comments WHERE target_type = 'answer';
DELETE FROM public.votes WHERE voteable_type = 'answer';
DELETE FROM public.answers;

-- Keep question counters consistent after removing answers
UPDATE public.questions SET answers_count = 0;

-- Rebuild votes count trigger logic so vote counts update correctly
CREATE OR REPLACE FUNCTION public.update_votes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  old_delta integer := 0;
  new_delta integer := 0;
BEGIN
  IF TG_OP = 'INSERT' THEN
    new_delta := CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE -1 END;

    IF NEW.voteable_type = 'question' THEN
      UPDATE public.questions
      SET votes_count = GREATEST(votes_count + new_delta, 0)
      WHERE id = NEW.voteable_id;
    ELSIF NEW.voteable_type = 'answer' THEN
      UPDATE public.answers
      SET votes_count = GREATEST(votes_count + new_delta, 0)
      WHERE id = NEW.voteable_id;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    old_delta := CASE WHEN OLD.vote_type = 'upvote' THEN 1 ELSE -1 END;

    IF OLD.voteable_type = 'question' THEN
      UPDATE public.questions
      SET votes_count = GREATEST(votes_count - old_delta, 0)
      WHERE id = OLD.voteable_id;
    ELSIF OLD.voteable_type = 'answer' THEN
      UPDATE public.answers
      SET votes_count = GREATEST(votes_count - old_delta, 0)
      WHERE id = OLD.voteable_id;
    END IF;

    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_delta := CASE WHEN OLD.vote_type = 'upvote' THEN 1 ELSE -1 END;
    new_delta := CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE -1 END;

    IF OLD.voteable_type = 'question' THEN
      UPDATE public.questions
      SET votes_count = GREATEST(votes_count - old_delta, 0)
      WHERE id = OLD.voteable_id;
    ELSIF OLD.voteable_type = 'answer' THEN
      UPDATE public.answers
      SET votes_count = GREATEST(votes_count - old_delta, 0)
      WHERE id = OLD.voteable_id;
    END IF;

    IF NEW.voteable_type = 'question' THEN
      UPDATE public.questions
      SET votes_count = GREATEST(votes_count + new_delta, 0)
      WHERE id = NEW.voteable_id;
    ELSIF NEW.voteable_type = 'answer' THEN
      UPDATE public.answers
      SET votes_count = GREATEST(votes_count + new_delta, 0)
      WHERE id = NEW.voteable_id;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_votes_count ON public.votes;

CREATE TRIGGER trg_update_votes_count
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_votes_count();

-- Backfill current question vote counters from existing votes table
UPDATE public.questions q
SET votes_count = COALESCE(v.vote_total, 0)
FROM (
  SELECT voteable_id, SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE -1 END) AS vote_total
  FROM public.votes
  WHERE voteable_type = 'question'
  GROUP BY voteable_id
) v
WHERE q.id = v.voteable_id;

UPDATE public.questions q
SET votes_count = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM public.votes v
  WHERE v.voteable_type = 'question'
    AND v.voteable_id = q.id
);