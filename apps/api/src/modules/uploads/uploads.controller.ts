import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StatusGuard } from '../auth/guards/status.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { StorageService } from '../storage/storage.service';
import { PresignUploadDto } from './dto/presign-upload.dto';

@Controller('uploads')
@UseGuards(AuthGuard, StatusGuard)
export class UploadsController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Hands back a short-lived URL the browser PUTs one listing photo to.
   *
   * The key is namespaced under the caller's own id, which is what lets
   * `StorageService.promoteToListing` later prove the member owns every image
   * they attach to a listing.
   */
  @Post('listing-image/presign')
  @UseGuards(RolesGuard)
  @Roles('member')
  presignListingImage(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PresignUploadDto,
  ) {
    return this.storageService.presignUpload(
      req.user.id,
      dto.contentType,
      dto.contentLength,
    );
  }
}
