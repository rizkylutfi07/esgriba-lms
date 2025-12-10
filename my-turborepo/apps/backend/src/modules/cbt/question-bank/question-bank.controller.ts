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
    BadRequestException,
} from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionBankDto, UpdateQuestionBankDto, BulkAddToTestDto } from './dto/question-bank.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('cbt/question-bank')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionBankController {
    constructor(private readonly questionBankService: QuestionBankService) { }

    @Post()
    @Roles('GURU', 'ADMIN')
    create(@Request() req, @Body() createQuestionBankDto: CreateQuestionBankDto) {
        const createdBy = req.user.guruId || req.user.userId;
        return this.questionBankService.create(createdBy, createQuestionBankDto);
    }

    @Get()
    @Roles('GURU', 'ADMIN')
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('subjectId') subjectId?: string,
        @Query('category') category?: string,
        @Query('difficultyLevel') difficultyLevel?: string,
        @Query('questionType') questionType?: string,
        @Query('search') search?: string,
        @Query('myQuestions') myQuestions?: string,
        @Request() req?,
    ) {
        const pageNum = parseInt(page || '1');
        const limitNum = parseInt(limit || '10');
        const skip = (pageNum - 1) * limitNum;

        return this.questionBankService.findAll({
            skip,
            take: limitNum,
            subjectId,
            category,
            difficultyLevel: difficultyLevel ? parseInt(difficultyLevel) : undefined,
            questionType,
            search,
            createdBy: myQuestions === 'true' ? (req.user.guruId || req.user.userId) : undefined,
        });
    }

    @Get('categories')
    @Roles('GURU', 'ADMIN')
    getCategories(@Query('subjectId') subjectId?: string) {
        return this.questionBankService.getCategories(subjectId);
    }

    @Get(':id')
    @Roles('GURU', 'ADMIN')
    findOne(@Param('id') id: string) {
        return this.questionBankService.findOne(id);
    }

    @Patch(':id')
    @Roles('GURU', 'ADMIN')
    update(
        @Param('id') id: string,
        @Request() req,
        @Body() updateQuestionBankDto: UpdateQuestionBankDto,
    ) {
        const creatorId = req.user.guruId || req.user.userId;
        return this.questionBankService.update(id, creatorId, req.user.role, updateQuestionBankDto);
    }

    @Delete(':id')
    @Roles('GURU', 'ADMIN')
    remove(@Param('id') id: string, @Request() req) {
        const creatorId = req.user.guruId || req.user.userId;
        return this.questionBankService.remove(id, creatorId, req.user.role);
    }

    @Post(':id/duplicate')
    @Roles('GURU', 'ADMIN')
    duplicate(@Param('id') id: string, @Request() req) {
        const creatorId = req.user.guruId || req.user.userId;
        return this.questionBankService.duplicate(id, creatorId);
    }

    @Post('bulk-add-to-test')
    @Roles('GURU', 'ADMIN')
    bulkAddToTest(@Body() bulkAddDto: BulkAddToTestDto) {
        return this.questionBankService.bulkAddToTest(bulkAddDto);
    }
}
