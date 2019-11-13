import { NgModule } from '@angular/core';
import { ModuleA } from './module-a/module-a.module';
import { ModuleB } from './module-b/module-b.module';

@NgModule({
  imports: [ModuleA, ModuleB]
})
export class AppModule {}
