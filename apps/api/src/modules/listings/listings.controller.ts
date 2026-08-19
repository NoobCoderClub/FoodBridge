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
import { ClaimsService } from '../claims/claims.service';
import { BrowseListingsDto } from './dto/browse-listings.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingsService } from './listings.service';

@Controller('listings')
@UseGuards(AuthGuard, StatusGuard)
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly claimsService: ClaimsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('member')
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateListingDto) {
    return this.listingsService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('member')
  browse(@Req() req: AuthenticatedRequest, @Query() query: BrowseListingsDto) {
    return this.listingsService.browse(req.user.id, query.lat, query.lng);
  }

  // Declared before `:id` — Nest matches routes in declaration order, so the
  // literal path must win over the parameterised one.
  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles('member')
  listMine(@Req() req: AuthenticatedRequest) {
    return this.listingsService.listMine(req.user.id);
  }

  @Get(':id')
  getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listingsService.getById(id, req.user.id);
  }

  @Post(':id/claim')
  @UseGuards(RolesGuard)
  @Roles('member')
  claim(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.claimsService.claim(id, req.user.id);
  }
}
