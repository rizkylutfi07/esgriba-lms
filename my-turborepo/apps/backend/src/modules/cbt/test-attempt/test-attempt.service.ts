import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { StartTestDto, SubmitAnswerDto, RecordEventDto } from './dto/test-attempt.dto';

@Injectable()
export class TestAttemptService {
    constructor(private prisma: PrismaService) { }

    async startTest(siswaId: string, dto: StartTestDto) {
        const { testId } = dto;

        // Get test
        const test = await this.prisma.test.findUnique({
            where: { id: testId },
            include: {
                allowedStudents: true,
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });

        if (!test || test.deletedAt) {
            throw new NotFoundException('Test not found');
        }

        // Check if test is active
        if (!test.isActive) {
            throw new BadRequestException('Test is not active');
        }

        // Check time window
        const now = new Date();
        if (test.startTime && now < test.startTime) {
            throw new BadRequestException('Test has not started yet');
        }
        if (test.endTime && now > test.endTime) {
            throw new BadRequestException('Test has ended');
        }

        // Check if student is allowed (if allowedStudents is set)
        if (test.allowedStudents.length > 0) {
            const isAllowed = test.allowedStudents.some((s) => s.id === siswaId);
            if (!isAllowed) {
                throw new ForbiddenException('You are not allowed to take this test');
            }
        }

        // Check if student already has an active attempt
        const existingAttempt = await this.prisma.testAttempt.findFirst({
            where: {
                testId,
                siswaId,
                status: 'IN_PROGRESS',
            },
        });

        if (existingAttempt) {
            // Return existing attempt
            return this.getAttempt(existingAttempt.id, siswaId);
        }

        // Create new attempt
        const attempt = await this.prisma.testAttempt.create({
            data: {
                testId,
                siswaId,
                status: 'IN_PROGRESS',
                lastActivityAt: new Date(),
            },
            include: {
                test: {
                    include: {
                        questions: {
                            include: {
                                options: {
                                    select: {
                                        id: true,
                                        optionText: true,
                                        order: true,
                                        // Don't send isCorrect to student
                                    },
                                },
                            },
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                },
            },
        });

        return attempt;
    }

    async getAttempt(attemptId: string, siswaId: string) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: {
                    include: {
                        questions: {
                            include: {
                                options: {
                                    select: {
                                        id: true,
                                        optionText: true,
                                        order: true,
                                    },
                                },
                            },
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                },
                answers: true,
            },
        });

        if (!attempt) {
            throw new NotFoundException('Attempt not found');
        }

        if (attempt.siswaId !== siswaId) {
            throw new ForbiddenException('This is not your attempt');
        }

        return attempt;
    }

    async submitAnswer(attemptId: string, siswaId: string, dto: SubmitAnswerDto) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: true,
            },
        });

        if (!attempt) {
            throw new NotFoundException('Attempt not found');
        }

        if (attempt.siswaId !== siswaId) {
            throw new ForbiddenException('This is not your attempt');
        }

        if (attempt.status !== 'IN_PROGRESS') {
            throw new BadRequestException('Attempt is not in progress');
        }

        if (attempt.isBlocked) {
            throw new BadRequestException('You have been blocked from this test');
        }

        // Get question
        const question = await this.prisma.question.findUnique({
            where: { id: dto.questionId },
            include: {
                options: true,
            },
        });

        if (!question || question.testId !== attempt.testId) {
            throw new NotFoundException('Question not found');
        }

        // Check if answer already exists
        const existingAnswer = await this.prisma.userAnswer.findFirst({
            where: {
                attemptId,
                questionId: dto.questionId,
            },
        });

        let isCorrect = false;
        let pointsEarned = 0;

        // Auto-grade multiple choice
        if (question.questionType === 'MULTIPLE_CHOICE') {
            const correctOption = question.options.find((opt) => opt.isCorrect);
            if (correctOption && dto.answerText === correctOption.id) {
                isCorrect = true;
                pointsEarned = question.points;
            }
        }

        if (existingAnswer) {
            // Update existing answer
            return this.prisma.userAnswer.update({
                where: { id: existingAnswer.id },
                data: {
                    answerText: dto.answerText,
                    isCorrect,
                    pointsEarned,
                },
            });
        } else {
            // Create new answer
            return this.prisma.userAnswer.create({
                data: {
                    attemptId,
                    questionId: dto.questionId,
                    answerText: dto.answerText,
                    isCorrect,
                    pointsEarned,
                },
            });
        }
    }

    async finishTest(attemptId: string, siswaId: string) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: true,
                answers: true,
            },
        });

        if (!attempt) {
            throw new NotFoundException('Attempt not found');
        }

        if (attempt.siswaId !== siswaId) {
            throw new ForbiddenException('This is not your attempt');
        }

        if (attempt.status !== 'IN_PROGRESS') {
            throw new BadRequestException('Attempt is not in progress');
        }

        // Calculate score
        const totalPoints = attempt.answers.reduce((sum, ans) => sum + ans.pointsEarned, 0);
        const maxPoints = await this.prisma.question.aggregate({
            where: { testId: attempt.testId },
            _sum: {
                points: true,
            },
        });

        const score = maxPoints._sum.points ? (totalPoints / maxPoints._sum.points) * 100 : 0;
        const isPassed = score >= attempt.test.passingScore;

        // Update attempt
        return this.prisma.testAttempt.update({
            where: { id: attemptId },
            data: {
                finishedAt: new Date(),
                score,
                isPassed,
                status: 'COMPLETED',
            },
            include: {
                test: true,
                answers: {
                    include: {
                        question: {
                            include: {
                                options: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async recordEvent(attemptId: string, siswaId: string, dto: RecordEventDto) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: true,
            },
        });

        if (!attempt) {
            throw new NotFoundException('Attempt not found');
        }

        if (attempt.siswaId !== siswaId) {
            throw new ForbiddenException('This is not your attempt');
        }

        // Record event
        await this.prisma.testAttemptEvent.create({
            data: {
                attemptId,
                eventType: dto.eventType,
                description: dto.description,
                metadata: dto.metadata,
                triggeredBy: 'student',
            },
        });

        // Increment cheat count
        const newCheatCount = attempt.cheatCount + 1;

        // Check if should block (threshold: 3 violations)
        const shouldBlock = attempt.test.cheatDetectionEnabled && newCheatCount >= 3;

        if (shouldBlock) {
            await this.prisma.testAttempt.update({
                where: { id: attemptId },
                data: {
                    cheatCount: newCheatCount,
                    isBlocked: true,
                    blockedAt: new Date(),
                    blockedReason: 'Exceeded cheat detection threshold',
                    status: 'BLOCKED',
                },
            });

            // Record block event
            await this.prisma.testAttemptEvent.create({
                data: {
                    attemptId,
                    eventType: 'blocked',
                    description: 'System detected suspicious activity and blocked the test',
                    triggeredBy: 'system',
                },
            });

            throw new BadRequestException('You have been blocked from this test due to suspicious activity');
        } else {
            await this.prisma.testAttempt.update({
                where: { id: attemptId },
                data: {
                    cheatCount: newCheatCount,
                    lastActivityAt: new Date(),
                },
            });
        }

        return { message: 'Event recorded', cheatCount: newCheatCount };
    }

    async getMyAttempts(siswaId: string, params: { skip?: number; take?: number }) {
        const { skip = 0, take = 10 } = params;

        const [data, total] = await Promise.all([
            this.prisma.testAttempt.findMany({
                where: { siswaId },
                skip,
                take,
                include: {
                    test: {
                        select: {
                            id: true,
                            title: true,
                            duration: true,
                            passingScore: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.testAttempt.count({ where: { siswaId } }),
        ]);

        return {
            data,
            total,
            page: Math.floor(skip / take) + 1,
            totalPages: Math.ceil(total / take),
        };
    }

    async getAttemptResult(attemptId: string, siswaId: string) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: true,
                answers: {
                    include: {
                        question: {
                            include: {
                                options: true,
                            },
                        },
                    },
                },
            },
        });

        if (!attempt) {
            throw new NotFoundException('Attempt not found');
        }

        if (attempt.siswaId !== siswaId) {
            throw new ForbiddenException('This is not your attempt');
        }

        if (attempt.status === 'IN_PROGRESS') {
            throw new BadRequestException('Test is still in progress');
        }

        return attempt;
    }

    // For teachers/admin
    async getTestAttempts(testId: string, params: { skip?: number; take?: number }) {
        const { skip = 0, take = 10 } = params;

        const [data, total] = await Promise.all([
            this.prisma.testAttempt.findMany({
                where: { testId },
                skip,
                take,
                include: {
                    siswa: {
                        select: {
                            id: true,
                            name: true,
                            nis: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.testAttempt.count({ where: { testId } }),
        ]);

        return {
            data,
            total,
            page: Math.floor(skip / take) + 1,
            totalPages: Math.ceil(total / take),
        };
    }
}
