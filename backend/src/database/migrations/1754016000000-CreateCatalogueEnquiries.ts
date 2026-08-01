import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalogueEnquiries1754016000000 implements MigrationInterface {
  name = 'CreateCatalogueEnquiries1754016000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`catalogue_enquiries\` (
        \`id\` varchar(36) NOT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        \`catalogue_item_id\` varchar(36) NULL,
        \`item_name_snapshot\` varchar(300) NOT NULL,
        \`customer_name\` varchar(150) NOT NULL,
        \`customer_phone\` varchar(20) NOT NULL,
        \`customer_email\` varchar(255) NULL,
        \`message\` text NOT NULL,
        \`status\` enum('new','contacted','closed') NOT NULL DEFAULT 'new',
        \`admin_notes\` text NULL,
        \`source\` varchar(30) NOT NULL DEFAULT 'catalogue',
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_catalogue_enquiries_status\` (\`status\`),
        INDEX \`IDX_catalogue_enquiries_catalogue_item_id\` (\`catalogue_item_id\`),
        CONSTRAINT \`FK_catalogue_enquiries_catalogue_item_id\` FOREIGN KEY (\`catalogue_item_id\`) REFERENCES \`catalogue_items\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `catalogue_enquiries`');
  }
}
