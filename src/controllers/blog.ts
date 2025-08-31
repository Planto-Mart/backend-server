import { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { blogs } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export const createBlogPost = async (c: Context) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();

  const {
    title,slug,content,excerpt,category,tags,authorName,authorId,
    featuredImage,isFeatured = false,isPublished = false,seoTitle,seoDescription
    } = body;

  if (!title || !slug || !content || !category || !authorName) {
    return c.json({ success: false, message: 'Missing required fields' }, 400);
  }

  try {
    const result = await db.insert(blogs).values({
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      authorName,
      authorId,
      featuredImage,
      isFeatured,
      isPublished,
      seoTitle,
      seoDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();

    return c.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Create blog error:', error);
    return c.json({ success: false, message: 'Error creating blog post' }, 500);
  }
};

export const getAllBlogs = async (c: Context) => {
  const db = drizzle(c.env.DB);

  try {
    const result = await db.select().from(blogs).orderBy(desc(blogs.createdAt));
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, message: 'Error fetching blog posts' }, 500);
  }
};

export const getBlogBySlug = async (c: Context) => {
  const db = drizzle(c.env.DB);
  const slug = c.req.param('slug');

  try {
    const result = await db
      .select()
      .from(blogs)
      .where(eq(blogs.slug, slug))
      .limit(1);

    if (!result.length) {
      return c.json({ success: false, message: 'Blog not found' }, 404);
    }

    return c.json({ success: true, data: result[0] });
  } catch (error) {
    return c.json({ success: false, message: 'Error fetching blog' }, 500);
  }
};

export const getBlogsByCategory = async (c: Context) => {
  const db = drizzle(c.env.DB);
  const category = c.req.param('category');

  try {
    const result = await db
      .select()
      .from(blogs)
      .where(eq(blogs.category, category))
      .orderBy(desc(blogs.createdAt));

    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, message: 'Error fetching category blogs' }, 500);
  }
};

export const updateBlogPost = async (c: Context) => {
  const db = drizzle(c.env.DB);
  const slug = c.req.param('slug');
  const updates = await c.req.json();

  try {
    const result = await db
      .update(blogs)
      .set({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .where(eq(blogs.slug, slug))
      .returning();

    if (!result.length) {
      return c.json({ success: false, message: 'Blog not found' }, 404);
    }

    return c.json({ success: true, data: result[0] });
  } catch (error) {
    return c.json({ success: false, message: 'Error updating blog post' }, 500);
  }
};

export const deleteBlogPost = async (c: Context) => {
  const db = drizzle(c.env.DB);
  const slug = c.req.param('slug');

  try {
    const result = await db
      .delete(blogs)
      .where(eq(blogs.slug, slug));

    return c.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    return c.json({ success: false, message: 'Error deleting blog post' }, 500);
  }
};
