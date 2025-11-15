// /app/api/dev/seed/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
const prisma = new PrismaClient();

const DUMMY_PASSWORD =
  "$argon2id$v=19$m=65536,t=3,p=4$oTfBlJjwFXLyr8hj8I8LrQ$7vd6LYWLfrzgXSaWiuwXFMkrH6O9t0Jlw+/f4WwyIlQ";

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
        await createCategory(faker.commerce.department(), category.id, depth + 1);
      }
    }

    return category;
  };

  for (let i = 0; i < 3; i++) {
    await createCategory(faker.commerce.department(), null, 0);
  }
}

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

async function seedUsers(roleId: number) {
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

async function seedProductsAndVariants(users: any[]) {
  const categories = await prisma.category.findMany({
    take: 5,
    orderBy: { id: "asc" },
  });

  for (let i = 0; i < 10; i++) {
    const product = await prisma.product.create({
      data: {
        title: faker.commerce.productName(),
        description: { text: faker.commerce.productDescription() },
        price: Number(faker.commerce.price()),
        slug: faker.string.uuid(),
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
        uploadedById: users[Math.floor(Math.random() * users.length)].id,
        visibility: "PUBLIC",
        slug: faker.string.uuid(),
        productId: product.id,
      },
    });
  }
}

export async function POST() {
  try {
    console.log("🌱 Seeding...");

    await seedCategories();
    const adminRole = await seedPermissionsAndRoles();
    const users = await seedUsers(adminRole.id);
    await seedProductsAndVariants(users);

    return NextResponse.json({ message: "🌱 Seeding completed!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Seed failed", detail: err }, { status: 500 });
  }
}
