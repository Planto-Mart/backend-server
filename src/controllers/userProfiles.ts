import { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { userProfiles } from '../db/schema';

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


export const getProfileByUUID = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const uuid = c.req.param('uuid');

    if (!uuid) {
      return c.json({ success: false, message: 'UUID is required.' }, 400);
    }

    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.uuid, uuid))
      .limit(1);

    if (profile.length === 0) {
      return c.json({ success: false, message: 'Profile not found.' }, 404);
    }

    return c.json({
      success: true,
      message: 'Profile fetched successfully!',
      data: profile[0],
    });
  } catch (error) {
    console.error('Error fetching profile by UUID:', error);
    return c.json({ success: false, message: 'Internal server error.' }, 500);
  }
};

export const updateProfileByUUID = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const uuid = c.req.param('uuid'); // Fetch UUID from URL parameter
    const fieldsToUpdate = await c.req.json(); // Extract fields to update from the request body

    // Validate if UUID is provided and that at least one field to update is passed
    if (!uuid || Object.keys(fieldsToUpdate).length === 0) {
      return c.json({
        success: false,
        message: 'UUID and at least one field to update are required.',
      }, 400);
    }

    // Check if the provided email is valid if it's part of the fieldsToUpdate
    if (fieldsToUpdate.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldsToUpdate.email)) {
      return c.json({
        success: false,
        message: 'Invalid email address.',
      }, 400);
    }

    // Check if the profile with the given UUID exists
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.uuid, uuid))
      .limit(1);

    if (existingProfile.length === 0) {
      return c.json({
        success: false,
        message: `No profile found with UUID ${uuid}.`,
      }, 404);
    }

    // Update the profile with the provided fields
    const result = await db
      .update(userProfiles)
      .set(fieldsToUpdate)
      .where(eq(userProfiles.uuid, uuid))
      .run() as any;

    // Check if any rows were affected (meaning the update actually happened)
    if (result.rowsAffected === 0) {
      return c.json({
        success: false,
        message: `No changes were made to the profile with UUID ${uuid}.`,
      }, 404);
    }

    // Return success message with updated data
    return c.json({
      success: true,
      message: `Profile with UUID ${uuid} updated successfully.`,
      data: {
        ...existingProfile[0],
        ...fieldsToUpdate, // Return updated fields as part of the response
      },
    });
  } catch (error) {
    console.error('Error updating profile by UUID:', error);
    return c.json({
      success: false,
      message: 'Internal server error.',
    }, 500);
  }
};
