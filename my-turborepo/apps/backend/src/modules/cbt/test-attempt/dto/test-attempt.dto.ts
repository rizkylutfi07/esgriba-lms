import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class StartTestDto {
    @IsString()
    testId: string;
}

export class SubmitAnswerDto {
    @IsString()
    questionId: string;

    @IsString()
    @IsOptional()
    answerText?: string;
}

export class FinishTestDto {
    // No additional fields needed, attemptId from params
}

export class RecordEventDto {
    @IsString()
    eventType: string; // 'tab_hidden', 'window_blur', etc.

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    metadata?: any;
}
