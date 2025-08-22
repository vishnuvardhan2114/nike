import { db } from '../db';
import { products } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

export async function getProducts() {
  try {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getFeaturedProducts() {
  try {
    return await db
      .select()
      .from(products)
      .where(eq(products.featured, true))
      .orderBy(desc(products.createdAt));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function getProductById(id: number) {
  try {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
