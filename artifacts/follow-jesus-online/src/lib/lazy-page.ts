import { createElement, lazy, type ComponentProps, type ComponentType } from "react";

/** A split page that can be fully prepared before the initial React commit. */
export function lazyPage<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
) {
  let ready: T | undefined;
  let pending: Promise<{ default: T }> | undefined;
  const preload = () => pending ??= loader().then(module => {
    ready = module.default;
    return module;
  });
  const Deferred = lazy(preload);
  const Page = (props: ComponentProps<T>) => createElement((ready ?? Deferred) as ComponentType<ComponentProps<T>>, props);
  return Object.assign(Page, { preload });
}
