import bcrypt from 'bcryptjs'
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
      SELECT id, email, name, profile_image, bio, location, created_at, updated_at
      FROM users
      WHERE email = ${email.toLowerCase()}
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('[v0] Error getting user by email:', error)
    throw error
  }
}

export async function createUser(email: string, password: string, name: string) {
  try {
    const hashedPassword = await hashPassword(password)
    const result = await sql`
      INSERT INTO users (email, password, name)
      VALUES (${email.toLowerCase()}, ${hashedPassword}, ${name})
      RETURNING id, email, name, created_at
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
      SELECT id, email, name, password
      FROM users
      WHERE email = ${email.toLowerCase()}
    `
    if (result.length === 0) return null

    const user = result[0]
    const passwordMatch = await verifyPassword(password, user.password)
    if (!passwordMatch) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  } catch (error) {
    console.error('[v0] Error verifying credentials:', error)
    throw error
  }
}

export async function getUserById(id: number) {
  try {
    const result = await sql`
      SELECT id, email, name, profile_image, bio, location, created_at, updated_at
      FROM users
      WHERE id = ${id}
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('[v0] Error getting user by id:', error)
    throw error
  }
}

export async function updateUser(id: number, data: { name?: string; bio?: string; location?: string; profile_image?: string }) {
  try {
    const updates = []
    const values = []
    let valueIndex = 1

    if (data.name !== undefined) {
      updates.push(`name = $${valueIndex}`)
      values.push(data.name)
      valueIndex++
    }
    if (data.bio !== undefined) {
      updates.push(`bio = $${valueIndex}`)
      values.push(data.bio)
      valueIndex++
    }
    if (data.location !== undefined) {
      updates.push(`location = $${valueIndex}`)
      values.push(data.location)
      valueIndex++
    }
    if (data.profile_image !== undefined) {
      updates.push(`profile_image = $${valueIndex}`)
      values.push(data.profile_image)
      valueIndex++
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    if (updates.length === 1) return null // Only has updated_at

    const result = await sql`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ${id}
      RETURNING id, email, name, profile_image, bio, location, created_at, updated_at
    `
    return result[0]
  } catch (error) {
    console.error('[v0] Error updating user:', error)
    throw error
  }
}
