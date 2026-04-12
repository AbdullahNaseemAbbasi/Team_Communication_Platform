import {
  Controller,
  Get,
  Patch,
  Body,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UploadService } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController { 
  constructor(
    private usersService: UsersService,
    private uploadService: UploadService,
  ) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return null;

    const { password, otpCode, otpExpiry, ...profile } = user.toObject();
    return profile;
  }

  @Patch('me')
  async updateProfile(
    @Request() req: any,
    @Body() dto: UpdateProfileDto,
  ) {
    const updateData: Record<string, any> = {};

    if (dto.displayName !== undefined) updateData.displayName = dto.displayName;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    if (dto.customStatus !== undefined) updateData.customStatus = dto.customStatus;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.theme !== undefined) {
      updateData['preferences.theme'] = dto.theme;
    }

    const user = await this.usersService.updateById(req.user.id, updateData);
    if (!user) return null;

    const { password, otpCode, otpExpiry, ...profile } = user.toObject();
    return profile;
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new Error('Only image files are allowed'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.uploadService.uploadFile(file, 'teamchat/avatars');

    const user = await this.usersService.updateById(req.user.id, {
      avatar: result.url,
    });

    if (!user) return null;

    const { password, otpCode, otpExpiry, ...profile } = user.toObject();
    return profile;
  }
}
