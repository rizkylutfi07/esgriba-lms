import { IsString, IsOptional, IsEnum, IsInt, IsArray, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';

export class CreateQuestionBankDto {
    @IsOptional()
    @IsString()
    subjectId?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsString()
    @IsNotEmpty()
    questionText: string;

    @IsEnum(QuestionType, { message: 'questionType must be one of: MULTIPLE_CHOICE, ESSAY, TRUE_FALSE, SHORT_ANSWER' })
    @IsNotEmpty()
    questionType: QuestionType;

    @IsString()
    @IsOptional()
    expectedAnswer?: string;

    @IsInt()
    @Min(1)
    @Max(3)
    @IsOptional()
    @Type(() => Number)
    difficultyLevel?: number;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    @Type(() => Number)
    points: number;

    @IsString()
    @IsOptional()
    explanation?: string;

    @IsOptional()
    options?: any; // JSON array for multiple choice

    @IsOptional()
    correctAnswer?: any; // JSON for correct answer(s)
}

export class UpdateQuestionBankDto {
    @IsString()
    @IsOptional()
    subjectId?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    questionText?: string;

    @IsEnum(QuestionType)
    @IsOptional()
    questionType?: QuestionType;

    @IsString()
    @IsOptional()
    expectedAnswer?: string;

    @IsInt()
    @Min(1)
    @Max(3)
    @IsOptional()
    difficultyLevel?: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    points?: number;

    @IsString()
    @IsOptional()
    explanation?: string;

    @IsOptional()
    options?: any;

    @IsOptional()
    correctAnswer?: any;
}

export class BulkAddToTestDto {
    @IsArray()
    @IsString({ each: true })
    questionIds: string[];

    @IsString()
    testId: string;
}
