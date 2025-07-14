import { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { vendorProfiles } from '../db/schema';

// REGISTER A NEW VENDOR
export const vendorRegister = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();

    const {
      user_uuid,
      slug,
      name,
      description,
      banner_image,
      logo,
      image_gallery,
      rating,
      about_us,
      features,
      business_name,
      business_address,
      business_registration_number,
      gstin_number,
      pan_number,
      legal_structure,
      contact_person_name,
      contact_email,
      contact_phone,
      bank_account_number,
      bank_name,
      ifsc_code,
      shipping_fee_mode,
      gst_rate,
      return_policy,
      shipping_policy,
      privacy_policy,
      seller_terms,
      business_license,
      identity_verification,
      is_verified,
      status,
    } = body;

    if (!user_uuid || !slug || !name || !contact_email) {
      return c.json({
        success: false,
        message: 'Required fields: user_uuid, slug, name, contact_email',
      }, 400);
    }

    const result = await db.insert(vendorProfiles).values({
      user_uuid,
      slug,
      name,
      description,
      banner_image,
      logo,
      image_gallery,
      rating,
      about_us,
      features,
      business_name,
      business_address,
      business_registration_number,
      gstin_number,
      pan_number,
      legal_structure,
      contact_person_name,
      contact_email,
      contact_phone,
      bank_account_number,
      bank_name,
      ifsc_code,
      shipping_fee_mode,
      gst_rate,
      return_policy,
      shipping_policy,
      privacy_policy,
      seller_terms,
      business_license,
      identity_verification,
      is_verified: is_verified ?? 0,
      status: status ?? 'pending',
    });

    return c.json({
      success: true,
      message: 'Vendor registered successfully',
      data: result,
    });

  } catch (error) {
    console.error('Error registering vendor:', error);
    return c.json({
      success: false,
      message: 'Internal Server Error',
    }, 500);
  }
};

// UPDATE VENDOR
export const updateVendor = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const vendorID = c.req.param('vendor_id');
    const fieldsToUpdate = await c.req.json();

    if (!vendorID || Object.keys(fieldsToUpdate).length === 0) {
      return c.json({
        success: false,
        message: 'Vendor ID and at least one field to update are required.',
      }, 400);
    }

    const result = await db
      .update(vendorProfiles)
      .set(fieldsToUpdate)
      .where(eq(vendorProfiles.id, Number(vendorID)))
      .run() as any;

    if (result.rowsAffected === 0) {
      return c.json({
        success: false,
        message: `No vendor found with ID ${vendorID} or nothing changed.`,
      }, 404);
    }

    return c.json({
      success: true,
      message: `Vendor with ID ${vendorID} updated successfully.`,
      data: result,
    });

  } catch (error) {
    console.error('Error updating vendor:', error);
    return c.json({
      success: false,
      message: 'Internal Server Error',
    }, 500);
  }
};

// DELETE VENDOR
export const deleteVendor = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const vendorID = c.req.param('vendor_id');

    if (!vendorID) {
      return c.json({
        success: false,
        message: 'Vendor ID is required',
      }, 400);
    }

    const deleted = await db
      .delete(vendorProfiles)
      .where(eq(vendorProfiles.id, Number(vendorID)))
      .run();

    return c.json({
      success: true,
      message: `Vendor with ID ${vendorID} deleted successfully.`,
      data: deleted,
    });

  } catch (error) {
    console.error('Error deleting vendor:', error);
    return c.json({
      success: false,
      message: 'Internal Server Error',
    }, 500);
  }
};

// GET ALL VENDORS - ADMIN
export const getAllVendorsAdmin = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const vendors = await db.select().from(vendorProfiles).all();

    return c.json({
      success: true,
      message: `Fetched ${vendors.length} vendors (admin)`,
      data: vendors,
    });

  } catch (error) {
    console.error('Error fetching vendors (admin):', error);
    return c.json({
      success: false,
      message: 'Internal Server Error',
    }, 500);
  }
};

// GET ALL VENDORS - PUBLIC (Safe Fields Only)
export const getAllVendorsPublic = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const vendors = await db.select().from(vendorProfiles).all();

    const safeVendors = vendors.map(({ id, slug, name, description, banner_image, logo, image_gallery, rating, about_us, features, business_name, business_address, contact_person_name, contact_email, contact_phone, return_policy, shipping_policy, privacy_policy, seller_terms, is_verified, status }) => ({
      id,
      slug,
      name,
      description,
      banner_image,
      logo,
      image_gallery,
      rating,
      about_us,
      features,
      business_name,
      business_address,
      contact_person_name,
      contact_email,
      contact_phone,
      return_policy,
      shipping_policy,
      privacy_policy,
      seller_terms,
      is_verified,
      status,
    }));

    return c.json({
      success: true,
      message: `Fetched ${safeVendors.length} vendors (public)`,
      data: safeVendors,
    });

  } catch (error) {
    console.error('Error fetching vendors (public):', error);
    return c.json({
      success: false,
      message: 'Internal Server Error',
    }, 500);
  }
};

// GET VENDOR BY ID - ADMIN
export const getVendorByIdAdmin = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const vendorID = c.req.param('vendor_id');

    const vendor = await db.select().from(vendorProfiles).where(eq(vendorProfiles.id, Number(vendorID))).get();

    if (!vendor) {
      return c.json({
        success: false,
        message: `Vendor with ID ${vendorID} not found`,
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Vendor fetched successfully (admin)',
      data: vendor,
    });

  } catch (error) {
    console.error('Error fetching vendor by ID (admin):', error);
    return c.json({
      success: false,
      message: 'Internal Server Error',
    }, 500);
  }
};

// GET VENDOR BY ID - PUBLIC
export const getVendorByIdPublic = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const vendorID = c.req.param('vendor_id');

    const vendor = await db.select().from(vendorProfiles).where(eq(vendorProfiles.id, Number(vendorID))).get();

    if (!vendor) {
      return c.json({
        success: false,
        message: `Vendor with ID ${vendorID} not found`,
      }, 404);
    }

    const {
      id,
      slug,
      name,
      description,
      banner_image,
      logo,
      image_gallery,
      rating,
      about_us,
      features,
      business_name,
      business_address,
      contact_person_name,
      contact_email,
      contact_phone,
      return_policy,
      shipping_policy,
      privacy_policy,
      seller_terms,
      is_verified,
      status
    } = vendor;

    return c.json({
      success: true,
      message: 'Vendor fetched successfully (public)',
      data: {
        id,
        slug,
        name,
        description,
        banner_image,
        logo,
        image_gallery,
        rating,
        about_us,
        features,
        business_name,
        business_address,
        contact_person_name,
        contact_email,
        contact_phone,
        return_policy,
        shipping_policy,
        privacy_policy,
        seller_terms,
        is_verified,
        status
      }
    });

  } catch (error) {
    console.error('Error fetching vendor by ID (public):', error);
    return c.json({
      success: false,
      message: 'Internal Server Error',
    }, 500);
  }
};