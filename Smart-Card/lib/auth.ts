import * as bcrypt from 'bcryptjs'
import { sql } from './db'

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, email, username, first_name, last_name, company_name, created_at, updated_at
      FROM users
      WHERE email = ${email.toLowerCase()}
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('[v0] Error getting user by email:', error)
    throw error
  }
}

export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName?: string,
  username?: string,
  companyName?: string
) {
  try {
    const hashedPassword = await hashPassword(password)
    // Use email prefix as username if not provided
    const finalUsername = username ?? email.split('@')[0] + '_' + Date.now()

    const result = await sql`
      INSERT INTO users (email, password_hash, username, first_name, last_name, company_name)
      VALUES (
        ${email.toLowerCase()},
        ${hashedPassword},
        ${finalUsername},
        ${firstName},
        ${lastName ?? null},
        ${companyName ?? null}
      )
      RETURNING id, email, username, first_name, last_name, created_at
    `
    return result[0]
  } catch (error) {
    console.error('[v0] Error creating user:', error)
    throw error
  }
}

export async function verifyUserCredentials(email: string, password: string) {
  try {
    const result = await sql`
      SELECT id, email, username, first_name, last_name, password_hash
      FROM users
      WHERE email = ${email.toLowerCase()}
    `
    if (result.length === 0) return null

    const user = result[0]
    const passwordMatch = await verifyPassword(password, user.password_hash)
    if (!passwordMatch) return null

    return {
      id: String(user.id),
      email: user.email,
      name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.username,
    }
  } catch (error) {
    console.error('[v0] Error verifying credentials:', error)
    throw error
  }
}

export async function getUserById(id: number) {
  try {
    const result = await sql`
      SELECT id, email, username, first_name, last_name, company_name, created_at, updated_at
      FROM users
      WHERE id = ${id}
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('[v0] Error getting user by id:', error)
    throw error
  }
}

export async function updateUser(
  id: number,
  data: {
    first_name?: string
    last_name?: string
    company_name?: string
    username?: string
  }
) {
  try {
    const result = await sql`
      UPDATE users
      SET
        first_name   = COALESCE(${data.first_name   ?? null}, first_name),
        last_name    = COALESCE(${data.last_name    ?? null}, last_name),
        company_name = COALESCE(${data.company_name ?? null}, company_name),
        username     = COALESCE(${data.username     ?? null}, username),
        updated_at   = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, email, username, first_name, last_name, company_name, created_at, updated_at
    `
    return result[0] ?? null
  } catch (error) {
    console.error('[v0] Error updating user:', error)
    throw error
  }
}