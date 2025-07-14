import { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { products } from '../db/schema';

// CREATE PRODUCT
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

    const result = await db.insert(products).values({
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
      raiting: raiting ?? 0,
      reviewNumbers: reviewNumbers ?? 0,
      reviews: reviews ?? null,
      quantity: quantity ?? 0,
      discountPercent: discount_percent ?? null,
      discountPrice: discountPrice ?? null,
      variants: variants ?? null,
      variantState: variantState ?? false,
      featured: featured ?? false,
    });

    return c.json({
      success: true,
      message: 'Product created successfully',
      data: result,
    });

  } catch (error) {
    console.error('Error creating product: ', error);
    return c.json({
      success: false,
      message: 'Internal Server Error, Please try again later',
    }, 500);
  }
};

// GET ALL PRODUCTS
export const getAllProducts = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const allProducts = await db.select().from(products).all();
    return c.json({
      success: true,
      message: `All ${allProducts.length} products fetched successfully`,
      data: allProducts,
    });

  } catch (error) {
    console.error("Error fetching products: ", error);
    return c.json({
      success: false,
      message: "Internal Server Error, Please try again later"
    }, 500);
  }
};

// DELETE PRODUCT
export const deleteProduct = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const productId = c.req.param('product_id');

    if (!productId) {
      return c.json({
        success: false,
        message: "Product ID is required",
      }, 400);
    }

    const deleted = await db.delete(products).where(eq(products.product_id, productId)).run();

    return c.json({
      success: true,
      message: `Product with ID ${productId} deleted successfully.`,
      data: deleted
    });
  } catch (error) {
    console.error("Error deleting product: ", error);
    return c.json({
      success: false,
      message: "Internal Server Error, Please try again later"
    }, 500);
  }
};

// Update Product
export const updateProduct = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const product_id = c.req.param('product_id');
    const fieldsToUpdate = await c.req.json();

    if (!product_id || Object.keys(fieldsToUpdate).length === 0) {
      return c.json({
        success: false,
        message: 'Product ID in URL param and at least one field in body are required.',
      }, 400);
    }

    const result = await db
      .update(products)
      .set(fieldsToUpdate)
      .where(eq(products.product_id, product_id))
      .run() as any; // Cloudflare’s D1Result<T> is typed generically, but doesn’t expose rowsAffected directly in TypeScript, even though it's available at runtime in most run() calls. Drizzle/ORM doesn't bridge that type deeply for D1 yet.

    if (result.rowsAffected === 0) {
      return c.json({
        success: false,
        message: `No product found with ID ${product_id} or nothing changed.`,
      }, 404);
    }

    return c.json({
      success: true,
      message: `Product with ID ${product_id} updated successfully.`,
      data: result,
    });

  } catch (error) {
    console.error("Error updating product: ", error);
    return c.json({
      success: false,
      message: "Internal Server Error, Please try again later"
    }, 500);
  }
};
