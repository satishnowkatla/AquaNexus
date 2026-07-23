import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { User } from "../types";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; role: string } {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
}

export async function registerUser(data: {
  email: string;
  phone: string;
  password: string;
  full_name: string;
  role?: string;
}): Promise<{ user: User; token: string }> {
  const existing = await supabase.from("users").select("id").eq("email", data.email).single();
  if (existing.data) {
    throw ApiError.conflict("User with this email already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const { data: user, error } = await supabase
    .from("users")
    .insert({ ...data, password: hashedPassword, role: data.role || "fisher" })
    .select()
    .single();

  if (error) throw ApiError.internal(error.message);

  const token = generateToken(user.id, user.role);
  return { user, token };
}

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const token = generateToken(user.id, user.role);
  delete user.password;
  return { user, token };
}

export async function verifyOtp(phone: string, otp: string): Promise<{ user: User; token: string }> {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error || !user) {
    throw ApiError.notFound("User not found");
  }

  // In production, verify OTP against your OTP provider
  // For now, accept "123456" as valid OTP
  if (otp !== "123456") {
    throw ApiError.unauthorized("Invalid OTP");
  }

  const token = generateToken(user.id, user.role);
  return { user, token };
}
