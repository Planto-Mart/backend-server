import { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { contactUs, newsletterSubscribers, userProfiles } from '../db/schema';

export const getAllProfiles = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);

    // Fetch all profiles from the database
    const profiles = await db.select().from(userProfiles).all();

    return c.json({
      success: true,
      message: 'Profiles fetched successfully!',
      total: profiles.length,
      data: profiles,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return c.json({
      success: false,
      message: 'Internal server error. Please try again later.'
    }, 500);
  }
};

export const subscribeToNewsletter = async (c: Context) => {
  try {
    // Get the database instance from the context
    const db = drizzle(c.env.DB);
    
    // Extract email from request body
    const body = await c.req.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return c.json(
        {
          success: false,
          message: 'Email is required'
        },
        400
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json(
        {
          success: false,
          message: 'Please provide a valid email address'
        },
        400
      );
    }

    // Check if email already exists
    const existingSubscriber = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email.toLowerCase()))
      .limit(1);

    if (existingSubscriber.length > 0) {
      // If user exists but is unsubscribed, resubscribe them
      if (!existingSubscriber[0].subscribed) {
        await db
          .update(newsletterSubscribers)
          .set({
            subscribed: true,
            createdAt: new Date().toISOString()
          })
          .where(eq(newsletterSubscribers.email, email.toLowerCase()));

        return c.json({
          success: true,
          message: 'Successfully resubscribed to newsletter!'
        });
      }

      return c.json(
        {
          success: false,
          message: 'Email is already subscribed to the newsletter'
        },
        409
      );
    }

    // Insert new subscriber
    const result = await db
      .insert(newsletterSubscribers)
      .values({
        email: email.toLowerCase(),
        subscribed: true,
        createdAt: new Date().toISOString()
      })
      .returning();

    return c.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      data: {
        id: result[0].id,
        email: result[0].email,
        subscribedAt: result[0].createdAt
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    // Handle unique constraint violation (in case of race condition)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return c.json(
        {
          success: false,
          message: 'Email is already subscribed to the newsletter'
        },
        409
      );
    }

    return c.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.'
      },
      500
    );
  }
};

export const createProfile = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();
    const { full_name, email, uuid, avatar_url='https://avatar.iran.liara.run/public/boy?username=[8]' } = body;

    // Basic Validation
    if (!full_name || !email  || !uuid ) {
      return c.json({ success: false, message: 'All fields are required.' }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ success: false, message: 'Invalid email address.' }, 400);
    }

    // Insert into appointmentBooking table
    const result = await db.insert(userProfiles).values({
      uuid,
      full_name,
      email: email.toLowerCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avatar_url,
    }).returning();

    return c.json({
      success: true,
      message: 'Profile create successfully!',
      data: {
        id: result[0].id,
        name: result[0].full_name,
        email: result[0].email,
        phone: result[0].phone,
        createdAt: result[0].created_at
      }
    });

  } catch (error) {
    console.error('Profile Creation error:', error);
    return c.json({
      success: false,
      message: 'Internal server error. Please try again later.'
    }, 500);
  }
};

export const submitContactUsForm = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();
    const { name, email, subject, description } = body;

    // Basic validation
    if (!name || !email || !subject || !description) {
      return c.json({ success: false, message: 'All fields are required.' }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ success: false, message: 'Invalid email address.' }, 400);
    }

    const result = await db.insert(contactUs).values({
      name,
      email: email.toLowerCase(),
      subject,
      description,
      createdAt: new Date().toISOString()
    }).returning();

    return c.json({
      success: true,
      message: 'Your message has been received!',
      data: {
        id: result[0].id,
        submittedAt: result[0].createdAt
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return c.json({ success: false, message: 'Internal server error. Please try again later.' }, 500);
  }
};