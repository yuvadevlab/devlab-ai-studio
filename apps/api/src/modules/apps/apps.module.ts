import { Module } from "@nestjs/common";
import { AppsController } from "./apps.controller";
import { AppsRepository } from "./apps.repository";
import { AppsService } from "./apps.service";

@Module({
  controllers: [AppsController],
  providers: [AppsRepository, AppsService],
  exports: [AppsService],
})
export class AppsModule {}
