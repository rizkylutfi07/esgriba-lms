import { Module } from '@nestjs/common';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { TestModule } from './test/test.module';
import { TestAttemptModule } from './test-attempt/test-attempt.module';

@Module({
    imports: [
        QuestionBankModule,
        TestModule,
        TestAttemptModule,
    ],
    exports: [
        QuestionBankModule,
        TestModule,
        TestAttemptModule,
    ],
})
export class CbtModule { }
