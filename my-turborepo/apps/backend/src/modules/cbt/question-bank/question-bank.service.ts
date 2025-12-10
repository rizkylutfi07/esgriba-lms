import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateQuestionBankDto, UpdateQuestionBankDto, BulkAddToTestDto } from './dto/question-bank.dto';

@Injectable()
export class QuestionBankService {
    constructor(private prisma: PrismaService) { }

    async create(createdBy: string, dto: CreateQuestionBankDto) {
        const question = await this.prisma.questionBank.create({
            data: {
                ...dto,
                createdBy,
            },
        });

        // Fetch with relations
        return this.prisma.questionBank.findUnique({
            where: { id: question.id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        subjectId?: string;
        category?: string;
        difficultyLevel?: number;
        questionType?: string;
        search?: string;
        createdBy?: string;
    }) {
        const { skip = 0, take = 10, subjectId, category, difficultyLevel, questionType, search, createdBy } = params;

        const where: any = {
            deletedAt: null,
        };

        if (subjectId) where.subjectId = subjectId;
        if (category) where.category = category;
        if (difficultyLevel) where.difficultyLevel = difficultyLevel;
        if (questionType) where.questionType = questionType;
        if (createdBy) where.createdBy = createdBy;
        if (search) {
            where.OR = [
                { questionText: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.questionBank.findMany({
                where,
                skip,
                take,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    subject: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.questionBank.count({ where }),
        ]);

        return {
            data,
            total,
            page: Math.floor(skip / take) + 1,
            totalPages: Math.ceil(total / take),
        };
    }

    async findOne(id: string) {
        const question = await this.prisma.questionBank.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!question || question.deletedAt) {
            throw new NotFoundException('Question not found');
        }

        return question;
    }

    async update(id: string, userId: string, userRole: string, dto: UpdateQuestionBankDto) {
        const question = await this.findOne(id);

        // Only creator or admin can update
        if (question.createdBy !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You can only update your own questions');
        }

        return this.prisma.questionBank.update({
            where: { id },
            data: dto,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const question = await this.findOne(id);

        // Only creator or admin can delete
        if (question.createdBy !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You can only delete your own questions');
        }

        // Soft delete
        return this.prisma.questionBank.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async duplicate(id: string, creatorId: string) {
        const original = await this.prisma.questionBank.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                subject: { select: { id: true, name: true } },
            },
        });

        if (!original) {
            throw new NotFoundException('Question not found');
        }

        // Exclude relations and id from the duplicate
        const { id: _, creator, subject, createdAt, updatedAt, deletedAt, usageCount, ...questionData } = original;

        return this.prisma.questionBank.create({
            data: {
                ...questionData,
                createdBy: creatorId,
                usageCount: 0,
                // Cast JsonValue to proper Prisma input types
                options: questionData.options as any,
                correctAnswer: questionData.correctAnswer as any,
            },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                subject: { select: { id: true, name: true } },
            },
        });
    }

    async getCategories(subjectId?: string) {
        const where: any = {
            deletedAt: null,
        };

        if (subjectId) {
            where.subjectId = subjectId;
        }

        const categories = await this.prisma.questionBank.findMany({
            where,
            select: {
                category: true,
            },
            distinct: ['category'],
        });

        return categories.map((c) => c.category).filter(Boolean);
    }

    async bulkAddToTest(dto: BulkAddToTestDto) {
        const { questionIds, testId } = dto;

        // Get test to verify it exists
        const test = await this.prisma.test.findUnique({
            where: { id: testId },
            include: {
                questions: true,
            },
        });

        if (!test) {
            throw new NotFoundException('Test not found');
        }

        // Get questions from bank
        const bankQuestions = await this.prisma.questionBank.findMany({
            where: {
                id: { in: questionIds },
                deletedAt: null,
            },
        });

        if (bankQuestions.length !== questionIds.length) {
            throw new NotFoundException('Some questions not found');
        }

        // Create questions in test
        const currentOrder = test.questions.length;
        const newQuestions = await Promise.all(
            bankQuestions.map(async (bq, index) => {
                // Create question
                const question = await this.prisma.question.create({
                    data: {
                        testId,
                        questionText: bq.questionText,
                        questionType: bq.questionType,
                        expectedAnswer: bq.expectedAnswer,
                        points: bq.points,
                        order: currentOrder + index,
                    },
                });

                // If multiple choice, create options
                if (bq.questionType === 'MULTIPLE_CHOICE' && bq.options) {
                    const options = Array.isArray(bq.options) ? bq.options : [];
                    const correctAnswers = Array.isArray(bq.correctAnswer) ? bq.correctAnswer : [];

                    await Promise.all(
                        options.map((opt: any, optIndex: number) =>
                            this.prisma.questionOption.create({
                                data: {
                                    questionId: question.id,
                                    optionText: typeof opt === 'string' ? opt : opt.text || opt.optionText,
                                    isCorrect: correctAnswers.includes(opt) || correctAnswers.includes(optIndex),
                                    order: optIndex,
                                },
                            }),
                        ),
                    );
                }

                // Increment usage count
                await this.prisma.questionBank.update({
                    where: { id: bq.id },
                    data: {
                        usageCount: {
                            increment: 1,
                        },
                    },
                });

                return question;
            }),
        );

        // Update test total questions and points
        const totalPoints = await this.prisma.question.aggregate({
            where: { testId },
            _sum: {
                points: true,
            },
            _count: true,
        });

        await this.prisma.test.update({
            where: { id: testId },
            data: {
                totalQuestions: totalPoints._count,
            },
        });

        return {
            message: 'Questions added to test successfully',
            addedCount: newQuestions.length,
        };
    }
}
