// /app/api/dev/seed/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, ProductStatus, User } from "@/lib/generated/prisma";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const DUMMY_PASSWORD =
  "$argon2id$v=19$m=65536,t=3,p=4$oTfBlJjwFXLyr8hj8I8LrQ$7vd6LYWLfrzgXSaWiuwXFMkrH6O9t0Jlw+/f4WwyIlQ";

/* --------------------------------------------------------------
   SEED CATEGORIES (recursive 3-level)
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
    await createCategory(faker.commerce.department(), null, 0);
  }
}

/* --------------------------------------------------------------
   SEED ROLES + PERMISSIONS
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
   SEED USERS
-------------------------------------------------------------- */
async function seedUsers(roleId: number): Promise<User[]> {
  return Promise.all(
    Array.from({ length: 50 }).map(() =>
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
   SEED PRODUCTS + VARIANTS + MEDIA
-------------------------------------------------------------- */
async function seedProductsAndVariants(users: User[]) {
  const categories = await prisma.category.findMany({
    take: 5,
    orderBy: { id: "asc" },
  });

  const productStatuses: ProductStatus[] = [
    ProductStatus.DRAFT,
    ProductStatus.PUBLISHED,
    ProductStatus.DELETED,
    ProductStatus.RECOVERED,
  ];

  for (let i = 0; i < 10; i++) {
    const product = await prisma.product.create({
      data: {
        title: faker.commerce.productName(),
        description: { text: faker.commerce.productDescription() },
        price: Number(faker.commerce.price()),
        productCode: faker.string.alphanumeric(8).toUpperCase(),
        slug: faker.string.uuid(),

        /* 🔥 NEW: random status */
        status:
          productStatuses[Math.floor(Math.random() * productStatuses.length)],

        categoryId:
          categories[Math.floor(Math.random() * categories.length)].id,
      },
    });

    await prisma.variant.createMany({
      data: [
        {
          productId: product.id,
          size: "M",
          color: "Red",
          material: "Cotton",
          price: 49.99,
          stock: 10,
          slug: faker.string.uuid(),
        },
        {
          productId: product.id,
          size: "L",
          color: "Blue",
          material: "Leather",
          price: 59.99,
          stock: 15,
          slug: faker.string.uuid(),
        },
      ],
    });

    await prisma.media.create({
      data: {
        filename: "product.jpg",
        storedFilename: `${uuidv4()}.jpg`,
        url: faker.image.url(),
        type: "IMAGE",
        mimetype: "image/jpeg",
        extension: "jpg",
        size: 240000,
        title: "Product image",
        description: "Test image",
        visibility: "PUBLIC",
        slug: faker.string.uuid(),

        uploadedById: users[Math.floor(Math.random() * users.length)].id,

        productId: product.id,
      },
    });
  }
}

/* --------------------------------------------------------------
   POST /api/dev/seed
-------------------------------------------------------------- */
export async function POST() {
  try {
    console.log("🌱 Running Seeder...");

    await seedCategories();
    const adminRole = await seedPermissionsAndRoles();
    const users = await seedUsers(adminRole.id);
    await seedProductsAndVariants(users);

    return NextResponse.json({ message: "🌱 Seeding completed!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Seed failed", detail: err },
      { status: 500 }
    );
  }
}
