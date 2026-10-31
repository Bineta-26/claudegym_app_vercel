// Realistic mock data for PulseFit. Swap these exports for API calls later.

export const user = {
  name: 'Alex Rivera',
  handle: '@alexlifts',
  initials: 'AR',
  membership: 'Pulse Elite',
  memberSince: 'March 2024',
  level: 18,
  xp: 7420,
  xpNext: 9000,
  streak: 12,
  bestStreak: 31,
}

export const strengthHistory = [
  { month: 'Apr', bench: 62, squat: 85, deadlift: 110 },
  { month: 'May', bench: 65, squat: 90, deadlift: 117 },
  { month: 'Jun', bench: 67, squat: 95, deadlift: 122 },
  { month: 'Jul', bench: 70, squat: 100, deadlift: 130 },
  { month: 'Aug', bench: 72, squat: 102, deadlift: 135 },
  { month: 'Sep', bench: 77, squat: 110, deadlift: 142 },
  { month: 'Oct', bench: 82, squat: 117, deadlift: 150 },
]

export const personalRecords = [
  { lift: 'Deadlift', value: '150 kg', date: 'Oct 12', delta: '+8 kg', tier: 'gold' },
  { lift: 'Back Squat', value: '117 kg', date: 'Oct 9', delta: '+7 kg', tier: 'gold' },
  { lift: 'Bench Press', value: '82 kg', date: 'Oct 14', delta: '+5 kg', tier: 'silver' },
  { lift: 'Pull-Ups', value: '14 reps', date: 'Sep 28', delta: '+2 reps', tier: 'silver' },
  { lift: '5K Run', value: '22:41', date: 'Sep 20', delta: '-0:48', tier: 'bronze' },
  { lift: 'Plank', value: '3:30', date: 'Aug 30', delta: '+0:40', tier: 'bronze' },
]

export const classTypes = {
  Yoga: { color: '#a78bfa' },
  HIIT: { color: '#ff5fa2' },
  Spin: { color: '#22e4ff' },
  Boxing: { color: '#ff9f43' },
}

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const classSchedule = [
  { id: 'c1', day: 'Mon', time: '07:00', type: 'Spin', title: 'Sunrise Ride', coach: 'Maya Chen', duration: 45, spots: 4, capacity: 20 },
  { id: 'c2', day: 'Mon', time: '12:30', type: 'HIIT', title: 'Lunch Burn', coach: 'Jordan Blake', duration: 30, spots: 9, capacity: 16 },
  { id: 'c3', day: 'Mon', time: '18:30', type: 'Yoga', title: 'Flow & Restore', coach: 'Priya Nair', duration: 60, spots: 0, capacity: 18 },
  { id: 'c4', day: 'Tue', time: '06:30', type: 'Boxing', title: 'Knockout Basics', coach: 'Marcus Reid', duration: 50, spots: 6, capacity: 14 },
  { id: 'c5', day: 'Tue', time: '19:00', type: 'Spin', title: 'Rhythm Ride', coach: 'Maya Chen', duration: 45, spots: 2, capacity: 20 },
  { id: 'c6', day: 'Wed', time: '07:00', type: 'Yoga', title: 'Power Vinyasa', coach: 'Priya Nair', duration: 60, spots: 11, capacity: 18 },
  { id: 'c7', day: 'Wed', time: '18:00', type: 'HIIT', title: 'Tabata Inferno', coach: 'Jordan Blake', duration: 40, spots: 3, capacity: 16 },
  { id: 'c8', day: 'Thu', time: '12:00', type: 'Boxing', title: 'Bag Work Blitz', coach: 'Marcus Reid', duration: 45, spots: 8, capacity: 14 },
  { id: 'c9', day: 'Thu', time: '19:30', type: 'Spin', title: 'Climb Club', coach: 'Leo Santos', duration: 50, spots: 12, capacity: 20 },
  { id: 'c10', day: 'Fri', time: '07:00', type: 'HIIT', title: 'Friday Fire', coach: 'Jordan Blake', duration: 30, spots: 1, capacity: 16 },
  { id: 'c11', day: 'Fri', time: '17:30', type: 'Yoga', title: 'Yin & Unwind', coach: 'Priya Nair', duration: 60, spots: 7, capacity: 18 },
  { id: 'c12', day: 'Sat', time: '09:00', type: 'Boxing', title: 'Fight Camp', coach: 'Marcus Reid', duration: 60, spots: 5, capacity: 14 },
  { id: 'c13', day: 'Sat', time: '10:30', type: 'Spin', title: 'Weekend Warriors', coach: 'Leo Santos', duration: 45, spots: 10, capacity: 20 },
  { id: 'c14', day: 'Sun', time: '10:00', type: 'Yoga', title: 'Sunday Stretch', coach: 'Priya Nair', duration: 50, spots: 14, capacity: 18 },
]

export const achievements = [
  { id: 'a1', title: 'First Rep', desc: 'Completed your first workout', icon: 'Dumbbell', unlocked: true },
  { id: 'a2', title: 'On Fire', desc: '7-day workout streak', icon: 'Flame', unlocked: true },
  { id: 'a3', title: 'Century Club', desc: '100 workouts completed', icon: 'Trophy', unlocked: true },
  { id: 'a4', title: 'Early Bird', desc: '10 workouts before 7am', icon: 'Timer', unlocked: true },
  { id: 'a5', title: 'Class Act', desc: 'Attended 25 group classes', icon: 'CalendarCheck', unlocked: true },
  { id: 'a6', title: 'Iron Will', desc: '30-day workout streak', icon: 'Zap', unlocked: false },
  { id: 'a7', title: 'Double Bodyweight', desc: 'Deadlift 2x your bodyweight', icon: 'Medal', unlocked: false },
  { id: 'a8', title: 'Marathoner', desc: 'Log 42 km of cardio in a month', icon: 'Footprints', unlocked: false },
]

export const profileStats = [
  { label: 'Workouts', value: 186 },
  { label: 'Hours trained', value: 142 },
  { label: 'PRs set', value: 23 },
  { label: 'Classes', value: 31 },
]

export const quotes = [
  { text: "The only bad workout is the one that didn't happen.", author: 'Unknown' },
  { text: 'Strength does not come from the body. It comes from the will.', author: 'Gandhi' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: "Success isn't always about greatness. It's about consistency.", author: 'Dwayne Johnson' },
  { text: "Take care of your body. It's the only place you have to live.", author: 'Jim Rohn' },
  { text: "You don't have to be extreme, just consistent.", author: 'Unknown' },
  { text: 'Every rep is a vote for the person you want to become.', author: 'PulseFit Coaches' },
]
