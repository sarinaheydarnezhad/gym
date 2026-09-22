export const studentShareUrl = (studentId: string, view?: string) => `${window.location.origin}${window.location.pathname}?student=${encodeURIComponent(studentId)}${view ? `&view=${encodeURIComponent(view)}` : ''}`

export const normalizeIranianPhone = (phone: string) => phone.replace(/\D/g, '').replace(/^0/, '98')
