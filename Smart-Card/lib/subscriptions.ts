import { sql } from './db'

export type PlanType = 'free' | 'basic' | 'pro' | 'premium'

export const PLAN_FEATURES: Record<PlanType, {
  name: string
  price: number
  cards: number
  analyticsRetention: number
  teamMembers: number
  customColors: boolean
  apiAccess: boolean
  support: string
}> = {
  free: {
    name: 'Free',
    price: 0,
    cards: 1,
    analyticsRetention: 30,
    teamMembers: 0,
    customColors: false,
    apiAccess: false,
    support: 'Community',
  },
  basic: {
    name: 'Basic',
    price: 9,
    cards: 5,
    analyticsRetention: 90,
    teamMembers: 0,
    customColors: true,
    apiAccess: false,
    support: 'Email',
  },
  pro: {
    name: 'Pro',
    price: 29,
    cards: 999999,
    analyticsRetention: 365,
    teamMembers: 5,
    customColors: true,
    apiAccess: true,
    support: 'Priority',
  },
  premium: {
    name: 'Premium',
    price: 99,
    cards: 999999,
    analyticsRetention: 999999,
    teamMembers: 999999,
    customColors: true,
    apiAccess: true,
    support: '24/7 Dedicated',
  },
}

export async function getUserSubscription(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM subscriptions WHERE user_id = ${userId}
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('[v0] Error getting subscription:', error)
    throw error
  }
}

export async function getUserPlan(userId: number): Promise<PlanType> {
  try {
    const subscription = await getUserSubscription(userId)
    return (subscription?.plan as PlanType) || 'free'
  } catch (error) {
    console.error('[v0] Error getting user plan:', error)
    return 'free'
  }
}

export async function canCreateCard(userId: number): Promise<boolean> {
  try {
    const plan = await getUserPlan(userId)
    const maxCards = PLAN_FEATURES[plan].cards

    const result = await sql`
      SELECT COUNT(*) as count FROM business_cards WHERE user_id = ${userId}
    `
    
    const cardCount = result[0]?.count || 0
    return cardCount < maxCards
  } catch (error) {
    console.error('[v0] Error checking card creation ability:', error)
    return false
  }
}

export async function checkFeatureAccess(userId: number, feature: keyof Omit<typeof PLAN_FEATURES.free, 'name' | 'price'>): Promise<boolean> {
  try {
    const plan = await getUserPlan(userId)
    const planFeatures = PLAN_FEATURES[plan]
    
    if (feature === 'customColors' || feature === 'apiAccess') {
      return planFeatures[feature] as boolean
    }
    
    if (feature === 'teamMembers') {
      return planFeatures[feature] > 0
    }
    
    return true
  } catch (error) {
    console.error('[v0] Error checking feature access:', error)
    return false
  }
}
