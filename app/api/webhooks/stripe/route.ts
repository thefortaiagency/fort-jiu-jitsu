import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // For production, you should verify the webhook signature
    // event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    // For now, just parse the event
    event = JSON.parse(body) as Stripe.Event;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const memberId = session.metadata?.member_id;

        if (memberId) {
          // Update member status to active
          await supabase
            .from('members')
            .update({
              status: 'active',
              payment_status: 'active',
              stripe_subscription_id: session.subscription as string || null,
              last_payment_date: new Date().toISOString(),
            })
            .eq('id', memberId);

          console.log(`Member ${memberId} activated after successful payment`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find member by Stripe customer ID
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
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

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
              status: 'cancelled',
              payment_status: 'cancelled',
            })
            .eq('id', member.id);

          console.log(`Member ${member.id} subscription cancelled`);
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
