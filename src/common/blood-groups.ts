export const BLOOD_GROUPS = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'] as const;
export type BloodGroupKey = (typeof BLOOD_GROUPS)[number];

export const GENDERS = ['MALE', 'FEMALE'] as const;
export type GenderKey = (typeof GENDERS)[number];