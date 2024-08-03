import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();

    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async getAll({ limit, page }: PaginationDto) {
    const totalPages = await this.product.count({ where: { enabled: true } });
    const lastPage = Math.ceil(totalPages / limit);

    const products = await this.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        enabled: true,
      },
    });

    return {
      products,
      totalPages,
      page,
      lastPage,
    };
  }

  async getOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, enabled: true },
    });

    if (!product) {
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: __, ...data } = updateProductDto;

    await this.getOne(id);

    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async delete(id: number) {
    await this.getOne(id);

    const product = await this.product.update({
      where: { id },
      data: {
        enabled: false,
      },
    });

    return product;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }
}
