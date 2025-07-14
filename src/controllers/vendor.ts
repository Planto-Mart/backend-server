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
