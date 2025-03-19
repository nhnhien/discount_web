export const normalizeValues = (values) =>
    Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value ?? '']));