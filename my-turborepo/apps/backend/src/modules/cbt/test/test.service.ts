import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
    CreateTestDto,
    UpdateTestDto,
    CreateQuestionDto,
    UpdateQuestionDto,
    AssignStudentsDto,
} from './dto/test.dto';

@Injectable()
export class TestService {
    constructor(private prisma: PrismaService) { }

    async create(createdBy: string, dto: CreateTestDto) {
        return this.prisma.test.create({
            data: {
                ...dto,
                createdBy,
                startTime: dto.startTime ? new Date(dto.startTime) : null,
                endTime: dto.endTime ? new Date(dto.endTime) : null,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                subject: true,
                class: true,
            },
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        subjectId?: string;
        classId?: string;
        status?: string;
        search?: string;
        createdBy?: string;
    }) {
        const { skip = 0, take = 10, subjectId, classId, status, search, createdBy } = params;

        const where: any = {
            deletedAt: null,
        };

        if (subjectId) where.subjectId = subjectId;
        if (classId) where.classId = classId;
        if (createdBy) where.createdBy = createdBy;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Status filter
        const now = new Date();
        if (status === 'active') {
            where.isActive = true;
            where.startTime = { lte: now };
            where.endTime = { gte: now };
        } else if (status === 'upcoming') {
            where.startTime = { gt: now };
        } else if (status === 'finished') {
            where.endTime = { lt: now };
        } else if (status === 'draft') {
            where.isActive = false;
        }

        const [data, total] = await Promise.all([
            this.prisma.test.findMany({
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
                    subject: true,
                    class: true,
                    _count: {
                        select: {
                            questions: true,
                            attempts: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.test.count({ where }),
        ]);

        return {
            data,
            total,
            page: Math.floor(skip / take) + 1,
            totalPages: Math.ceil(total / take),
        };
    }

    async findOne(id: string) {
        const test = await this.prisma.test.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                subject: true,
                class: true,
                questions: {
                    include: {
                        options: {
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                allowedStudents: {
                    select: {
                        id: true,
                        name: true,
                        nis: true,
                    },
                },
                _count: {
                    select: {
                        attempts: true,
                    },
                },
            },
        });

        if (!test || test.deletedAt) {
            throw new NotFoundException('Test not found');
        }

        return test;
    }

    async update(id: string, userId: string, userRole: string, dto: UpdateTestDto) {
        const test = await this.findOne(id);

        if (test.createdBy !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You can only update your own tests');
        }

        return this.prisma.test.update({
            where: { id },
            data: {
                ...dto,
                startTime: dto.startTime ? new Date(dto.startTime) : undefined,
                endTime: dto.endTime ? new Date(dto.endTime) : undefined,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                subject: true,
                class: true,
            },
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const test = await this.findOne(id);

        if (test.createdBy !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You can only delete your own tests');
        }

        // Soft delete
        return this.prisma.test.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async togglePublish(id: string, userId: string, userRole: string) {
        const test = await this.findOne(id);

        if (test.createdBy !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You can only publish your own tests');
        }

        return this.prisma.test.update({
            where: { id },
            data: {
                isActive: !test.isActive,
            },
        });
    }

    async duplicate(id: string, creatorId: string) {
        const original = await this.prisma.test.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                subject: true,
                class: true,
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });

        if (!original) {
            throw new NotFoundException('Test not found');
        }

        // Exclude relations, id, and timestamps from the duplicate
        const { id: _, creator, subject, class: testClass, questions, createdAt, updatedAt, deletedAt, totalQuestions, ...testData } = original;

        // Create the duplicated test
        const newTest = await this.prisma.test.create({
            data: {
                ...testData,
                title: `${original.title} (Copy)`,
                createdBy: creatorId,
                isActive: false,
            },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                subject: true,
                class: true,
            },
        });

        // Duplicate questions
        if (questions && questions.length > 0) {
            for (const question of questions) {
                const { id: qId, testId, createdAt: qCreatedAt, updatedAt: qUpdatedAt, options, ...questionData } = question;

                await this.prisma.question.create({
                    data: {
                        ...questionData,
                        testId: newTest.id,
                        options: options && options.length > 0 ? {
                            create: options.map(({ id: oId, questionId, createdAt: oCreatedAt, updatedAt: oUpdatedAt, ...optionData }) => optionData),
                        } : undefined,
                    },
                });
            }
        }

        return this.prisma.test.findUnique({
            where: { id: newTest.id },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                subject: true,
                class: true,
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });
    }

    // Question management
    async addQuestion(testId: string, dto: CreateQuestionDto) {
        const test = await this.prisma.test.findUnique({
            where: { id: testId },
            include: {
                questions: true,
            },
        });

        if (!test) {
            throw new NotFoundException('Test not found');
        }

        const order = dto.order !== undefined ? dto.order : test.questions.length;

        const { options, ...questionData } = dto;

        const question = await this.prisma.question.create({
            data: {
                ...questionData,
                testId,
                order,
            },
        });

        // Create options if provided
        if (options && options.length > 0) {
            await Promise.all(
                options.map((opt, index) =>
                    this.prisma.questionOption.create({
                        data: {
                            questionId: question.id,
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect,
                            order: opt.order !== undefined ? opt.order : index,
                        },
                    }),
                ),
            );
        }

        // Update test total
        await this.updateTestTotals(testId);

        return this.prisma.question.findUnique({
            where: { id: question.id },
            include: {
                options: true,
            },
        });
    }

    async updateQuestion(testId: string, questionId: string, dto: UpdateQuestionDto) {
        const question = await this.prisma.question.findFirst({
            where: {
                id: questionId,
                testId,
            },
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        const { options, ...questionData } = dto;

        const updated = await this.prisma.question.update({
            where: { id: questionId },
            data: questionData,
        });

        // Update options if provided
        if (options) {
            // Delete existing options
            await this.prisma.questionOption.deleteMany({
                where: { questionId },
            });

            // Create new options
            await Promise.all(
                options.map((opt, index) =>
                    this.prisma.questionOption.create({
                        data: {
                            questionId,
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect,
                            order: opt.order !== undefined ? opt.order : index,
                        },
                    }),
                ),
            );
        }

        await this.updateTestTotals(testId);

        return this.prisma.question.findUnique({
            where: { id: questionId },
            include: {
                options: true,
            },
        });
    }

    async deleteQuestion(testId: string, questionId: string) {
        const question = await this.prisma.question.findFirst({
            where: {
                id: questionId,
                testId,
            },
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        await this.prisma.question.delete({
            where: { id: questionId },
        });

        await this.updateTestTotals(testId);

        return { message: 'Question deleted successfully' };
    }

    async assignStudents(testId: string, dto: AssignStudentsDto) {
        const test = await this.prisma.test.findUnique({
            where: { id: testId },
        });

        if (!test) {
            throw new NotFoundException('Test not found');
        }

        // Update allowed students
        await this.prisma.test.update({
            where: { id: testId },
            data: {
                allowedStudents: {
                    set: dto.studentIds.map((id) => ({ id })),
                },
            },
        });

        return { message: 'Students assigned successfully' };
    }

    private async updateTestTotals(testId: string) {
        const totals = await this.prisma.question.aggregate({
            where: { testId },
            _sum: {
                points: true,
            },
            _count: true,
        });

        await this.prisma.test.update({
            where: { id: testId },
            data: {
                totalQuestions: totals._count,
            },
        });
    }

    // Auto-deactivate expired tests
    async autoDeactivateExpired() {
        const now = new Date();
        return this.prisma.test.updateMany({
            where: {
                isActive: true,
                endTime: {
                    lt: now,
                },
            },
            data: {
                isActive: false,
            },
        });
    }
}
