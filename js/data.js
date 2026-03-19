// ===== DATA LAYER =====
const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem('yf_' + k) || 'null'); } catch(e) { return null; } },
  set: (k, v) => { try { localStorage.setItem('yf_' + k, JSON.stringify(v)); } catch(e) { console.warn('Storage error:', e); } },
  del: (k) => localStorage.removeItem('yf_' + k)
};

let settings = DB.get('settings') || { name: 'Yash', age: 21, height: 180, startWeight: 86, startBF: 26, targetWeight: 74, startDate: new Date().toISOString().split('T')[0] };
let logs = DB.get('logs') || [];
let mealRatings = DB.get('mealRatings') || {};   // { mealId: { rating, altIdx } }
let calLogs = DB.get('calLogs') || [];            // [{ date, items:[{name,kcal,protein,qty}] }]

// ===== PLAN DATA =====
const planWeeks = [
  [1,'Phase 1',3,4,'20 min','2 km','8–9 min/km','1 min jog / 2 min walk × 6 — very easy'],
  [2,'Phase 1',3,4,'22 min','2.5 km','8–9 min/km','1.5 min jog / 2 min walk × 6'],
  [3,'Phase 1',3,4,'25 min','3 km','8 min/km','2 min jog / 1.5 min walk × 7'],
  [4,'Phase 1',3,4,'28 min','3.5 km','7:30 min/km','3 min jog / 1 min walk × 7'],
  [5,'Phase 1',3,4,'30 min','4 km','7:30 min/km','5 min jog / 1 min walk'],
  [6,'Phase 1',3,4,'30 min','4.5 km','7:15 min/km','8 min jog / 1 min walk'],
  [7,'Phase 1',3,4,'30 min','4.5 km','7 min/km','Try 15 min continuous jog'],
  [8,'Phase 1',3,4,'30 min','5 km','7 min/km','Full 30 min run — no walk breaks'],
  [9,'Phase 2',4,3,'35 min','5 km','7 min/km','Add 4th run day (easy pace)'],
  [10,'Phase 2',4,3,'35 min','5.5 km','6:45 min/km','1 session = long easy run'],
  [11,'Phase 2',4,3,'38 min','6 km','6:30 min/km','Long run → 8 km'],
  [12,'Phase 2',4,3,'40 min','6.5 km','6:30 min/km','Easy week — cut volume 20%'],
  [13,'Phase 2',4,3,'40 min','6.5 km','6:15 min/km','Introduce pace runs (2 km fast)'],
  [14,'Phase 2',4,3,'42 min','7 km','6:15 min/km','Long run → 9 km'],
  [15,'Phase 2',4,3,'42 min','7.5 km','6:10 min/km','Maintain + breathing rhythm focus'],
  [16,'Phase 2',4,3,'45 min','8 km','6 min/km','Easy week — reduce 20%'],
  [17,'Phase 3',4,3,'45 min','8 km','6 min/km','Add 1 interval session per week'],
  [18,'Phase 3',4,3,'48 min','8.5 km','5:50 min/km','6×400m fast + 200m jog recovery'],
  [19,'Phase 3',4,3,'50 min','9 km','5:45 min/km','Long run → 12 km (slow pace)'],
  [20,'Phase 3',4,3,'50 min','9 km','5:45 min/km','Easy week — reduce 20%'],
  [21,'Phase 3',4,3,'50 min','9.5 km','5:40 min/km','2 quality runs + 2 easy runs'],
  [22,'Phase 3',4,3,'52 min','10 km','5:30 min/km','10 km milestone — celebrate!'],
  [23,'Phase 3',4,3,'52 min','10 km','5:30 min/km','Maintain 10 km base'],
  [24,'Phase 3',4,3,'55 min','11 km','5:20 min/km','Easy week + full body check'],
  [25,'Phase 4',5,2,'55 min','11 km','5:15 min/km','Optional 5th day (very easy)'],
  [26,'Phase 4',5,2,'55 min','12 km','5:10 min/km','Tempo run 20 min × 1 per week'],
  [27,'Phase 4',5,2,'58 min','12 km','5:10 min/km','Long run → 15 km'],
  [28,'Phase 4',4,3,'55 min','11 km','5:15 min/km','Easy week — taper slightly'],
  [29,'Phase 4',5,2,'58 min','12 km','5:05 min/km','Push tempo work harder'],
  [30,'Phase 4',5,2,'60 min','13 km','5 min/km','Strongest week of entire plan'],
  [31,'Phase 4',4,3,'55 min','11 km','5:10 min/km','Taper — reduce volume 25%'],
  [32,'Phase 4',3,4,'45 min','8 km','Easy','Final week — target: 74 kg achieved'],
];

const milestoneTargets = [
  { period: 'Month 1–2', targetMonth: 2, target: 84 },
  { period: 'Month 3–4', targetMonth: 4, target: 81 },
  { period: 'Month 5–6', targetMonth: 6, target: 78 },
  { period: 'Month 7–8', targetMonth: 8, target: 74 },
];

// ===== DYNAMIC MEAL PLAN DATA =====
const mealPlanData = {
  runDay: [
    { id:'rd-morning', time:'6:00 AM', label:'Morning Ritual', fixed:true, options:[
      { food:'Jeera water (warm) + 4 soaked almonds + 2 walnuts', kcal:60, protein:2 }
    ]},
    { id:'rd-prerun', time:'6:15 AM', label:'Pre-Run Fuel', fixed:true, options:[
      { food:'1 banana', kcal:90, protein:1 }
    ]},
    { id:'rd-postrun', time:'6:45 AM', label:'Post-Run Hydration', fixed:true, options:[
      { food:'Nimbu paani (lemon + water + pinch salt)', kcal:10, protein:0 }
    ]},
    { id:'rd-breakfast', time:'7:30 AM', label:'Breakfast', fixed:false, options:[
      { food:'Oats 50g + low fat milk 250ml + whey 1 scoop + mixed fruits + peanut butter 1 tbsp', kcal:580, protein:35 },
      { food:'Moong dal cheela 3 + hung curd dip + glass low fat milk', kcal:510, protein:32 },
      { food:'Upma 1 cup + whey shake in milk + banana', kcal:520, protein:28 },
      { food:'Paneer bhurji 80g + 2 multigrain toast + glass low fat milk', kcal:555, protein:38 },
    ]},
    { id:'rd-lunch', time:'1:00 PM', label:'Lunch', fixed:false, options:[
      { food:'2–3 roti (multigrain) + dal (rotated) + sabzi + curd + salad', kcal:550, protein:22 },
      { food:'Brown rice 1 cup + rajma/chole 1 cup + curd + salad', kcal:560, protein:20 },
      { food:'Khichdi (moong dal + rice) 1.5 cups + curd + salad', kcal:520, protein:18 },
      { food:'2 multigrain paratha (no oil) + dal + curd + salad', kcal:570, protein:20 },
    ]},
    { id:'rd-snack', time:'4:30 PM', label:'Evening Snack', fixed:false, options:[
      { food:'Sattu in milk (2 tbsp sattu + 250ml low fat milk) + 4 almonds', kcal:220, protein:12 },
      { food:'Roasted makhana 30g + chaas 200ml', kcal:140, protein:5 },
      { food:'Sprouts chaat 1 cup + nimbu + cucumber', kcal:180, protein:10 },
      { food:'Hung curd 150g + mixed nuts 20g', kcal:200, protein:14 },
    ]},
    { id:'rd-dinner', time:'8:00 PM', label:'Dinner', fixed:false, options:[
      { food:'1–2 roti + dal or sabzi (low oil) + small curd', kcal:420, protein:18 },
      { food:'Brown rice 1 cup + light sabzi + dal + curd', kcal:400, protein:15 },
      { food:'Khichdi 1.5 cups + curd + salad', kcal:380, protein:14 },
      { food:'Savory oats 50g + sabzi + curd', kcal:360, protein:12 },
    ]},
    { id:'rd-night', time:'9:30 PM', label:'Night', fixed:true, options:[
      { food:'1 glass warm low fat milk', kcal:80, protein:4 }
    ]},
  ],
  restDay: [
    { id:'rt-morning', time:'6:00 AM', label:'Morning Ritual', fixed:true, options:[
      { food:'Jeera water + 4 soaked almonds + 2 walnuts', kcal:60, protein:2 }
    ]},
    { id:'rt-breakfast', time:'8:00 AM', label:'Breakfast', fixed:false, options:[
      { food:'Oats 50g + low fat milk + whey 1 scoop + mixed fruits + peanut butter', kcal:580, protein:35 },
      { food:'Moong dal cheela 3 + hung curd + glass low fat milk', kcal:510, protein:32 },
      { food:'Besan cheela 3 + curd + black coffee', kcal:480, protein:28 },
      { food:'Paneer bhurji 80g + 2 multigrain toast + glass low fat milk', kcal:555, protein:38 },
    ]},
    { id:'rt-midmorn', time:'11:00 AM', label:'Mid-Morning', fixed:false, options:[
      { food:'Chaas (buttermilk) + 1 seasonal fruit', kcal:120, protein:4 },
      { food:'Nimbu paani + handful makhana 20g', kcal:100, protein:2 },
      { food:'1 small fruit + 4 walnuts', kcal:130, protein:2 },
    ]},
    { id:'rt-lunch', time:'1:30 PM', label:'Lunch', fixed:false, options:[
      { food:'2 roti + dal + sabzi + curd + salad', kcal:500, protein:20 },
      { food:'Brown rice + rajma + curd + salad', kcal:510, protein:19 },
      { food:'Khichdi 1.5 cups + curd + salad', kcal:490, protein:17 },
    ]},
    { id:'rt-snack', time:'4:30 PM', label:'Afternoon Snack', fixed:false, options:[
      { food:'Buttermilk + handful roasted makhana', kcal:90, protein:4 },
      { food:'Sprouts 1 cup + nimbu + cucumber', kcal:130, protein:8 },
      { food:'Hung curd 100g + 1 seasonal fruit', kcal:120, protein:8 },
    ]},
    { id:'rt-dinner', time:'8:00 PM', label:'Dinner', fixed:false, options:[
      { food:'1–2 roti + sabzi + dal (light, minimal oil)', kcal:380, protein:15 },
      { food:'Brown rice + light dal + curd', kcal:370, protein:13 },
      { food:'Khichdi + curd + salad', kcal:350, protein:12 },
    ]},
    { id:'rt-night', time:'9:30 PM', label:'Night', fixed:true, options:[
      { food:'1 glass warm low fat milk', kcal:80, protein:4 }
    ]},
  ]
};

// ===== FOOD DATABASE FOR CALORIE TRACKING =====
const foodDB = [
  { name:'Roti (multigrain)', kcal:100, protein:3.5, unit:'1 roti (30g)' },
  { name:'Roti (wheat)', kcal:95, protein:3, unit:'1 roti (30g)' },
  { name:'Brown rice (cooked)', kcal:215, protein:5, unit:'1 cup (200g)' },
  { name:'White rice (cooked)', kcal:240, protein:4.5, unit:'1 cup (200g)' },
  { name:'Dal moong', kcal:105, protein:7, unit:'1 bowl (200ml)' },
  { name:'Dal masoor', kcal:100, protein:8, unit:'1 bowl (200ml)' },
  { name:'Dal toor/arhar', kcal:115, protein:7.5, unit:'1 bowl (200ml)' },
  { name:'Rajma', kcal:140, protein:9, unit:'1 cup (200ml)' },
  { name:'Chole (chickpeas)', kcal:145, protein:8.5, unit:'1 cup (200ml)' },
  { name:'Paneer', kcal:265, protein:18, unit:'100g' },
  { name:'Low fat milk', kcal:60, protein:6, unit:'250ml glass' },
  { name:'Curd / Yogurt', kcal:60, protein:5, unit:'150g bowl' },
  { name:'Hung curd', kcal:90, protein:9, unit:'100g' },
  { name:'Whey protein (1 scoop)', kcal:120, protein:24, unit:'30g' },
  { name:'Oats (dry)', kcal:190, protein:6, unit:'50g' },
  { name:'Banana', kcal:90, protein:1, unit:'1 medium (100g)' },
  { name:'Apple', kcal:80, protein:0.5, unit:'1 medium (150g)' },
  { name:'Mixed fruits bowl', kcal:100, protein:1.5, unit:'1 cup (150g)' },
  { name:'Egg (whole)', kcal:70, protein:6, unit:'1 large egg' },
  { name:'Egg whites', kcal:17, protein:3.5, unit:'1 egg white' },
  { name:'Peanut butter', kcal:95, protein:4, unit:'1 tbsp (15g)' },
  { name:'Almonds', kcal:70, protein:2.5, unit:'10 almonds (12g)' },
  { name:'Walnuts', kcal:65, protein:1.5, unit:'2 halves (7g)' },
  { name:'Makhana (roasted)', kcal:110, protein:4, unit:'30g handful' },
  { name:'Sattu', kcal:100, protein:7, unit:'2 tbsp (30g)' },
  { name:'Sabzi (light, no oil)', kcal:80, protein:2, unit:'1 bowl (150g)' },
  { name:'Sabzi (with oil)', kcal:120, protein:2.5, unit:'1 bowl (150g)' },
  { name:'Upma', kcal:200, protein:5, unit:'1 cup (150g)' },
  { name:'Poha', kcal:200, protein:3.5, unit:'1 cup (150g)' },
  { name:'Khichdi', kcal:200, protein:8, unit:'1 cup (200g)' },
  { name:'Idli', kcal:60, protein:2, unit:'1 idli (50g)' },
  { name:'Moong dal cheela', kcal:100, protein:7, unit:'1 cheela (60g)' },
  { name:'Besan cheela', kcal:110, protein:6, unit:'1 cheela (60g)' },
  { name:'Multigrain bread', kcal:70, protein:3, unit:'1 slice (30g)' },
  { name:'Salad (mixed)', kcal:40, protein:1, unit:'1 bowl (150g)' },
  { name:'Sprouts (mixed)', kcal:80, protein:6, unit:'1 cup (100g)' },
  { name:'Chaas / Buttermilk', kcal:40, protein:3, unit:'250ml glass' },
  { name:'Jeera water', kcal:5, protein:0, unit:'1 glass (250ml)' },
  { name:'Black coffee', kcal:5, protein:0, unit:'1 cup (no sugar)' },
  { name:'Green tea', kcal:2, protein:0, unit:'1 cup' },
  { name:'Nimbu paani (no sugar)', kcal:10, protein:0, unit:'1 glass' },
  { name:'Coconut water', kcal:45, protein:0.5, unit:'1 glass (250ml)' },
  { name:'Protein bar', kcal:200, protein:20, unit:'1 bar (60g)' },
];

// ===== ACHIEVEMENT BADGES =====
const badgeDefs = [
  { id:'first-run',  icon:'🎯', name:'First Step',      desc:'Log your very first run',           check:(l)=> l.filter(x=>x.distance).length >= 1 },
  { id:'run-5',      icon:'⭐', name:'5 Runs Done',     desc:'Complete 5 run sessions',            check:(l)=> l.filter(x=>x.distance).length >= 5 },
  { id:'run-10',     icon:'🔟', name:'10 Runs Done',    desc:'Complete 10 run sessions',           check:(l)=> l.filter(x=>x.distance).length >= 10 },
  { id:'run-25',     icon:'💪', name:'25 Runs',         desc:'Complete 25 run sessions',           check:(l)=> l.filter(x=>x.distance).length >= 25 },
  { id:'run-50',     icon:'🦾', name:'50 Runs',         desc:'Complete 50 run sessions',           check:(l)=> l.filter(x=>x.distance).length >= 50 },
  { id:'streak-3',   icon:'🔥', name:'On Fire',         desc:'Log activity 3 days in a row',       check:(l,s)=> s >= 3 },
  { id:'streak-7',   icon:'⚡', name:'Week Warrior',    desc:'7-day activity streak',              check:(l,s)=> s >= 7 },
  { id:'streak-30',  icon:'💎', name:'Iron Will',       desc:'30-day activity streak',             check:(l,s)=> s >= 30 },
  { id:'km-10',      icon:'🌱', name:'10km Total',      desc:'Run 10 km total distance',           check:(l)=> getTotalKm() >= 10 },
  { id:'km-50',      icon:'🏅', name:'50km Club',       desc:'Run 50 km total distance',           check:(l)=> getTotalKm() >= 50 },
  { id:'km-100',     icon:'🏆', name:'Century',         desc:'Run 100 km total distance',          check:(l)=> getTotalKm() >= 100 },
  { id:'pace-7',     icon:'🚀', name:'Sub-7 Pace',      desc:'Achieve pace under 7 min/km',       check:(l)=> l.some(x=>x.pace && x.pace < 7) },
  { id:'pace-6',     icon:'⚡', name:'Sub-6 Pace',      desc:'Achieve pace under 6 min/km',       check:(l)=> l.some(x=>x.pace && x.pace < 6) },
  { id:'long-run',   icon:'🌟', name:'10km Run',        desc:'Complete a 10 km run in one session',check:(l)=> l.some(x=>x.distance >= 10) },
  { id:'weigh-5',    icon:'📊', name:'Data Driven',     desc:'Log 5 weigh-ins',                    check:(l)=> l.filter(x=>x.weight).length >= 5 },
  { id:'week-4',     icon:'📅', name:'Month 1 Done',    desc:'Complete 4 weeks of the plan',       check:()=> getDaysDone() >= 28 },
  { id:'week-16',    icon:'🎖️', name:'Halfway There',   desc:'Complete 16 weeks of the plan',      check:()=> getDaysDone() >= 112 },
];

// ===== HELPER FUNCTIONS =====
function getCurrentWeek() {
  const daysDone = Math.max(0, Math.floor((new Date() - new Date(settings.startDate)) / 86400000));
  return Math.min(32, Math.floor(daysDone / 7) + 1);
}
function getDaysDone() {
  return Math.max(0, Math.floor((new Date() - new Date(settings.startDate)) / 86400000));
}
function getLatestWeight() {
  const w = logs.filter(l=>l.weight).sort((a,b)=>b.date.localeCompare(a.date));
  return w.length ? w[0].weight : settings.startWeight;
}
function getLatestBF() {
  const b = logs.filter(l=>l.bf).sort((a,b)=>b.date.localeCompare(a.date));
  return b.length ? b[0].bf : settings.startBF;
}
function getTotalKm() {
  return logs.filter(l=>l.distance).reduce((s,l)=>s+(l.distance||0), 0);
}
function getRunCount() { return logs.filter(l=>l.distance).length; }
function getTDEE(weekNum) {
  if (weekNum <= 8) return 2592;
  if (weekNum <= 16) return 2733;
  if (weekNum <= 24) return 2830;
  return 2922;
}
function estimateKcalBurned(distance, weight) {
  return Math.round(distance * 8.5 * (weight||settings.startWeight) / 1000 * 60);
}

// ===== STREAK FUNCTIONS =====
function getCurrentStreak() {
  if (!logs.length) return 0;
  const logDates = new Set(logs.map(l => l.date));
  const today = new Date(); today.setHours(0,0,0,0);
  let streak = 0;
  let check = new Date(today);
  // If nothing logged today, start from yesterday
  if (!logDates.has(today.toISOString().split('T')[0])) check.setDate(check.getDate()-1);
  while (true) {
    const s = check.toISOString().split('T')[0];
    if (logDates.has(s)) { streak++; check.setDate(check.getDate()-1); }
    else break;
  }
  return streak;
}

function getLongestStreak() {
  if (!logs.length) return 0;
  const dates = [...new Set(logs.map(l=>l.date))].sort();
  let max = 1, cur = 1;
  for (let i=1; i<dates.length; i++) {
    const diff = (new Date(dates[i]) - new Date(dates[i-1])) / 86400000;
    if (diff === 1) { cur++; max = Math.max(max, cur); } else cur = 1;
  }
  return max;
}

// ===== PERSONAL RECORDS =====
function getPersonalRecords() {
  const runs = logs.filter(l=>l.distance);
  if (!runs.length) return {};
  const fastest = runs.filter(l=>l.pace).reduce((b,l)=>(!b||l.pace<b.pace)?l:b, null);
  const longest = runs.reduce((b,l)=>(!b||l.distance>b.distance)?l:b, null);
  const weekKm = {};
  runs.forEach(l => {
    const d=new Date(l.date), ws=new Date(d); ws.setDate(d.getDate()-d.getDay());
    const k=ws.toISOString().split('T')[0]; weekKm[k]=(weekKm[k]||0)+l.distance;
  });
  const bestWeekKm = Object.values(weekKm).length ? Math.max(...Object.values(weekKm)) : 0;
  return { fastest, longest, bestWeekKm };
}

// ===== BADGES =====
function getUnlockedBadges() {
  const streak = getCurrentStreak();
  return badgeDefs.filter(b => { try { return b.check(logs, streak, settings); } catch(e) { return false; } });
}

// ===== CALORIE LOG HELPERS =====
function getTodayCalTotal() {
  const today = new Date().toISOString().split('T')[0];
  const d = calLogs.find(x=>x.date===today);
  if (!d) return { kcal:0, protein:0 };
  return { kcal: d.items.reduce((s,i)=>s+(i.kcal||0),0), protein: d.items.reduce((s,i)=>s+(i.protein||0),0) };
}

// ===== MEAL HELPERS =====
function getActiveMealOption(mealId) {
  return (mealRatings[mealId] && mealRatings[mealId].altIdx != null) ? mealRatings[mealId].altIdx : 0;
}
function getMealRating(mealId) {
  return mealRatings[mealId] ? mealRatings[mealId].rating : null;
}
function getMealDayTarget() {
  const today = new Date().getDay();
  const weekPlan = planWeeks[Math.min(getCurrentWeek()-1,31)];
  const runDaysPerWeek = weekPlan[2];
  // Simple: if today's day index is among first N days of week, it's a run day
  return runDaysPerWeek >= 4 ? 2050 : (today === 0 || today === 3 || today === 6 ? 1750 : 2050);
}

// ===== EXPORT / IMPORT =====
function exportData() {
  const data = { settings, logs, mealRatings, calLogs, exportDate: new Date().toISOString(), version: '2.0' };
  const blob = new Blob([JSON.stringify(data,null,2)], { type:'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'yash-fitness-' + new Date().toISOString().split('T')[0] + '.json'; a.click();
}
function importData() { document.getElementById('import-file').click(); }
function handleImport(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const d = JSON.parse(ev.target.result);
      if (d.logs) { logs = d.logs; DB.set('logs', logs); }
      if (d.settings) { settings = d.settings; DB.set('settings', settings); }
      if (d.mealRatings) { mealRatings = d.mealRatings; DB.set('mealRatings', mealRatings); }
      if (d.calLogs) { calLogs = d.calLogs; DB.set('calLogs', calLogs); }
      refreshAll(); alert('Data imported successfully!');
    } catch(err) { alert('Error importing data. Check file format.'); }
  };
  reader.readAsText(file);
}
function clearData() {
  if (!confirm('Delete ALL data? Cannot be undone.')) return;
  logs=[]; calLogs=[]; DB.set('logs',logs); DB.set('calLogs',calLogs); refreshAll();
}
