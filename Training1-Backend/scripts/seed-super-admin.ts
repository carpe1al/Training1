import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function seed() {
  try {
    // Create default tenant
    const tenant = await db.tenant.upsert({
      where: { slug: 'broker1' },
      update: {},
      create: {
        slug: 'broker1',
        name: 'Broker One',
        plan: 'standard'
      }
    });

    console.log('✅ Created tenant:', tenant.name);

    // Create super admin user
    const superAdmin = await db.user.upsert({
      where: { 
        tenantId_email: { 
          tenantId: tenant.id, 
          email: 'super@training1.com' 
        } 
      },
      update: { 
        roles: ['SUPER_ADMIN', 'BROKER_ADMIN'] 
      },
      create: {
        tenantId: tenant.id,
        email: 'super@training1.com',
        givenName: 'Super',
        familyName: 'Admin',
        roles: ['SUPER_ADMIN', 'BROKER_ADMIN']
      }
    });

    console.log('✅ Created super admin:', superAdmin.email);

    console.log('🌱 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seed;