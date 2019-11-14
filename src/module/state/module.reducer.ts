import * as ModuleActions from './module.actions';
import { moduleService } from '../module.service';
import { Module } from '../module.class';

export const reducer = (state: any, action: any) => {
  switch (action.type) {
    case ModuleActions.ActionTypes.ReadModule:
      return {
        ...state,
        modules: [...state.modules, new Module(action.path, action.parent)]
      };

    case ModuleActions.ActionTypes.SaveModuleDecorator:
      return {
        ...state,
        modules: moduleService.saveModuleDecorator(state.modules, action)
      };

    case ModuleActions.ActionTypes.SaveModuleImports:
      return {
        ...state,
        modules: moduleService.saveModuleImports(state.modules, action)
      };

    case ModuleActions.ActionTypes.ExtendModuleDecoratorImports:
      return {
        ...state,
        modules: moduleService.extendModuleDecoratorImports(
          state.modules,
          action
        )
      };

    default:
      return state;
  }
};
