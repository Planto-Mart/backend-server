import { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
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