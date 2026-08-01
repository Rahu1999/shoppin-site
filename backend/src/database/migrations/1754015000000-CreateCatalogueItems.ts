import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalogueItems1754015000000 implements MigrationInterface {
  name = 'CreateCatalogueItems1754015000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`catalogue_items\` (
        \`id\` varchar(36) NOT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        \`name\` varchar(300) NOT NULL,
        \`slug\` varchar(350) NOT NULL,
        \`description\` text NULL,
        \`images\` json NOT NULL,
        \`sizes\` json NOT NULL,
        \`category_id\` varchar(36) NULL,
        \`source_product_id\` varchar(36) NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`sort_order\` int NOT NULL DEFAULT 0,
        \`meta_title\` varchar(255) NULL,
        \`meta_description\` varchar(255) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_catalogue_items_slug\` (\`slug\`),
        INDEX \`IDX_catalogue_items_category_id\` (\`category_id\`),
        INDEX \`IDX_catalogue_items_is_active\` (\`is_active\`),
        CONSTRAINT \`FK_catalogue_items_category_id\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_catalogue_items_source_product_id\` FOREIGN KEY (\`source_product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `catalogue_items`');
  }
}
