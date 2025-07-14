import { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { products } from '../db/schema';

export const createProduct = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();
    
    const {
      product_id,
      slug,
      title,
      description,
      category,
      about_in_bullets,
      image_gallery,
      price,
      brand,
      vendorID,
      raiting,
      reviewNumbers,
      reviews,
      quantity,
      discount_percent,
      discountPrice,
      variants,
      variantState,
      featured,
    } = body;

    // Validate required fields
    if (
      !product_id ||
      !slug ||
      !title ||
      !category ||
      !description ||
      !about_in_bullets ||
      !price ||
      !brand ||
      !vendorID
    ) {
      return c.json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Prepare the data for insertion into the database
    const result = await db.insert(products).values({
      product_id,
      slug,
      title,
      description,
      category,
      about_in_bullets, // Drizzle handles JSON conversion with mode: "json"
      image_gallery, // Drizzle handles JSON conversion with mode: "json"
      price,
      brand,
      vendorID,
      raiting: raiting ?? 0, // Default to 0 if not provided
      reviewNumbers: reviewNumbers ?? 0, // Default to 0 if not provided
      reviews: reviews ?? null, // Drizzle handles JSON conversion with mode: "json"
      quantity: quantity ?? 0, // Default to 0 if not provided
      discountPercent: discount_percent ?? null, // Match schema field name
      discountPrice: discountPrice ?? null,
      variants: variants ?? null, // Drizzle handles JSON conversion with mode: "json"
      variantState: variantState ?? false, // Use boolean directly with mode: "boolean"
      featured: featured ?? false, // Use boolean directly with mode: "boolean"
    });

    // Return success response with product details
    return c.json({
      success: true,
      message: 'Product created successfully',
      data: result,
    });

  } catch (error) {
    console.error('Error creating product: ', error);
    return c.json(
      {
        success: false,
        message: 'Internal Server Error, Please try again later',
      },
      500
    );
  }
};

export const getAllProducts = async (c: Context)=>{
  try {
    const db = drizzle(c.env.DB);
    const allProducts = await db.select().from(products).all();
    return c.json({
      success: true,
      data: allProducts
    });

  } catch (error) {
    console.error("Error fetching products: ", error);
    return c.json({
      success: false,
      message: "Internal Server Error, Please try again later"
    })
    
  }
}