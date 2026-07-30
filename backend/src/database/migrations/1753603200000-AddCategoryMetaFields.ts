import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryMetaFields1753603200000 implements MigrationInterface {
  name = 'AddCategoryMetaFields1753603200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `categories` ADD `meta_title` varchar(255) NULL');
    await queryRunner.query('ALTER TABLE `categories` ADD `meta_description` varchar(255) NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `categories` DROP COLUMN `meta_description`');
    await queryRunner.query('ALTER TABLE `categories` DROP COLUMN `meta_title`');
  }
}
