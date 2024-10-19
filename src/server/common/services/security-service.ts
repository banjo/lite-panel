import { hash } from "bcrypt";

const hashPassword = (password: string) => hash(password, 10);

export const SecurityService = { hashPassword };
