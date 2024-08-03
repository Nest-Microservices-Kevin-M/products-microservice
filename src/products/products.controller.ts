import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'get_products' })
  getAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.getAll(paginationDto);
  }

  @MessagePattern({ cmd: 'get_product' })
  getOne(@Payload('id', ParseIntPipe) id: number) {
    return this.productsService.getOne(id);
  }

  @MessagePattern({ cmd: 'update_product' })
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  @MessagePattern({ cmd: 'delete_product' })
  delete(@Payload('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }

  @MessagePattern({ cmd: 'validate_product' })
  validateProducts(@Payload() ids: number[]) {
    return this.productsService.validateProducts(ids);
  }
}
