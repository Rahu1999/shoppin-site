import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateModuleSettings1754017000000 implements MigrationInterface {
  name = 'CreateModuleSettings1754017000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`module_settings\` (
        \`id\` varchar(36) NOT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        \`module_key\` varchar(50) NOT NULL,
        \`label\` varchar(100) NOT NULL,
        \`is_enabled\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_module_settings_module_key\` (\`module_key\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      INSERT INTO \`module_settings\` (\`id\`, \`module_key\`, \`label\`, \`is_enabled\`) VALUES
        (UUID(), 'blog', 'Blog', 1),
        (UUID(), 'catalogue', 'Catalogue', 1),
        (UUID(), 'coupons', 'Coupons', 1),
        (UUID(), 'reviews', 'Reviews', 1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `module_settings`');
  }
}
