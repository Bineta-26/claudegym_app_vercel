-- PulseFit sample data. Safe to run more than once: rows are matched on their unique keys.

INSERT INTO exercises (name, muscle_group, sets, reps, difficulty, rest_seconds, description) VALUES
  -- Chest
  ('Barbell Bench Press',     'Chest',  4, '6-8',     'Intermediate', 120, 'The king of upper-body pushing. Keep shoulder blades pinned and drive through your feet.'),
  ('Incline Dumbbell Press',  'Chest',  3, '8-10',    'Intermediate',  90, 'Targets the upper chest. Lower the dumbbells slowly to a deep stretch.'),
  ('Push-Ups',                'Chest',  3, '12-20',   'Beginner',      60, 'Bodyweight classic. Squeeze glutes and keep a straight line from head to heels.'),
  ('Cable Chest Fly',         'Chest',  3, '12-15',   'Beginner',      60, 'Constant tension through the full range. Hug a big tree at the top.'),
  ('Weighted Chest Dips',     'Chest',  3, '6-10',    'Advanced',      90, 'Lean forward to bias the chest. Add a belt once bodyweight gets easy.'),
  -- Back
  ('Conventional Deadlift',   'Back',   5, '3-5',     'Advanced',     180, 'Full posterior-chain builder. Brace hard and push the floor away.'),
  ('Pull-Ups',                'Back',   4, '6-10',    'Intermediate',  90, 'Pull your chest to the bar and control the way down.'),
  ('Seated Cable Row',        'Back',   3, '10-12',   'Beginner',      60, 'Sit tall and drive your elbows back. Pause and squeeze for one second.'),
  ('Barbell Bent-Over Row',   'Back',   4, '8-10',    'Intermediate',  90, 'Hinge to about 45 degrees and row the bar to your lower ribs.'),
  ('Lat Pulldown',            'Back',   3, '10-12',   'Beginner',      60, 'Great pull-up builder. Lead with the elbows and keep the chest proud.'),
  -- Legs
  ('Back Squat',              'Legs',   5, '5',       'Advanced',     180, 'Sit between your hips, knees tracking over toes, and stand up with intent.'),
  ('Romanian Deadlift',       'Legs',   4, '8-10',    'Intermediate', 120, 'Soft knees, push the hips back, and feel the hamstrings load.'),
  ('Walking Lunges',          'Legs',   3, '12/leg',  'Beginner',      60, 'Long strides with an upright torso. Grab dumbbells to progress.'),
  ('Leg Press',               'Legs',   4, '10-12',   'Beginner',      90, 'Heavy quad work with your back supported. Do not lock the knees out.'),
  ('Bulgarian Split Squat',   'Legs',   3, '8-10/leg','Intermediate',  90, 'Rear foot on a bench. Brutal, effective, and great for balance.'),
  -- Arms
  ('Barbell Curl',            'Arms',   3, '8-12',    'Beginner',      60, 'Elbows pinned to your sides. No swinging, just biceps.'),
  ('Skull Crushers',          'Arms',   3, '10-12',   'Intermediate',  60, 'Lower the EZ bar to your forehead and extend through the triceps.'),
  ('Hammer Curl',             'Arms',   3, '12',      'Beginner',      45, 'Neutral grip hits the brachialis and forearms for thicker arms.'),
  ('Close-Grip Bench Press',  'Arms',   4, '6-8',     'Advanced',      90, 'Hands shoulder-width apart for a heavy triceps overload.'),
  ('Cable Triceps Pushdown',  'Arms',   3, '12-15',   'Beginner',      45, 'Lock the elbows by your sides and squeeze hard at the bottom.'),
  -- Core
  ('Plank',                   'Core',   3, '45-60s',  'Beginner',      30, 'Brace like someone is about to poke your stomach. Breathe steadily.'),
  ('Hanging Leg Raise',       'Core',   3, '10-12',   'Intermediate',  60, 'Curl the pelvis up rather than just lifting the legs. No swinging.'),
  ('Ab Wheel Rollout',        'Core',   3, '8-10',    'Advanced',      60, 'Roll out only as far as you can keep a flat back.'),
  ('Russian Twist',           'Core',   3, '20',      'Beginner',      30, 'Rotate from the ribcage. Hold a plate to make it harder.'),
  ('Cable Woodchopper',       'Core',   3, '12/side', 'Intermediate',  45, 'Anti-rotation power. Pivot the back foot and keep the arms long.'),
  -- Cardio
  ('Rowing Intervals',        'Cardio', 6, '500m',    'Intermediate',  90, 'Legs, then body, then arms. Aim for a steady split you can hold.'),
  ('Assault Bike Sprints',    'Cardio', 8, '20s',     'Advanced',      40, 'All-out effort. The bike gets harder the harder you push.'),
  ('Jump Rope',               'Cardio', 5, '2 min',   'Beginner',      30, 'Light on the balls of your feet with small, quick jumps.'),
  ('Treadmill Incline Walk',  'Cardio', 1, '20 min',  'Beginner',       0, 'Low-impact fat burner. Set a 10-12% incline at a brisk pace.'),
  ('Burpees',                 'Cardio', 5, '12',      'Intermediate',  45, 'Chest to floor, explode up. A full-body heart-rate spike.')
ON CONFLICT (name) DO UPDATE SET
  muscle_group = EXCLUDED.muscle_group,
  sets         = EXCLUDED.sets,
  reps         = EXCLUDED.reps,
  difficulty   = EXCLUDED.difficulty,
  rest_seconds = EXCLUDED.rest_seconds,
  description  = EXCLUDED.description;

-- 10 classes spread across the current week (Monday = start of week).
INSERT INTO classes (title, class_type, coach_name, start_time, duration_minutes, capacity, intensity)
SELECT c.title, c.class_type, c.coach_name, date_trunc('week', now()) + c.offset_time, c.duration_minutes, c.capacity, c.intensity
FROM (VALUES
  ('Sunrise Spin',        'Spin',     'Maya Chen',     interval '0 days 07:00',  45, 20, 'High'),
  ('Lunch Break HIIT',    'HIIT',     'Jordan Blake',  interval '0 days 12:30',  30, 16, 'High'),
  ('Flow & Restore Yoga', 'Yoga',     'Priya Nair',    interval '1 days 18:30',  60, 18, 'Low'),
  ('Knockout Boxing',     'Boxing',   'Marcus Reid',   interval '1 days 06:30',  50, 14, 'High'),
  ('Strength Foundations','Strength', 'Sofia Alvarez', interval '2 days 17:30',  55, 12, 'Medium'),
  ('Tabata Inferno',      'HIIT',     'Jordan Blake',  interval '3 days 18:00',  40, 16, 'High'),
  ('Climb Club Spin',     'Spin',     'Leo Santos',    interval '3 days 19:30',  50, 20, 'Medium'),
  ('Power Vinyasa',       'Yoga',     'Priya Nair',    interval '4 days 07:00',  60, 18, 'Medium'),
  ('Weekend Fight Camp',  'Boxing',   'Marcus Reid',   interval '5 days 09:00',  60, 14, 'High'),
  ('Sunday Mobility',     'Yoga',     'Hana Okafor',   interval '6 days 10:00',  45, 20, 'Low')
) AS c(title, class_type, coach_name, offset_time, duration_minutes, capacity, intensity)
ON CONFLICT (title, start_time) DO NOTHING;
