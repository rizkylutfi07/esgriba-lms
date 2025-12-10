import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, IsArray, ValidateNested, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';

export class CreateTestDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @Min(1)
    duration: number; // in minutes

    @IsInt()
    @Min(0)
    passingScore: number;

    @IsBoolean()
    @IsOptional()
    cheatDetectionEnabled?: boolean;

    @IsDateString()
    @IsOptional()
    startTime?: string;

    @IsDateString()
    @IsOptional()
    endTime?: string;

    @IsString()
    @IsOptional()
    subjectId?: string;

    @IsString()
    @IsOptional()
    classId?: string;

    @IsInt()
    @IsOptional()
    session?: number;
}

export class UpdateTestDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    duration?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    passingScore?: number;

    @IsBoolean()
    @IsOptional()
    cheatDetectionEnabled?: boolean;

    @IsDateString()
    @IsOptional()
    startTime?: string;

    @IsDateString()
    @IsOptional()
    endTime?: string;

    @IsString()
    @IsOptional()
    subjectId?: string;

    @IsString()
    @IsOptional()
    classId?: string;

    @IsInt()
    @IsOptional()
    session?: number;
}

export class CreateQuestionDto {
    @IsString()
    questionText: string;

    @IsEnum(QuestionType)
    questionType: QuestionType;

    @IsString()
    @IsOptional()
    expectedAnswer?: string;

    @IsInt()
    @Min(1)
    points: number;

    @IsInt()
    @IsOptional()
    order?: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsArray()
    @IsOptional()
    options?: CreateQuestionOptionDto[];
}

export class CreateQuestionOptionDto {
    @IsString()
    optionText: string;

    @IsBoolean()
    isCorrect: boolean;

    @IsInt()
    @IsOptional()
    order?: number;
}

export class UpdateQuestionDto {
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
    @IsOptional()
    points?: number;

    @IsInt()
    @IsOptional()
    order?: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsArray()
    @IsOptional()
    options?: CreateQuestionOptionDto[];
}

export class AssignStudentsDto {
    @IsArray()
    @IsString({ each: true })
    studentIds: string[];
}
