import { NextResponse } from "next/server";
import {
  PrismaClient,
  ProductStatus,
  OrderStatus,
} from "@/lib/generated/prisma";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// 🔐 Dummy Argon2 password (use your real hashed password)
const DUMMY_PASSWORD =
  "$argon2id$v=19$m=65536,t=3,p=4$oTfBlJjwFXLyr8hj8I8LrQ$7vd6LYWLfrzgXSaWiuwXFMkrH6O9t0Jlw+/f4WwyIlQ";

/* --------------------------------------------------------------
   CATEGORY SEEDER (recursive 3-level)
-------------------------------------------------------------- */
async function seedCategories() {
  const createCategory = async (
    name: string,
    parentId: number | null = null,
    depth = 0
  ) => {
    const category = await prisma.category.create({
      data: { name, parentId },
    });

    if (depth < 2) {
      for (let i = 0; i < 2; i++) {
        await createCategory(
          faker.commerce.department(),
          category.id,
          depth + 1
        );
      }
    }
    return category;
  };

  for (let i = 0; i < 3; i++) {
    await createCategory(faker.commerce.department());
  }
}

/* --------------------------------------------------------------
   PERMISSION + ROLE SEEDER
-------------------------------------------------------------- */
async function seedPermissionsAndRoles() {
  const permissionNames = [
    "list_user",
    "view_user",
    "edit_user",
    "remove_user",
    "create_user",
    "detail_user",
    "profile_upload_user",
    "list_role",
    "multiple_upload",
    "create_media",
    "list_media",
    "create_product",
    "category_list",
    "product_detail",
    "order_list",
    "order_detail",
    "order_update",
  ];

  const permissions = await Promise.all(
    permissionNames.map((p) =>
      prisma.permission.upsert({
        where: { name: p },
        update: {},
        create: { name: p, slug: faker.string.uuid() },
      })
    )
  );

  const adminRole = await prisma.role.create({
    data: {
      name: "Admin",
      slug: faker.string.uuid(),
      permissions: {
        create: permissions.map((p) => ({
          permissionId: p.id,
          slug: faker.string.uuid(),
        })),
      },
    },
  });

  return adminRole;
}

/* --------------------------------------------------------------
   USER SEEDER
-------------------------------------------------------------- */
async function seedUsers(roleId: number) {
  return Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: DUMMY_PASSWORD,
          roleId,
          slug: faker.string.uuid(),
          profilePicture: faker.image.avatar(),
        },
      })
    )
  );
}

/* --------------------------------------------------------------
   CUSTOMER SEEDER (UPDATED WITH USERNAME + PASSWORD + STATUS)
-------------------------------------------------------------- */
async function seedCustomers() {
  return Promise.all(
    Array.from({ length: 30 }).map(() =>
      prisma.customer.create({
        data: {
          slug: faker.string.uuid(),

          username: faker.internet.username().toLowerCase(),
          password: DUMMY_PASSWORD,

          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),

          addressLine1: faker.location.streetAddress(),
          addressLine2: faker.location.secondaryAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),

          // ⭐ If you added "status" to Customer model
          status: "ACTIVE",
        },
      })
    )
  );
}

/* --------------------------------------------------------------
   PRODUCTS + VARIANTS + MEDIA
-------------------------------------------------------------- */
async function seedProducts(users: { id: number }[]) {
  const categories = await prisma.category.findMany({
    take: 5,
    orderBy: { id: "asc" },
  });

  const statuses: ProductStatus[] = [
    ProductStatus.DRAFT,
    ProductStatus.PUBLISHED,
    ProductStatus.RECOVERED,
  ];

  const products: { id: number }[] = [];

  for (let i = 0; i < 20; i++) {
    const product = await prisma.product.create({
      data: {
        title: faker.commerce.productName(),
        description: { text: faker.commerce.productDescription() },
        productCode: faker.string.alphanumeric(8).toUpperCase(),
        price: Number(faker.commerce.price()),
        slug: faker.string.uuid(),
        status: faker.helpers.arrayElement(statuses),
        categoryId: faker.helpers.arrayElement(categories).id,
      },
    });

    products.push(product);

    /* VARIANTS */
    await prisma.variant.createMany({
      data: [
        {
          productId: product.id,
          size: "M",
          color: "Black",
          material: "Cotton",
          price: Number(faker.commerce.price()),
          stock: faker.number.int({ min: 5, max: 20 }),
          slug: faker.string.uuid(),
        },
        {
          productId: product.id,
          size: "L",
          color: "Red",
          material: "Polyester",
          price: Number(faker.commerce.price()),
          stock: faker.number.int({ min: 5, max: 20 }),
          slug: faker.string.uuid(),
        },
      ],
    });

    /* MEDIA */
    await prisma.media.create({
      data: {
        filename: "product.jpg",
        storedFilename: `${uuidv4()}.jpg`,
        url: faker.image.url(),
        type: "IMAGE",
        mimetype: "image/jpeg",
        extension: "jpg",
        size: 240000,
        title: "Product Image",
        description: "Auto-generated demo image",
        visibility: "PUBLIC",
        slug: faker.string.uuid(),
        uploadedById: faker.helpers.arrayElement(users).id,
        productId: product.id,
      },
    });
  }

  return products;
}

/* --------------------------------------------------------------
   ORDER + ORDER ITEMS SEEDER (WITH orderedAt)
-------------------------------------------------------------- */
async function seedOrders(
  customers: { id: number }[],
  products: { id: number }[]
) {
  for (let i = 0; i < 30; i++) {
    const customer = faker.helpers.arrayElement(customers);

    const randomDate = faker.date.recent({ days: 30 }); // ⭐ Important

    const order = await prisma.order.create({
      data: {
        slug: faker.string.uuid(),
        customerId: customer.id,
        status: faker.helpers.arrayElement([
          OrderStatus.PENDING,
          OrderStatus.PROCESSING,
          OrderStatus.COMPLETED,
          OrderStatus.CANCELLED,
        ]),

        totalAmount: 0,
        subtotal: 0,

        orderedAt: randomDate, // ⭐ NEW FIELD
      },
    });

    let subtotal = 0;
    const selectedProducts = faker.helpers.arrayElements(products, 2);

    for (const p of selectedProducts) {
      const variant = await prisma.variant.findFirst({
        where: { productId: p.id },
      });

      const quantity = faker.number.int({ min: 1, max: 3 });
      const price = variant?.price ?? 0;
      const total = price * quantity;

      subtotal += total;

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: p.id,
          variantId: variant?.id ?? null,
          quantity,
          price,
          total,
        },
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        subtotal,
        totalAmount: subtotal,
      },
    });
  }
}

/* --------------------------------------------------------------
   MAIN SEED EXECUTION
-------------------------------------------------------------- */
export async function POST() {
  try {
    console.log("🌱 Running Seeder...");

    await seedCategories();
    const adminRole = await seedPermissionsAndRoles();
    const users = await seedUsers(adminRole.id);
    const customers = await seedCustomers();
    const products = await seedProducts(users);
    await seedOrders(customers, products);

    return NextResponse.json({ message: "🌱 Seeding Completed!" });
  } catch (error) {
    console.error("❌ SEED ERROR:", error);
    return NextResponse.json(
      { error: "Seed failed", detail: String(error) },
      { status: 500 }
    );
  }
}
