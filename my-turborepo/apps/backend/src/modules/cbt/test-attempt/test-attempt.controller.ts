import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { TestAttemptService } from './test-attempt.service';
import { StartTestDto, SubmitAnswerDto, RecordEventDto } from './dto/test-attempt.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('cbt/test-attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestAttemptController {
    constructor(private readonly testAttemptService: TestAttemptService) { }

    @Post('start')
    @Roles('SISWA')
    startTest(@Request() req, @Body() startTestDto: StartTestDto) {
        const siswaId = req.user.siswaId || req.user.userId;
        return this.testAttemptService.startTest(siswaId, startTestDto);
    }

    @Get('my-attempts')
    @Roles('SISWA')
    getMyAttempts(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
        const pageNum = parseInt(page || '1');
        const limitNum = parseInt(limit || '10');
        const skip = (pageNum - 1) * limitNum;
        const siswaId = req.user.siswaId || req.user.userId;

        return this.testAttemptService.getMyAttempts(siswaId, {
            skip,
            take: limitNum,
        });
    }

    @Get(':id')
    @Roles('SISWA')
    getAttempt(@Param('id') id: string, @Request() req) {
        const siswaId = req.user.siswaId || req.user.userId;
        return this.testAttemptService.getAttempt(id, siswaId);
    }

    @Post(':id/submit-answer')
    @Roles('SISWA')
    submitAnswer(@Param('id') attemptId: string, @Request() req, @Body() submitAnswerDto: SubmitAnswerDto) {
        const siswaId = req.user.siswaId || req.user.userId;
        return this.testAttemptService.submitAnswer(attemptId, siswaId, submitAnswerDto);
    }

    @Post(':id/finish')
    @Roles('SISWA')
    finishTest(@Param('id') attemptId: string, @Request() req) {
        const siswaId = req.user.siswaId || req.user.userId;
        return this.testAttemptService.finishTest(attemptId, siswaId);
    }

    @Post(':id/record-event')
    @Roles('SISWA')
    recordEvent(@Param('id') attemptId: string, @Request() req, @Body() recordEventDto: RecordEventDto) {
        const siswaId = req.user.siswaId || req.user.userId;
        return this.testAttemptService.recordEvent(attemptId, siswaId, recordEventDto);
    }

    @Get(':id/result')
    @Roles('SISWA')
    getResult(@Param('id') attemptId: string, @Request() req) {
        const siswaId = req.user.siswaId || req.user.userId;
        return this.testAttemptService.getAttemptResult(attemptId, siswaId);
    }

    // For teachers/admin
    @Get('test/:testId/attempts')
    @Roles('GURU', 'ADMIN')
    getTestAttempts(
        @Param('testId') testId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNum = parseInt(page || '1');
        const limitNum = parseInt(limit || '10');
        const skip = (pageNum - 1) * limitNum;

        return this.testAttemptService.getTestAttempts(testId, {
            skip,
            take: limitNum,
        });
    }
}
