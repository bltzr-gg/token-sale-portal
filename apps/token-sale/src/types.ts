export type GetArrayElementType<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
export type GetObjectValueType<ObjectType extends object> =
  ObjectType[keyof ObjectType];
