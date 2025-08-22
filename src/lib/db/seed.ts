import { db } from './index';
import { products } from './schema';

const sampleProducts = [
  {
    name: 'Nike Air Max 270',
    description: 'The Nike Air Max 270 delivers visible Air Max cushioning from heel to toe with the tallest Air Max heel yet.',
    price: '150.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-270-shoes-by-you.png',
    category: 'shoes',
    brand: 'Nike',
    sizes: JSON.stringify(['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']),
    colors: JSON.stringify(['Black', 'White', 'Red', 'Blue']),
    stock: 50,
    featured: true,
  },
  {
    name: 'Nike Air Force 1 07',
    description: 'The Nike Air Force 1 07 brings a fresh take on the classic basketball shoe with premium leather and Air-Sole cushioning.',
    price: '90.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png',
    category: 'shoes',
    brand: 'Nike',
    sizes: JSON.stringify(['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']),
    colors: JSON.stringify(['White', 'Black', 'Triple White']),
    stock: 75,
    featured: true,
  },
  {
    name: 'Nike React Infinity Run Flyknit 3',
    description: 'Designed to help reduce injury and keep you on the run, the Nike React Infinity Run Flyknit 3 provides soft, responsive cushioning.',
    price: '160.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/fb7eda3c-5ac8-4d05-a18f-1c2c5e82e36e/react-infinity-run-flyknit-3-road-running-shoes-XJFBlC.png',
    category: 'shoes',
    brand: 'Nike',
    sizes: JSON.stringify(['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']),
    colors: JSON.stringify(['Black', 'White', 'Blue', 'Pink']),
    stock: 30,
    featured: false,
  },
  {
    name: 'Nike Dunk Low',
    description: 'Created for the hardwood but taken to the streets, the Nike Dunk Low returns with crisp overlays and original team colors.',
    price: '100.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/af53d53d-561f-450a-a483-70a7ceee380f/dunk-low-shoes-t9dFBG.png',
    category: 'shoes',
    brand: 'Nike',
    sizes: JSON.stringify(['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']),
    colors: JSON.stringify(['White/Black', 'Black/White', 'University Blue', 'Chicago']),
    stock: 40,
    featured: true,
  },
  {
    name: 'Nike Air Jordan 1 Low',
    description: 'Inspired by the original that debuted in 1985, the Air Jordan 1 Low offers a clean, classic look that is familiar yet fresh.',
    price: '90.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/7c5678f4-c28d-4862-a8d9-56750f839f12/air-jordan-1-low-shoes-zTWr6L.png',
    category: 'shoes',
    brand: 'Nike',
    sizes: JSON.stringify(['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13']),
    colors: JSON.stringify(['White', 'Black', 'Bred', 'Royal Blue']),
    stock: 60,
    featured: true,
  },
  {
    name: 'Nike Blazer Mid 77 Vintage',
    description: 'In the 70s, Nike was the new shoe on the block. The Nike Blazer Mid 77 Vintage brings that vintage look with modern comfort.',
    price: '100.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/0a441507-ae95-444b-8e1f-4f3f8b4dd2b1/blazer-mid-77-vintage-shoes-nw30B2.png',
    category: 'shoes',
    brand: 'Nike',
    sizes: JSON.stringify(['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']),
    colors: JSON.stringify(['White', 'Black', 'Sail', 'University Blue']),
    stock: 35,
    featured: false,
  },
  {
    name: 'Nike Air Max 90',
    description: 'Nothing as fly, nothing as comfortable, nothing as proven. The Nike Air Max 90 stays true to its OG running roots.',
    price: '90.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/zwxes8uud05rkuei1mpt/air-max-90-shoes-6xjB3L.png',
    category: 'shoes',
    brand: 'Nike',
    sizes: JSON.stringify(['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']),
    colors: JSON.stringify(['White', 'Black', 'Infrared', 'Triple White']),
    stock: 45,
    featured: true,
  },
  {
    name: 'Nike Cortez',
    description: 'The Nike Cortez is a classic running shoe that helped establish Nike as a major player in the athletic footwear industry.',
    price: '70.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/882d481b-62d5-442b-aaec-4c2d1b82c7c9/cortez-shoes-jLVBV2.png',
    category: 'shoes',
    brand: 'Nike',
    sizes: JSON.stringify(['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']),
    colors: JSON.stringify(['White/Red', 'Black/White', 'Navy/White']),
    stock: 25,
    featured: false,
  }
];

export async function seedProducts() {
  try {
    console.log('🌱 Seeding products...');
    
    // Clear existing products
    await db.delete(products);
    
    // Insert sample products
    const insertedProducts = await db.insert(products).values(sampleProducts).returning();
    
    console.log(`✅ Successfully seeded ${insertedProducts.length} products!`);
    return insertedProducts;
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log('Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}