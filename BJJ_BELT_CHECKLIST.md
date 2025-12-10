# BJJ Belt System - Implementation Checklist

Use this checklist to track your implementation progress.

## Phase 1: Database Setup ⏱️ 10 minutes

- [ ] Open Supabase SQL Editor (https://qpyjujdwdkyvdmhpsyul.supabase.co)
- [ ] Copy `supabase/belt_progression.sql` contents
- [ ] Execute SQL migration
- [ ] Verify tables created:
  - [ ] `belt_ranks` (should have 18 rows)
  - [ ] `member_belt_history` (empty initially)
  - [ ] `members` has new columns: `current_belt_id`, `current_stripes`, `belt_updated_at`, `total_classes_attended`
- [ ] Verify triggers created:
  - [ ] `trigger_update_member_belt` on `member_belt_history`
- [ ] Verify functions created:
  - [ ] `get_promotion_eligibility()`
- [ ] Verify RLS policies active:
  - [ ] Service role full access
  - [ ] Members can view own history

## Phase 2: Initial Data Setup ⏱️ 5 minutes

- [ ] Assign white belt to adult BJJ members:
  ```sql
  UPDATE members SET current_belt_id = (SELECT id FROM belt_ranks WHERE name = 'white')
  WHERE program IN ('adult-bjj', 'beginners') AND current_belt_id IS NULL;
  ```
- [ ] Assign kids white belt to kids BJJ members:
  ```sql
  UPDATE members SET current_belt_id = (SELECT id FROM belt_ranks WHERE name = 'kids_white')
  WHERE program = 'kids-bjj' AND current_belt_id IS NULL;
  ```
- [ ] Create initial belt history entries:
  ```sql
  INSERT INTO member_belt_history (member_id, belt_rank_id, stripes, promoted_at, is_current)
  SELECT id, current_belt_id, 0, created_at, true FROM members
  WHERE current_belt_id IS NOT NULL;
  ```
- [ ] Verify all BJJ members have belts assigned

## Phase 3: API Testing ⏱️ 10 minutes

Test all API endpoints work:

- [ ] GET `/api/belts` returns all belt ranks
- [ ] GET `/api/belts?member_id={id}` returns member history
- [ ] GET `/api/members/{id}/belt` returns eligibility
- [ ] POST `/api/members/{id}/belt` promotes member (test with dummy data)
- [ ] GET `/api/admin/promotions` lists eligible members
- [ ] POST `/api/admin/promotions` batch promotes (test with dummy data)

## Phase 4: Member Portal Integration ⏱️ 15 minutes

- [ ] Update `/app/member/components/MemberDashboard.tsx`
- [ ] Add belt info fetch on member load
- [ ] Display `<BeltProgress />` component
- [ ] Display `<BeltHistory />` component
- [ ] Test member can view their belt
- [ ] Test belt progress bars display correctly
- [ ] Test promotion history timeline works
- [ ] Test certificate modal opens and prints

## Phase 5: Admin Portal Integration ⏱️ 10 minutes

- [ ] Add "Promotions" link to admin navigation
- [ ] Test `/admin/promotions` page loads
- [ ] Test member list displays with eligibility
- [ ] Test filters work (program, belt, eligible only)
- [ ] Test promotion modal opens
- [ ] Test stripe promotion works
- [ ] Test belt promotion validates (can't skip belts)
- [ ] Test batch promotion with multiple members
- [ ] Add `<BeltStatisticsCard />` to admin dashboard

## Phase 6: Visual Testing ⏱️ 10 minutes

- [ ] Visit `/examples/belt-system-demo` (demo page)
- [ ] Verify all belt colors display correctly
- [ ] Verify stripes display properly
- [ ] Verify all 4 sizes work (sm/md/lg/xl)
- [ ] Test belt badges in lists
- [ ] Test belt icons in avatars
- [ ] Test on mobile devices (responsive)
- [ ] Test print certificate layout

## Phase 7: Promotion Workflow Test ⏱️ 15 minutes

### Stripe Promotion Test
- [ ] Login as admin
- [ ] Navigate to `/admin/promotions`
- [ ] Select member with 0-3 stripes
- [ ] Open promotion modal
- [ ] Select "Stripe Promotion"
- [ ] Add notes: "Excellent guard work"
- [ ] Submit promotion
- [ ] Verify member's stripes increased
- [ ] Check member portal shows update
- [ ] Check history entry created

### Belt Promotion Test
- [ ] Select member with 4 stripes
- [ ] Open promotion modal
- [ ] Select "Belt Promotion"
- [ ] Verify next belt pre-selected
- [ ] Set starting stripes to 0
- [ ] Add notes: "Ready for next level"
- [ ] Submit promotion
- [ ] Verify member's belt changed
- [ ] Verify stripes reset to 0
- [ ] Check notification created
- [ ] Check certificate generates

## Phase 8: Edge Cases ⏱️ 10 minutes

Test error handling:

- [ ] Try promoting black belt (should show "highest belt")
- [ ] Try skipping belts (should prevent)
- [ ] Try promoting with > 4 stripes (should prevent)
- [ ] Try promoting without instructor ID (should error)
- [ ] Test with member who has no belt history
- [ ] Test with newly created member

## Phase 9: Performance Testing ⏱️ 10 minutes

- [ ] Load admin promotions page with 50+ members (< 2 seconds)
- [ ] Open member portal with belt history (< 1 second)
- [ ] Batch promote 10 members (< 5 seconds)
- [ ] Load belt statistics dashboard (< 2 seconds)
- [ ] Check database indexes exist:
  ```sql
  SELECT * FROM pg_indexes WHERE tablename IN ('belt_ranks', 'member_belt_history', 'members');
  ```

## Phase 10: Security Verification ⏱️ 5 minutes

- [ ] Verify RLS policies active:
  ```sql
  SELECT * FROM pg_policies WHERE tablename IN ('belt_ranks', 'member_belt_history');
  ```
- [ ] Test member cannot promote themselves
- [ ] Test member cannot view other members' history
- [ ] Test non-admin cannot access `/admin/promotions`
- [ ] Test service role can bypass RLS (for API routes)

## Phase 11: Documentation Review ⏱️ 5 minutes

- [ ] Read `BJJ_BELT_SYSTEM_README.md`
- [ ] Read `BJJ_BELT_IMPLEMENTATION_GUIDE.md`
- [ ] Bookmark for future reference
- [ ] Share with team members

## Phase 12: Production Deployment ⏱️ 10 minutes

- [ ] Run database migration on production Supabase
- [ ] Assign initial belts to production members
- [ ] Test API endpoints on production
- [ ] Test member portal on production
- [ ] Test admin portal on production
- [ ] Monitor error logs for 24 hours
- [ ] Announce to staff/instructors

## Optional Enhancements

Future features to consider:

- [ ] Email notifications on promotion
- [ ] SMS notifications on promotion
- [ ] Automated promotion reminders (eligibility alerts)
- [ ] Belt exam scheduling system
- [ ] Technique requirements per belt
- [ ] Competition results tracking
- [ ] Parent notifications (kids program)
- [ ] Belt ceremony calendar
- [ ] Social media auto-posting
- [ ] Custom certificate templates
- [ ] Bulk import historical belt data
- [ ] Analytics dashboard for academy owner

## Troubleshooting Common Issues

### Issue: Belt not showing
**Solution**: Check member has `current_belt_id` set in database

### Issue: Eligibility shows wrong data
**Solution**: Verify `get_promotion_eligibility()` function exists and `total_classes_attended` is accurate

### Issue: Promotion fails
**Solution**: Check `promoted_by` is valid instructor ID and belt progression is valid

### Issue: Colors look wrong
**Solution**: Verify belt name matches exactly (case-sensitive)

### Issue: Trigger not firing
**Solution**: Re-run `supabase/belt_progression.sql` to recreate trigger

## Success Criteria

System is ready for production when:

✅ All members have belts assigned
✅ Admin can promote members successfully
✅ Members can view belt progress
✅ Certificates generate and print correctly
✅ Notifications send (if configured)
✅ No errors in production logs
✅ Mobile responsive on all devices
✅ Performance under 2 seconds for all pages

## Completion

- [ ] All checklist items complete
- [ ] System tested end-to-end
- [ ] Team trained on promotion workflow
- [ ] Production deployment successful
- [ ] Monitoring in place

**Date Completed**: _______________

**Completed By**: _______________

**Notes**: _______________________________________________

---

🥋 **Congratulations! The BJJ Belt System is live!**

Next promote your first member and watch them celebrate their achievement.
