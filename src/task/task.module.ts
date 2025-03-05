import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';

@Module({
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
