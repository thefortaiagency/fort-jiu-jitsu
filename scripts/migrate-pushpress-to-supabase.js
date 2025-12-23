/**
 * Migrate PushPress Members to Supabase (Unified Membership System)
 *
 * This script imports members from the PushPress export into the Supabase
 * database used by The Fort Jiu-Jitsu. This creates a unified membership
 * system for both The Fort Wrestling and The Fort Jiu-Jitsu.
 *
 * PREREQUISITES:
 * 1. Run the add_facility_field.sql migration in Supabase first
 * 2. Have the members-for-migration.json file from the wrestling site
 *
 * Run with: node scripts/migrate-pushpress-to-supabase.js [--dry-run]
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const DRY_RUN = process.argv.includes('--dry-run');

// Path to the PushPress export from wrestling site
const MEMBERS_FILE = path.join(__dirname, '../../00-PRODUCTION/thefortwrestling/scripts/members-for-migration.json');

// Map PushPress programs to database programs + facility
const PROGRAM_MAP = {
  'The Fort Junior Hammers': { program: 'junior-hammers', facility: 'wrestling' },
  'The Fort Junior Hammers Monthly': { program: 'junior-hammers', facility: 'wrestling' },
  'The Fort Junior Hammers 12 Month Plan': { program: 'junior-hammers-annual', facility: 'wrestling' },
  'The Fort Big Hammers': { program: 'big-hammers', facility: 'wrestling' },
  'The Fort Lady Hammers': { program: 'lady-hammers', facility: 'wrestling' },
  'The Fort Beginners': { program: 'beginners', facility: 'wrestling' },
  'The Fort Hammer Family Plan': { program: 'family-plan', facility: 'wrestling' },
  '2 Family': { program: '2-family', facility: 'wrestling' },
  'The Fort Lil Hammers Staff': { program: 'staff-comped', facility: 'wrestling' },
  'The Fort Jiu Jitsu Morning Rolls/Open Mats/Circuit Training': { program: 'morning-rolls', facility: 'jiujitsu' },
  'The Fort Jiu-Jitsu Get Grip Combined All Access': { program: 'all-access', facility: 'jiujitsu' },
};

// Generate a random 4-digit PIN
function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// Generate a QR code string
function generateQrCode(memberId) {
  return `FORT-${memberId.substring(0, 8).toUpperCase()}`;
}

async function migrate() {
  console.log('='.repeat(80));
  console.log(DRY_RUN ? '🧪 DRY RUN - No changes will be made' : '🚀 LIVE MIGRATION TO SUPABASE');
  console.log('='.repeat(80));
  console.log('');

  // Load member data
  let members;
  try {
    members = JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
    console.log(`✅ Loaded ${members.length} members from PushPress export\n`);
  } catch (e) {
    console.error('❌ Could not load members-for-migration.json');
    console.error(`   Expected at: ${MEMBERS_FILE}`);
    console.error('   Run parse-pushpress-full.js in the wrestling project first!');
    process.exit(1);
  }

  const results = {
    created: [],
    updated: [],
    skipped: [],
    failed: []
  };

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    console.log(`[${i + 1}/${members.length}] Processing: ${member.name}`);
    console.log(`   Program: ${member.program}`);
    console.log(`   Email: ${member.email || 'NONE'}`);

    // Map program
    const mapping = PROGRAM_MAP[member.program];
    if (!mapping) {
      console.log(`   ❌ Unknown program, skipping\n`);
      results.skipped.push({ ...member, reason: 'unknown_program' });
      continue;
    }

    // Skip members without email (can't be looked up or logged in)
    if (!member.email) {
      console.log(`   ⏭️  Skipped (no email)\n`);
      results.skipped.push({ ...member, reason: 'no_email' });
      continue;
    }

    // Check if member already exists by email
    const { data: existing, error: lookupError } = await supabase
      .from('members')
      .select('id, email, facility')
      .eq('email', member.email.toLowerCase())
      .maybeSingle();

    if (lookupError) {
      console.log(`   ❌ Lookup error: ${lookupError.message}\n`);
      results.failed.push({ ...member, reason: lookupError.message });
      continue;
    }

    if (existing) {
      // Member exists - update facility if needed
      console.log(`   📧 Found existing member: ${existing.id}`);

      if (existing.facility !== mapping.facility && existing.facility !== 'both') {
        // Member does both wrestling and BJJ
        if (!DRY_RUN) {
          const { error: updateError } = await supabase
            .from('members')
            .update({
              facility: 'both',
              pushpress_id: member.memberId,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (updateError) {
            console.log(`   ❌ Update error: ${updateError.message}\n`);
            results.failed.push({ ...member, reason: updateError.message });
            continue;
          }
        }
        console.log(`   🔄 Updated to facility: both`);
        results.updated.push({ ...member, supabaseId: existing.id, facility: 'both' });
      } else {
        console.log(`   ⏭️  Already exists, no update needed`);
        results.skipped.push({ ...member, reason: 'already_exists' });
      }
      console.log('');
      continue;
    }

    // Create new member
    const newMember = {
      first_name: member.firstName,
      last_name: member.lastName,
      email: member.email.toLowerCase(),
      phone: member.phone || null,
      program: mapping.program,
      facility: mapping.facility,
      skill_level: 'beginner',
      status: 'active',
      membership_type: member.program.includes('12 Month') ? 'annual' : 'monthly',
      is_primary_account_holder: true,
      individual_monthly_cost: member.amount,
      payment_status: member.amount === 0 ? 'active' : 'pending', // Comped members are active
      pushpress_id: member.memberId,
      pin_code: generatePin(),
      qr_code: generateQrCode(member.memberId),
      created_at: member.memberSince ? new Date(member.memberSince).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(`   📝 Creating new member...`);
    console.log(`      Facility: ${mapping.facility}`);
    console.log(`      Program: ${mapping.program}`);

    if (!DRY_RUN) {
      const { data: created, error: createError } = await supabase
        .from('members')
        .insert(newMember)
        .select()
        .single();

      if (createError) {
        console.log(`   ❌ Create error: ${createError.message}\n`);
        results.failed.push({ ...member, reason: createError.message });
        continue;
      }

      console.log(`   ✅ Created: ${created.id}\n`);
      results.created.push({ ...member, supabaseId: created.id });
    } else {
      console.log(`   ✅ Would create (dry run)\n`);
      results.created.push({ ...member, supabaseId: 'DRY_RUN' });
    }
  }

  // Summary
  console.log('='.repeat(80));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`🔄 Updated: ${results.updated.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  // Breakdown by facility
  const wrestlingCreated = results.created.filter(m => PROGRAM_MAP[m.program]?.facility === 'wrestling').length;
  const bjjCreated = results.created.filter(m => PROGRAM_MAP[m.program]?.facility === 'jiujitsu').length;
  console.log(`\nFacility Breakdown:`);
  console.log(`   Wrestling: ${wrestlingCreated} new members`);
  console.log(`   Jiu-Jitsu: ${bjjCreated} new members`);

  if (results.skipped.length > 0) {
    console.log('\nSkipped members:');
    results.skipped.forEach(m => console.log(`   - ${m.name}: ${m.reason}`));
  }

  if (results.failed.length > 0) {
    console.log('\nFailed members:');
    results.failed.forEach(m => console.log(`   - ${m.name}: ${m.reason}`));
  }

  // Save results
  const resultsFile = `scripts/supabase-migration-results-${Date.now()}.json`;
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${resultsFile}`);

  return results;
}

// Run
migrate()
  .then(() => {
    console.log('\n✅ Migration complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
