export const arrayUpdate = (
  array: any,
  condition: (item: any) => boolean,
  getChanges: (item: any) => any
) => {
  return array.map((item: any) =>
    condition(item) ? { ...item, ...getChanges(item) } : item
  );
};
