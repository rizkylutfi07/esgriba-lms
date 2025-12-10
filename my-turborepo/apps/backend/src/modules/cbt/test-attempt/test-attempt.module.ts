import { Module } from '@nestjs/common';
import { TestAttemptService } from './test-attempt.service';
import { TestAttemptController } from './test-attempt.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [TestAttemptController],
    providers: [TestAttemptService],
    exports: [TestAttemptService],
})
export class TestAttemptModule { }
