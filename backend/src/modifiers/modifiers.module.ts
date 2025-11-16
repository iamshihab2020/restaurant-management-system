import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModifiersService } from './modifiers.service';
import { ModifiersController } from './modifiers.controller';
import { ModifierGroup, ModifierGroupSchema } from './schemas/modifier-group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModifierGroup.name, schema: ModifierGroupSchema },
    ]),
  ],
  controllers: [ModifiersController],
  providers: [ModifiersService],
  exports: [ModifiersService],
})
export class ModifiersModule {}
