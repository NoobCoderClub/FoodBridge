import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StatusGuard } from '../auth/guards/status.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { BrowseListingsDto } from './dto/browse-listings.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingsService } from './listings.service';

@Controller('listings')
@UseGuards(AuthGuard, StatusGuard)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('poster')
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateListingDto) {
    return this.listingsService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('taker')
  browse(@Query() query: BrowseListingsDto) {
    return this.listingsService.browse(query.lat, query.lng);
  }

  @Get(':id')
  getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listingsService.getById(id, req.user.id);
  }
}
