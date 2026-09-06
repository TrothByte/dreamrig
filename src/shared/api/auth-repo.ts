import type { AuthProfile, SignInInput, SignUpInput } from '../model/auth'

export interface AuthRepository {
  getSession(): Promise<AuthProfile | null>
  signUp(input: SignUpInput): Promise<AuthProfile | null>
  signIn(input: SignInInput): Promise<AuthProfile>
  signOut(): Promise<void>
  onAuthStateChange(listener: (profile: AuthProfile | null) => void): () => void
}
