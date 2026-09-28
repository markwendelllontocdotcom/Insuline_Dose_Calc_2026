// Automated tests for the calculation logic in app.js
// Run from the app folder with:  node --test
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app.js');

const { calculate, foodDose, correctionDose, mealForTime, readingColour, arrowColour, mealInfoText, DOSE_PLAN } = app;

const MINUS = '−';
const GREAT = 'You’re doing Great!!! 😊';
const HIGH = 'Above 180: Please inject Insulins ASAP!!!';
const LOW = 'LOW: treat with 20 g rapid carbs first';
const SWEETS = 'Take sweets to avoid Hypoglycemia';
const BELOW80 = 'Below 80: inject after eating';

// Helper: run the calculator like the screen does (3 food rows)
function run(meal, reading, arrow, foods) {
  const rows = (foods || []).slice();
  while (rows.length < 3) rows.push({ name: '', carbs: '' });
  return calculate({ meal, reading, arrow, foods: rows });
}
const food = (carbs, name) => ({ name: name === undefined ? 'Food' : name, carbs });

function assertMessage(r, text, style, flash) {
  assert.ok(r.message, 'expected a message');
  assert.equal(r.message.text, text);
  assert.equal(r.message.style, style);
  assert.equal(r.message.flash, flash);
}

/* ---------------- Required tests ---------------- */

test('1. 150, →, Dinner, no food → correction 1 u, total 1 u, steady green Great', () => {
  const r = run('Dinner', 150, 'steady');
  assert.equal(r.correction.value, 1);
  assert.equal(r.correction.text, '1 u');
  assert.equal(r.total, 1);
  assert.equal(r.totalText, '1 u');
  assertMessage(r, GREAT, 'green', false);
});

test('2. 300, ↑, Breakfast, 60 g → correction 8 u, food 8 u, total 16 u, Dark Red box, flashing Above 180', () => {
  const r = run('Breakfast', 300, 'up', [food(60, 'Toast')]);
  assert.equal(r.correction.value, 8);
  assert.equal(r.foods[0].value, 8);
  assert.equal(r.foods[0].text, '8 u');
  assert.equal(r.total, 16);
  assert.equal(r.totalText, '16 u');
  assert.equal(r.readingColour.name, 'Dark Red');
  assert.equal(r.readingColour.background, '#C00000');
  assertMessage(r, HIGH, 'red', true);
});

test('3. 70, ↓, Lunch, no food → correction −2 u, total 0 u, Take sweets', () => {
  const r = run('Lunch', 70, 'down');
  assert.equal(r.correction.value, -2);
  assert.equal(r.correction.text, MINUS + '2 u');
  assert.equal(r.total, 0);
  assertMessage(r, SWEETS, 'red', false);
});

test('4. 65, blank arrow, Dinner → correction 0 u, flashing LOW, Blue box', () => {
  const r = run('Dinner', 65, null);
  assert.equal(r.correction.kind, 'dose');
  assert.equal(r.correction.value, 0);
  assert.equal(r.correction.text, '0 u');
  assert.equal(r.total, 0);
  assert.equal(r.readingColour.name, 'Blue');
  assert.equal(r.readingColour.background, '#0070C0');
  assertMessage(r, LOW, 'red', true);
});

test('5. 200, →, Bedtime, 45 g → correction 2 u, food 6 u, total 8 u, flashing Above 180', () => {
  const r = run('Bedtime', 200, 'steady', [food(45)]);
  assert.equal(r.correction.value, 2);
  assert.equal(r.foods[0].value, 6);
  assert.equal(r.total, 8);
  assertMessage(r, HIGH, 'red', true);
});

test('6. 400, ↓↓, Bedtime → correction 5 u, flashing Above 180', () => {
  const r = run('Bedtime', 400, 'downFast');
  assert.equal(r.correction.value, 5);
  assert.equal(r.total, 5);
  assertMessage(r, HIGH, 'red', true);
});

test('7. 20 g → 3 u (2.5 rounds up); empty food name with 30 g → No food', () => {
  assert.equal(foodDose('Rice', 20, 'Lunch').value, 3);
  assert.equal(foodDose('Rice', 20, 'Lunch').text, '3 u');
  const noName = foodDose('', 30, 'Lunch');
  assert.equal(noName.kind, 'noFood');
  assert.equal(noName.text, 'No food');
  assert.equal(noName.value, 0);
  // and it is not counted in the total
  const r = run('Lunch', 100, 'steady', [food(30, '')]);
  assert.equal(r.foods[0].text, 'No food');
  assert.equal(r.total, 0);
});

test('8. 75, →, Lunch → 0 u, Below 80 (steady red); 79, ↓, Lunch → −2 u, Take sweets wins', () => {
  const a = run('Lunch', 75, 'steady');
  assert.equal(a.correction.value, 0);
  assert.equal(a.total, 0);
  assertMessage(a, BELOW80, 'red', false);

  const b = run('Lunch', 79, 'down');
  assert.equal(b.correction.value, -2);
  assert.equal(b.total, 0);
  assertMessage(b, SWEETS, 'red', false);
});

// 9. Layout check is done in a browser at iPhone SE, iPhone 15 and iPhone 15 Pro Max sizes (not a Node test).

test('10. Boundaries (Dinner, →, no food): 69, 180, 181, 251', () => {
  const r69 = run('Dinner', 69, 'steady');
  assert.equal(r69.correction.value, 0);
  assertMessage(r69, LOW, 'red', true);
  assert.equal(r69.readingColour.name, 'Blue');

  const r180 = run('Dinner', 180, 'steady');
  assert.equal(r180.correction.value, 2);
  assertMessage(r180, GREAT, 'green', false);
  assert.equal(r180.readingColour.name, 'Green');

  const r181 = run('Dinner', 181, 'steady');
  assert.equal(r181.correction.value, 3);
  assertMessage(r181, HIGH, 'red', true);
  assert.equal(r181.readingColour.name, 'Red');

  const r251 = run('Dinner', 251, 'steady');
  assert.equal(r251.correction.value, 5);
  assert.equal(r251.readingColour.name, 'Dark Red');
});

test('11. Morning Snack ignores correction and arrow; Late Morning Snack uses Breakfast column', () => {
  const a = run('Morning Snack', 200, 'up', [food(15)]);
  assert.equal(a.correction.kind, 'notNeeded');
  assert.equal(a.correction.text, 'Not needed');
  assert.equal(a.correction.value, 0);
  assert.equal(a.foods[0].value, 2);
  assert.equal(a.total, 2);
  assertMessage(a, HIGH, 'red', true);

  const b = run('Late Morning Snack', 200, 'steady', [food(15)]);
  assert.equal(b.correction.value, 3);
  assert.equal(b.foods[0].value, 2);
  assert.equal(b.total, 5);
});

test('12. Evening Snack 75 ↓ → Not needed + Below 80; Afternoon Snack 70 ↓ → −2 u + sweets; Bedtime target 140', () => {
  const a = run('Evening Snack', 75, 'down');
  assert.equal(a.correction.text, 'Not needed');
  assert.equal(a.total, 0);
  assertMessage(a, BELOW80, 'red', false);

  const b = run('Afternoon Snack', 70, 'down');
  assert.equal(b.correction.value, -2);
  assertMessage(b, SWEETS, 'red', false);

  assert.equal(DOSE_PLAN.meals.find((m) => m.name === 'Bedtime').target, 140);
  assert.equal(mealInfoText('Bedtime'), 'Target 140 mg/dL • Planned carbs 15 g • Correction needed');
});

/* ---------------- Plan data matches the written plan ---------------- */

test('Meal & snack settings match the plan', () => {
  const expected = [
    ['Breakfast', 'Breakfast', true, 100, 60],
    ['Morning Snack', 'Breakfast', false, 100, 0],
    ['Late Morning Snack', 'Breakfast', true, 100, 15],
    ['Lunch', 'Lunch', true, 100, 60],
    ['Afternoon Snack', 'Lunch', true, 100, 15],
    ['Dinner', 'Dinner', true, 100, 60],
    ['Evening Snack', 'Dinner', false, 100, 0],
    ['Bedtime', 'Bedtime', true, 140, 15]
  ];
  assert.deepEqual(DOSE_PLAN.meals.map((m) => [m.name, m.column, m.correction, m.target, m.plannedCarbs]), expected);
  assert.deepEqual(DOSE_PLAN.carbRatio, { Breakfast: 8, Lunch: 8, Dinner: 8, Bedtime: 8 });
  assert.deepEqual(DOSE_PLAN.correctionFactor, { Breakfast: 30, Lunch: 30, Dinner: 30, Bedtime: 30 });
});

test('Info line text for every meal time', () => {
  assert.equal(mealInfoText('Breakfast'), 'Target 100 mg/dL • Planned carbs 60 g • Correction needed');
  assert.equal(mealInfoText('Morning Snack'), 'Target 100 mg/dL • Planned carbs 0 g • Correction NOT needed');
  assert.equal(mealInfoText('Evening Snack'), 'Target 100 mg/dL • Planned carbs 0 g • Correction NOT needed');
  assert.equal(mealInfoText('Afternoon Snack'), 'Target 100 mg/dL • Planned carbs 15 g • Correction needed');
});

// Correction table typed out separately from app.js so a typo in either place is caught
const TABLE = [
  // from, Breakfast, Lunch, Dinner, Bedtime
  [0, 0, 0, 0, 0],
  [70, 0, 0, 0, 0],
  [101, 1, 1, 1, 0],
  [121, 1, 1, 1, 0],
  [151, 2, 2, 2, 1],
  [181, 3, 3, 3, 2],
  [221, 5, 5, 5, 4],
  [261, 6, 6, 6, 5],
  [301, 7, 7, 7, 7],
  [351, 9, 9, 9, 8]
];
const COLUMN_MEAL = { Breakfast: 'Breakfast', Lunch: 'Lunch', Dinner: 'Dinner', Bedtime: 'Bedtime' };

test('Every correction band boundary in every column (steady arrow)', () => {
  const cols = ['Breakfast', 'Lunch', 'Dinner', 'Bedtime'];
  TABLE.forEach((row, i) => {
    const from = row[0];
    const to = i < TABLE.length - 1 ? TABLE[i + 1][0] - 1 : 600;
    cols.forEach((col, c) => {
      for (const reading of [from, to]) {
        const r = correctionDose(reading, COLUMN_MEAL[col], 'steady');
        assert.equal(r.value, row[c + 1], `${col} reading ${reading}`);
      }
    });
  });
});

test('Snacks use the column of their main meal', () => {
  assert.equal(correctionDose(200, 'Late Morning Snack', null).value, 3); // Breakfast
  assert.equal(correctionDose(110, 'Afternoon Snack', null).value, 1);   // Lunch
  assert.equal(correctionDose(110, 'Bedtime', null).value, 0);           // Bedtime column
  assert.equal(correctionDose(400, 'Bedtime', null).value, 8);
});

test('Arrow adjustments: ↑↑ +3, ↑ +2, → 0, ↓ −2, ↓↓ −3, blank 0', () => {
  const base = 3; // Lunch, 200 mg/dL
  assert.equal(correctionDose(200, 'Lunch', 'upFast').value, base + 3);
  assert.equal(correctionDose(200, 'Lunch', 'up').value, base + 2);
  assert.equal(correctionDose(200, 'Lunch', 'steady').value, base);
  assert.equal(correctionDose(200, 'Lunch', 'down').value, base - 2);
  assert.equal(correctionDose(200, 'Lunch', 'downFast').value, base - 3);
  assert.equal(correctionDose(200, 'Lunch', null).value, base);
  assert.equal(correctionDose(200, 'Lunch', '↑↑').value, base + 3); // symbols work too
});

test('No reading → correction blank, no message, no colour; total from food only', () => {
  const r = run('Lunch', '', 'upFast', [food(16)]);
  assert.equal(r.correction.kind, 'blank');
  assert.equal(r.correction.text, '');
  assert.equal(r.message, null);
  assert.equal(r.readingColour, null);
  assert.equal(r.total, 2);
});

test('Correction NOT needed snacks ignore every arrow', () => {
  for (const arrow of ['upFast', 'up', 'steady', 'down', 'downFast', null]) {
    for (const meal of ['Morning Snack', 'Evening Snack']) {
      const r = correctionDose(300, meal, arrow);
      assert.equal(r.kind, 'notNeeded');
      assert.equal(r.value, 0);
    }
  }
});

test('Total is never negative', () => {
  const r = run('Lunch', 70, 'downFast', [food(8)]); // −3 + 1
  assert.equal(r.correction.value, -3);
  assert.equal(r.total, 0);
  assert.equal(r.totalText, '0 u');
  const s = run('Lunch', 150, 'downFast', [food(16), food(8)]); // 1 − 3 + 2 + 1
  assert.equal(s.total, 1);
});

test('Total adds all three food rows', () => {
  const r = run('Dinner', 250, 'up', [food(60), food(20), food(4)]); // 5+2 + 8 + 3 + 1
  assert.equal(r.correction.value, 7);
  assert.deepEqual(r.foods.map((f) => f.value), [8, 3, 1]);
  assert.equal(r.total, 19);
});

/* ---------------- Food rows ---------------- */

test('Food dose rounding (nearest whole unit, 0.5 up)', () => {
  const cases = [[0, 0], [3.9, 0], [4, 1], [11.9, 1], [12, 2], [15, 2], [20, 3], [28, 4], [44, 6], [45, 6], [60, 8], [100, 13]];
  for (const [g, u] of cases) assert.equal(foodDose('x', g, 'Dinner').value, u, `${g} g`);
});

test('Food row needs both name and carbs', () => {
  assert.equal(foodDose('Rice', '', 'Lunch').text, 'No food');
  assert.equal(foodDose('   ', 30, 'Lunch').text, 'No food');
  assert.equal(foodDose('', '', 'Lunch').text, 'No food');
  assert.equal(foodDose('Rice', '30', 'Lunch').value, 4);   // typed text
  assert.equal(foodDose('Rice', '7,5', 'Lunch').value, 1);  // comma decimal
  assert.equal(foodDose('Rice', 'abc', 'Lunch').text, 'No food');
});

/* ---------------- Messages ---------------- */

test('Message order: first match wins', () => {
  assertMessage(run('Dinner', 65, 'downFast'), LOW, 'red', true);       // LOW beats sweets
  assertMessage(run('Dinner', 0, null), LOW, 'red', true);
  assertMessage(run('Dinner', 70, 'steady'), BELOW80, 'red', false);
  assertMessage(run('Dinner', 79, 'upFast'), BELOW80, 'red', false);    // positive correction
  assertMessage(run('Dinner', 80, 'downFast'), GREAT, 'green', false);  // 80 is not below 80
  assertMessage(run('Dinner', 100, 'steady'), GREAT, 'green', false);
  assertMessage(run('Dinner', 350, 'downFast'), HIGH, 'red', true);
  assertMessage(run('Evening Snack', 70, 'downFast'), BELOW80, 'red', false);
});

test('Only LOW and Above 180 flash', () => {
  for (const m of Object.values(DOSE_PLAN.messages)) {
    assert.equal(m.flash, m.key === 'low' || m.key === 'high', m.key);
  }
});

/* ---------------- Colours ---------------- */

test('Blood sugar box colours at every boundary', () => {
  const cases = [
    [0, 'Blue', '#0070C0'], [69, 'Blue', '#0070C0'],
    [70, 'Yellow', '#FFFF00'], [100, 'Yellow', '#FFFF00'],
    [101, 'Green', '#00B050'], [180, 'Green', '#00B050'],
    [181, 'Red', '#FF0000'], [250, 'Red', '#FF0000'],
    [251, 'Dark Red', '#C00000'], [600, 'Dark Red', '#C00000']
  ];
  for (const [reading, name, hex] of cases) {
    const c = readingColour(reading);
    assert.equal(c.name, name, String(reading));
    assert.equal(c.background, hex, String(reading));
  }
  assert.equal(readingColour(70).text, '#000000');  // yellow has black text
  assert.equal(readingColour(69).text, '#FFFFFF');
  assert.equal(readingColour(''), null);
});

test('Arrow colours', () => {
  assert.equal(arrowColour('steady').background, '#FFFF00');
  assert.equal(arrowColour('down').background, '#92D050');
  assert.equal(arrowColour('downFast').background, '#00B050');
  assert.equal(arrowColour('downFast').text, '#FFFFFF');
  assert.equal(arrowColour('up').background, '#FF0000');
  assert.equal(arrowColour('upFast').background, '#C00000');
  assert.equal(arrowColour(null), null);
});

/* ---------------- Meal time from the clock ---------------- */

test('Default meal time from the clock', () => {
  const at = (hh, mm) => new Date(2026, 0, 15, hh, mm);
  const cases = [
    [0, 0, 'Bedtime'], [4, 59, 'Bedtime'],
    [5, 0, 'Breakfast'], [10, 59, 'Breakfast'],
    [11, 0, 'Lunch'], [15, 59, 'Lunch'],
    [16, 0, 'Dinner'], [20, 59, 'Dinner'],
    [21, 0, 'Bedtime'], [23, 59, 'Bedtime']
  ];
  for (const [hh, mm, meal] of cases) assert.equal(mealForTime(at(hh, mm)), meal, `${hh}:${mm}`);
});
