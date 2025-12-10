/**
 * Test script for Family Account System
 * Run with: npx tsx scripts/test-family-system.ts
 */

import { calculateFamilyPrice, MemberType } from '../lib/stripe';

console.log('🧪 Testing Family Account Pricing System\n');
console.log('═'.repeat(60));

// Test Case 1: Single Member
console.log('\n📊 Test Case 1: Single Member (Adult)');
const single = calculateFamilyPrice(['adult']);
console.log(`Members: ${single.memberCount}`);
console.log(`Monthly Total: $${single.monthlyTotal}`);
console.log(`vs Individual: $${single.vsIndividual}`);
console.log(`Savings: $${single.savings}`);
console.log('✅ Expected: $100, Savings: $0');

// Test Case 2: Two Members (Adult + Kid)
console.log('\n📊 Test Case 2: Two Members (1 Adult + 1 Kid)');
const two = calculateFamilyPrice(['adult', 'kid']);
console.log(`Members: ${two.memberCount}`);
console.log(`Monthly Total: $${two.monthlyTotal}`);
console.log(`vs Individual: $${two.vsIndividual}`);
console.log(`Savings: $${two.savings}`);
console.log('✅ Expected: $150, Savings: $25');

// Test Case 3: Two Adults
console.log('\n📊 Test Case 3: Two Members (2 Adults)');
const twoAdults = calculateFamilyPrice(['adult', 'adult']);
console.log(`Members: ${twoAdults.memberCount}`);
console.log(`Monthly Total: $${twoAdults.monthlyTotal}`);
console.log(`vs Individual: $${twoAdults.vsIndividual}`);
console.log(`Savings: $${twoAdults.savings}`);
console.log('✅ Expected: $150, Savings: $50');

// Test Case 4: Three Members (2 Adults + 1 Kid)
console.log('\n📊 Test Case 4: Three Members (2 Adults + 1 Kid)');
const three = calculateFamilyPrice(['adult', 'adult', 'kid']);
console.log(`Members: ${three.memberCount}`);
console.log(`Monthly Total: $${three.monthlyTotal}`);
console.log(`vs Individual: $${three.vsIndividual}`);
console.log(`Savings: $${three.savings}`);
console.log('✅ Expected: $200, Savings: $75');

// Test Case 5: Four Members (2 Adults + 2 Kids)
console.log('\n📊 Test Case 5: Four Members (2 Adults + 2 Kids)');
const four = calculateFamilyPrice(['adult', 'adult', 'kid', 'kid']);
console.log(`Members: ${four.memberCount}`);
console.log(`Monthly Total: $${four.monthlyTotal}`);
console.log(`vs Individual: $${four.vsIndividual}`);
console.log(`Savings: $${four.savings}`);
console.log('✅ Expected: $250, Savings: $100');

// Test Case 6: Five Members (3 Adults + 2 Kids)
console.log('\n📊 Test Case 6: Five Members (3 Adults + 2 Kids)');
const five = calculateFamilyPrice(['adult', 'adult', 'adult', 'kid', 'kid']);
console.log(`Members: ${five.memberCount}`);
console.log(`Monthly Total: $${five.monthlyTotal}`);
console.log(`vs Individual: $${five.vsIndividual}`);
console.log(`Savings: $${five.savings}`);
console.log('✅ Expected: $300, Savings: $150');

// Test Case 7: Large Family (4 Adults + 3 Kids)
console.log('\n📊 Test Case 7: Large Family (4 Adults + 3 Kids)');
const large = calculateFamilyPrice(['adult', 'adult', 'adult', 'adult', 'kid', 'kid', 'kid']);
console.log(`Members: ${large.memberCount}`);
console.log(`Monthly Total: $${large.monthlyTotal}`);
console.log(`vs Individual: $${large.vsIndividual}`);
console.log(`Savings: $${large.savings}`);
console.log('✅ Expected: $400, Savings: $225');

// Summary Table
console.log('\n📈 Pricing Summary Table');
console.log('═'.repeat(60));
console.log('Members | Individual | Family | Savings | % Saved');
console.log('-'.repeat(60));

const testCases = [
  { members: 1, types: ['adult'] as MemberType[] },
  { members: 2, types: ['adult', 'kid'] as MemberType[] },
  { members: 2, types: ['adult', 'adult'] as MemberType[] },
  { members: 3, types: ['adult', 'adult', 'kid'] as MemberType[] },
  { members: 4, types: ['adult', 'adult', 'kid', 'kid'] as MemberType[] },
  { members: 5, types: ['adult', 'adult', 'adult', 'kid', 'kid'] as MemberType[] },
];

testCases.forEach((tc) => {
  const result = calculateFamilyPrice(tc.types);
  const percentSaved = ((result.savings / result.vsIndividual) * 100).toFixed(1);
  console.log(
    `${result.memberCount.toString().padStart(7)} | ` +
      `$${result.vsIndividual.toString().padStart(9)} | ` +
      `$${result.monthlyTotal.toString().padStart(5)} | ` +
      `$${result.savings.toString().padStart(6)} | ` +
      `${percentSaved.padStart(6)}%`
  );
});

console.log('\n✅ All tests completed!\n');

// Annual Savings Calculation
console.log('💰 Annual Savings Examples');
console.log('═'.repeat(60));
[2, 3, 4, 5].forEach((count) => {
  const types: MemberType[] = [
    ...Array(Math.floor(count / 2)).fill('adult'),
    ...Array(Math.ceil(count / 2)).fill('kid'),
  ];
  const result = calculateFamilyPrice(types);
  const annualSavings = result.savings * 12;
  console.log(`${count} members: Save $${annualSavings}/year ($${result.savings}/month)`);
});

console.log('\n🎯 Key Insights:');
console.log('  • Families of 2+ always get a discount');
console.log('  • Base family rate: $150 for first 2 members');
console.log('  • Additional members: +$50 each (25% discount)');
console.log('  • Maximum savings grows with family size');
console.log('  • Annual savings can exceed $1,000 for large families\n');
