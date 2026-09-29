import { computed, ref } from 'vue'
import type { Company, User } from 'src/types/domain'
const currentUser = ref<User | null>(null)
const currentCompanyId = ref<number | null>(null)
const availableCompanies = ref<Company[]>([])
export function setSession(user: User) { currentUser.value = user; currentCompanyId.value = user.type === 'ADMIN' ? null : (user.companyAccess[0]?.companyId ?? null) }
export function clearSession() { currentUser.value = null; currentCompanyId.value = null }
export function setAvailableCompanies(companies: Company[]): void { availableCompanies.value = companies }
export function setCurrentCompany(companyId: number): boolean {
	const company = availableCompanies.value.find(item => item.id === companyId && item.active && item.status !== 'INACTIVE')
	if (!company || !currentUser.value) return false
	if (currentUser.value.type !== 'ADMIN' && !currentUser.value.companyAccess.some(access => access.companyId === companyId)) return false
	currentCompanyId.value = companyId
	return true
}
export function useSession() { return { currentUser: computed(() => currentUser.value), currentCompanyId: computed(() => currentCompanyId.value), availableCompanies: computed(() => availableCompanies.value), isAuthenticated: computed(() => currentUser.value !== null), setSession, clearSession, setAvailableCompanies, setCurrentCompany } }