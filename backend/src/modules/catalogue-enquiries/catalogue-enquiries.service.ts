import { AppDataSource } from '@config/database';
import { CatalogueEnquiry } from '@entities/catalogue-enquiry.entity';
import { CatalogueItem } from '@entities/catalogue-item.entity';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';
import { EmailJobs } from '../../jobs/email.jobs';

export class CatalogueEnquiriesService {
  private enquiryRepo = AppDataSource.getRepository(CatalogueEnquiry);
  private itemRepo = AppDataSource.getRepository(CatalogueItem);

  public async createEnquiry(data: Record<string, any>) {
    let itemNameSnapshot = 'General enquiry';

    if (data.catalogueItemId) {
      const item = await this.itemRepo.findOneBy({ id: data.catalogueItemId });
      if (!item) throw AppError.notFound('Catalogue item');
      itemNameSnapshot = item.name;
    }

    const enquiry = this.enquiryRepo.create({
      ...data,
      itemNameSnapshot,
    });
    const saved = await this.enquiryRepo.save(enquiry);
    const savedEnquiry = Array.isArray(saved) ? saved[0] : saved;

    // Notify admin (fire and forget)
    EmailJobs.sendAdminNewEnquiryNotification({
      enquiryId: savedEnquiry.id,
      itemName: itemNameSnapshot,
      customerName: savedEnquiry.customerName,
      customerPhone: savedEnquiry.customerPhone,
      customerEmail: savedEnquiry.customerEmail,
      message: savedEnquiry.message,
    });

    return savedEnquiry;
  }

  public async getEnquiriesAdmin(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const queryBuilder = this.enquiryRepo.createQueryBuilder('enquiry')
      .orderBy('enquiry.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.status) {
      queryBuilder.andWhere('enquiry.status = :status', { status: query.status });
    }
    if (query.search) {
      const search = `%${query.search}%`;
      queryBuilder.andWhere(
        '(enquiry.customerName LIKE :search OR enquiry.customerPhone LIKE :search OR enquiry.itemNameSnapshot LIKE :search)',
        { search }
      );
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async updateEnquiryStatus(id: string, data: Record<string, any>) {
    const existing = await this.enquiryRepo.findOneBy({ id });
    if (!existing) throw AppError.notFound('Enquiry');

    await this.enquiryRepo.update(id, data);
    return this.enquiryRepo.findOneBy({ id });
  }
}
