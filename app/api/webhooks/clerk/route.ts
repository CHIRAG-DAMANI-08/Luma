import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  console.log("WEBHOOK RECEIVED");

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Svix headers missing');
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Webhook event type: ${eventType}`);

  if(eventType === 'user.created') {
    console.log('Processing user.created event');
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses[0]?.email_address;

    if(!id || !email) {
        console.error('Missing data for user.created event');
        return new Response('Error occured -- missing data', {
            status: 400
        })
    }

    const name = [first_name, last_name].filter(Boolean).join(' ').trim();

    try {
      await prisma.user.create({
          data: {
              clerkId: id,
              email: email,
              name: name || '',
          }
      })
      console.log('User successfully created in database');
    } catch (dbError) {
      console.error('Database error while creating user:', dbError);
      return new Response('Database error', { status: 500 });
    }

    return new Response('User created', { status: 201 })
  }

  console.log(`Webhook event type ${eventType} not handled`);
  return new Response('', { status: 200 })
}
