import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { TestService } from './test.service';
import {
    CreateTestDto,
    UpdateTestDto,
    CreateQuestionDto,
    UpdateQuestionDto,
    AssignStudentsDto,
} from './dto/test.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('cbt/tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
    constructor(private readonly testService: TestService) { }

    @Post()
    @Roles('GURU', 'ADMIN')
    create(@Request() req, @Body() createTestDto: CreateTestDto) {
        const creatorId = req.user.guruId || req.user.userId;
        return this.testService.create(creatorId, createTestDto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('subjectId') subjectId?: string,
        @Query('classId') classId?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('myTests') myTests?: string,
        @Request() req?,
    ) {
        const pageNum = parseInt(page || '1');
        const limitNum = parseInt(limit || '10');
        const skip = (pageNum - 1) * limitNum;

        return this.testService.findAll({
            skip,
            take: limitNum,
            subjectId,
            classId,
            status,
            search,
            createdBy: myTests === 'true' && req.user.role !== 'SISWA' ? (req.user.guruId || req.user.userId) : undefined,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.testService.findOne(id);
    }

    @Patch(':id')
    @Roles('GURU', 'ADMIN')
    update(@Param('id') id: string, @Request() req, @Body() updateTestDto: UpdateTestDto) {
        const creatorId = req.user.guruId || req.user.userId;
        return this.testService.update(id, creatorId, req.user.role, updateTestDto);
    }

    @Delete(':id')
    @Roles('GURU', 'ADMIN')
    remove(@Param('id') id: string, @Request() req) {
        const creatorId = req.user.guruId || req.user.userId;
        return this.testService.remove(id, creatorId, req.user.role);
    }

    @Post(':id/toggle-publish')
    @Roles('GURU', 'ADMIN')
    togglePublish(@Param('id') id: string, @Request() req) {
        const creatorId = req.user.guruId || req.user.userId;
        return this.testService.togglePublish(id, creatorId, req.user.role);
    }

    @Post(':id/duplicate')
    @Roles('GURU', 'ADMIN')
    duplicate(@Param('id') id: string, @Request() req) {
        const creatorId = req.user.guruId || req.user.userId;
        return this.testService.duplicate(id, creatorId);
    }

    // Question management
    @Post(':id/questions')
    @Roles('GURU', 'ADMIN')
    addQuestion(@Param('id') testId: string, @Body() createQuestionDto: CreateQuestionDto) {
        return this.testService.addQuestion(testId, createQuestionDto);
    }

    @Patch(':testId/questions/:questionId')
    @Roles('GURU', 'ADMIN')
    updateQuestion(
        @Param('testId') testId: string,
        @Param('questionId') questionId: string,
        @Body() updateQuestionDto: UpdateQuestionDto,
    ) {
        return this.testService.updateQuestion(testId, questionId, updateQuestionDto);
    }

    @Delete(':testId/questions/:questionId')
    @Roles('GURU', 'ADMIN')
    deleteQuestion(@Param('testId') testId: string, @Param('questionId') questionId: string) {
        return this.testService.deleteQuestion(testId, questionId);
    }

    @Post(':id/assign-students')
    @Roles('GURU', 'ADMIN')
    assignStudents(@Param('id') testId: string, @Body() assignStudentsDto: AssignStudentsDto) {
        return this.testService.assignStudents(testId, assignStudentsDto);
    }
}
