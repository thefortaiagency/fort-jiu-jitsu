import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/email';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature for production security
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret) {
      // Production: Verify signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✓ Webhook signature verified');
    } else {
      // Development: Skip verification (but log warning)
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET not set - skipping signature verification');
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      {
        error: 'Invalid signature',
        message: err instanceof Error ? err.message : 'Signature verification failed',
      },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const memberId = session.metadata?.member_id;
        const membershipType = session.metadata?.membership_type as 'kids' | 'adult' | 'drop-in' | undefined;

        if (memberId) {
          // Update member status to active
          const { data: updatedMember } = await supabase
            .from('members')
            .update({
              status: 'active',
              payment_status: 'active',
              stripe_subscription_id: session.subscription as string || null,
              last_payment_date: new Date().toISOString(),
            })
            .eq('id', memberId)
            .select('first_name, last_name, email, birth_date, parent_first_name, parent_last_name, parent_email, program')
            .single();

          console.log(`Member ${memberId} activated after successful payment`);

          // Send welcome email
          if (updatedMember) {
            try {
              // Calculate if member is a minor
              const birthDate = new Date(updatedMember.birth_date);
              const today = new Date();
              const age = today.getFullYear() - birthDate.getFullYear();
              const isMinor = age < 18;

              // Determine membership type from metadata or program
              let finalMembershipType: 'kids' | 'adult' | 'drop-in' = membershipType || 'adult';
              if (!membershipType && updatedMember.program) {
                if (updatedMember.program.includes('kid')) {
                  finalMembershipType = 'kids';
                }
              }

              await sendWelcomeEmail({
                firstName: updatedMember.first_name,
                lastName: updatedMember.last_name,
                email: updatedMember.email,
                membershipType: finalMembershipType,
                isMinor,
                parentFirstName: updatedMember.parent_first_name || undefined,
                parentLastName: updatedMember.parent_last_name || undefined,
                parentEmail: updatedMember.parent_email || undefined,
              });

              console.log(`Welcome email sent to ${updatedMember.email}`);
            } catch (emailError) {
              console.error('Failed to send welcome email:', emailError);
              // Don't fail the webhook if email fails
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const isFamilySubscription = subscription.metadata?.is_family_subscription === 'true';

        if (isFamilySubscription) {
          // Handle family subscription update
          const familyAccountId = subscription.metadata?.family_account_id;
          const memberCount = parseInt(subscription.metadata?.member_count || '0', 10);
          const monthlyRate = parseFloat(subscription.metadata?.monthly_rate || '0');

          // Update all family members
          const { data: familyMembers } = await supabase
            .from('members')
            .select('id')
            .or(`id.eq.${familyAccountId},family_account_id.eq.${familyAccountId}`);

          if (familyMembers) {
            const memberIds = familyMembers.map((m) => m.id);
            const status = subscription.status === 'active' ? 'active' : 'past_due';

            await supabase
              .from('members')
              .update({
                status: status,
                payment_status: subscription.status,
              })
              .in('id', memberIds);

            console.log(
              `Family ${familyAccountId} (${memberCount} members) subscription updated to ${subscription.status}`
            );
          }

          // Update family_accounts table
          if (familyAccountId) {
            await supabase
              .from('family_accounts')
              .update({
                stripe_subscription_id: subscription.id,
                total_members: memberCount,
                monthly_rate: monthlyRate,
                is_active: subscription.status === 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('primary_member_id', familyAccountId);
          }
        } else {
          // Handle individual subscription update
          const { data: member } = await supabase
            .from('members')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (member) {
            const status = subscription.status === 'active' ? 'active' : 'past_due';
            await supabase
              .from('members')
              .update({
                status: status,
                payment_status: subscription.status,
              })
              .eq('id', member.id);

            console.log(`Member ${member.id} subscription updated to ${subscription.status}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const isFamilySubscription = subscription.metadata?.is_family_subscription === 'true';

        if (isFamilySubscription) {
          // Handle family subscription cancellation
          const familyAccountId = subscription.metadata?.family_account_id;

          // Update all family members to cancelled
          const { data: familyMembers } = await supabase
            .from('members')
            .select('id')
            .or(`id.eq.${familyAccountId},family_account_id.eq.${familyAccountId}`);

          if (familyMembers) {
            const memberIds = familyMembers.map((m) => m.id);

            await supabase
              .from('members')
              .update({
                status: 'cancelled',
                payment_status: 'cancelled',
              })
              .in('id', memberIds);

            console.log(`Family ${familyAccountId} subscription cancelled`);
          }

          // Update family_accounts table
          if (familyAccountId) {
            await supabase
              .from('family_accounts')
              .update({
                is_active: false,
                updated_at: new Date().toISOString(),
              })
              .eq('primary_member_id', familyAccountId);
          }
        } else {
          // Handle individual subscription cancellation
          const { data: member } = await supabase
            .from('members')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (member) {
            await supabase
              .from('members')
              .update({
                status: 'cancelled',
                payment_status: 'cancelled',
              })
              .eq('id', member.id);

            console.log(`Member ${member.id} subscription cancelled`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find member by Stripe customer ID
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (member) {
          await supabase
            .from('members')
            .update({
              payment_status: 'past_due',
            })
            .eq('id', member.id);

          console.log(`Member ${member.id} payment failed`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find member by Stripe customer ID
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (member) {
          await supabase
            .from('members')
            .update({
              payment_status: 'active',
              last_payment_date: new Date().toISOString(),
            })
            .eq('id', member.id);

          console.log(`Member ${member.id} payment succeeded`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
