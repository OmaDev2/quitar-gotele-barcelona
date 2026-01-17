/**
 * Utilerías para formatear enlaces de contacto (WhatsApp, Teléfono)
 */

/**
 * Limpia un número de teléfono para usar en URLs (removiendo espacios, +, etc.)
 */
export function formatPhoneForUrl(phone: string | undefined | null): string {
    if (!phone) return "";
    // Removemos todo lo que no sea un número
    return phone.replace(/\D/g, "");
}

/**
 * Genera un enlace de WhatsApp con un mensaje opcional
 */
export function generateWhatsAppUrl(phone: string | undefined | null, message: string = "Hola, vengo de la web Quitar Gotelé Barcelona. Necesito información"): string {
    const cleanPhone = formatPhoneForUrl(phone);
    if (!cleanPhone) return "#";

    // Si el número no tiene código de país y empieza con 6 o 7 (España), añadimos 34
    let finalPhone = cleanPhone;
    if (finalPhone.length === 9 && (finalPhone.startsWith("6") || finalPhone.startsWith("7"))) {
        finalPhone = "34" + finalPhone;
    }

    const url = new URL(`https://wa.me/${finalPhone}`);
    if (message) {
        url.searchParams.set("text", message);
    }
    return url.toString();
}

/**
 * Genera un enlace de teléfono (tel:)
 */
export function generateTelUrl(phone: string | undefined | null): string {
    const cleanPhone = formatPhoneForUrl(phone);
    return cleanPhone ? `tel:${cleanPhone}` : "#";
}
